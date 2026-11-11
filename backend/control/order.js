const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/handleerror");
const catchAsyncErrors = require("../utils/asynerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const Product = require("../model/product");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");

// 1. Create New Order (Multi-Vendor Split + Atomic Concurrency Protection + Dynamic Shipping)
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        cart,
        shippingAddress,
        user,
        totalPrice,
        paymentInfo,
        customMeasurements,
        deliveryNotes,
        couponCode,
      } = req.body;

      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return next(new ErrorHandler("Cart is empty or invalid!", 400));
      }

      if (!shippingAddress || !user) {
        return next(
          new ErrorHandler("Shipping address and user details are required!", 400)
        );
      }

      // 1. ATOMIC INVENTORY CONCURRENCY CHECK & ALLOCATION
      // Decrement stock conditionally. If any item is out of stock, rollback all decremented items.
      const allocatedItems = [];
      try {
        for (const item of cart) {
          if (item._id) {
            const requestedQty = Number(item.qty) || 1;
            const updatedProduct = await Product.findOneAndUpdate(
              {
                _id: item._id,
                stock: { $gte: requestedQty },
              },
              {
                $inc: { stock: -requestedQty },
              },
              { new: true }
            );

            if (!updatedProduct) {
              // Rollback previously allocated items
              for (const alloc of allocatedItems) {
                await Product.findByIdAndUpdate(alloc.id, {
                  $inc: { stock: alloc.qty },
                }).catch(() => {});
              }
              return next(
                new ErrorHandler(
                  `Item "${item.name}" is out of stock or does not have ${requestedQty} units available!`,
                  409
                )
              );
            }

            allocatedItems.push({ id: item._id, qty: requestedQty });
          }
        }
      } catch (err) {
        // Rollback
        for (const alloc of allocatedItems) {
          await Product.findByIdAndUpdate(alloc.id, {
            $inc: { stock: alloc.qty },
          }).catch(() => {});
        }
        return next(new ErrorHandler("Failed to reserve stock: " + err.message, 500));
      }

      // 2. Group cart items by merchant (shopId)
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId =
          item.shopId ||
          (item.shop && (item.shop._id || item.shop.id)) ||
          "platform-direct";

        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // 3. Prepare Master Order
      const masterOrder = new Order({
        cart,
        shippingAddress,
        user,
        userRef: user?._id || user?.id || null,
        totalPrice: Number(totalPrice),
        paymentInfo: paymentInfo || { status: "Pending", type: "Chapa" },
        customMeasurements: customMeasurements || {},
        deliveryNotes: deliveryNotes || "",
        couponCode: couponCode || "",
        status: "Processing",
        statusHistory: [
          {
            status: "Processing",
            timestamp: new Date(),
            note: "Order placed by customer and held in platform escrow",
            updatedBy: user?.name || "Customer",
          },
        ],
      });

      await masterOrder.save();

      const createdSubOrders = [];
      let aggregatedPlatformFee = 0;
      let aggregatedMerchantEarnings = 0;
      let aggregatedShippingFee = 0;

      // 4. Create dedicated SubOrders for each merchant
      for (const [shopId, items] of shopItemsMap) {
        const shopItemsTotal = items.reduce(
          (acc, item) =>
            acc + (Number(item.discountPrice) || Number(item.originalPrice) || 0) * (Number(item.qty) || 1),
          0
        );

        let commissionRate = 10;
        let sellerRecord = null;
        let merchantShippingFee = 0;

        if (shopId !== "platform-direct") {
          sellerRecord = await Shop.findById(shopId);
          if (sellerRecord) {
            if (typeof sellerRecord.commissionRate === "number") {
              commissionRate = sellerRecord.commissionRate;
            }

            // Calculate shipping from seller's shipping settings
            if (sellerRecord.shippingSettings) {
              const settings = sellerRecord.shippingSettings;
              const threshold = settings.freeShippingThreshold || 3000;
              if (shopItemsTotal < threshold) {
                const city = (shippingAddress.city || "").toLowerCase();
                if (city.includes("addis")) {
                  merchantShippingFee = settings.addisAbabaRate || 150;
                } else {
                  merchantShippingFee = settings.regionalRate || 300;
                }
              }
            }
          }
        }

        aggregatedShippingFee += merchantShippingFee;
        const shopSubTotal = shopItemsTotal + merchantShippingFee;
        const platformFeeAmount = (shopItemsTotal * commissionRate) / 100;
        const merchantNetEarnings = shopSubTotal - platformFeeAmount;

        aggregatedPlatformFee += platformFeeAmount;
        aggregatedMerchantEarnings += merchantNetEarnings;

        const subOrder = await SubOrder.create({
          parentOrder: masterOrder._id,
          parentOrderNumber: masterOrder.orderNumber,
          shopId,
          shop: sellerRecord ? sellerRecord._id : null,
          shopData: {
            name: sellerRecord ? sellerRecord.name : "Platform Direct",
            email: sellerRecord ? sellerRecord.email : "",
            phoneNumber: sellerRecord ? sellerRecord.phoneNumber : "",
            address: sellerRecord ? sellerRecord.address : "",
            city: sellerRecord ? sellerRecord.city : "",
          },
          customer: user?._id || user?.id || null,
          userData: {
            name: user?.name || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
          },
          items,
          itemsTotal: shopItemsTotal,
          shippingFee: merchantShippingFee,
          subTotal: shopSubTotal,
          shippingAddress,
          paymentInfo: masterOrder.paymentInfo,
          customMeasurements: customMeasurements || {},
          deliveryNotes: deliveryNotes || "",
          financials: {
            subTotal: shopSubTotal,
            shippingFee: merchantShippingFee,
            platformCommissionRate: commissionRate,
            platformFeeAmount,
            merchantNetEarnings,
            payoutStatus: "Pending Escrow",
          },
          milestones: {
            placedAt: new Date(),
          },
          statusHistory: [
            {
              status: "Processing",
              timestamp: new Date(),
              note: `Merchant slice of order created. Held in platform escrow.`,
              updatedBy: "System",
            },
          ],
        });

        // Atomically increment merchant's pending balance
        if (sellerRecord) {
          await Shop.findByIdAndUpdate(shopId, {
            $inc: {
              pendingBalance: merchantNetEarnings,
              totalOrdersCount: 1,
            },
          }).catch((err) => console.error("Escrow balance update error:", err.message));
        }

        createdSubOrders.push(subOrder);
      }

      // 5. Update master order with subOrders references and financials
      masterOrder.subOrders = createdSubOrders.map((so) => so._id);
      masterOrder.shippingTotal = aggregatedShippingFee;
      masterOrder.financials = {
        subTotal: totalPrice,
        shippingFee: aggregatedShippingFee,
        platformCommissionRate: 10,
        platformFeeAmount: aggregatedPlatformFee,
        merchantNetEarnings: aggregatedMerchantEarnings,
        payoutStatus: "Pending Escrow",
      };

      await masterOrder.save();

      // 6. Log activity
      await ActivityLog.create({
        actorId: user?._id || null,
        actorType: "User",
        actorName: user?.name || "Customer",
        action: "ORDER_CREATED",
        targetId: masterOrder._id,
        targetType: "Order",
        details: {
          orderNumber: masterOrder.orderNumber,
          totalPrice,
          merchantCount: shopItemsMap.size,
          shippingTotal: aggregatedShippingFee,
        },
      }).catch(() => {});

      res.status(201).json({
        success: true,
        order: masterOrder,
        orders: createdSubOrders,
        subOrders: createdSubOrders,
        message: "Order placed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Get All Orders of a Customer
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;

      const orders = await Order.find({
        $or: [{ "user._id": userId }, { userRef: userId }],
      })
        .populate("subOrders")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Get All Orders for a Merchant Shop
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId } = req.params;

      let orders = await SubOrder.find({
        $or: [{ shopId: shopId }, { shop: shopId }],
      }).sort({ createdAt: -1 });

      // Fallback: If no subOrders found (e.g. legacy orders), query Order
      if (orders.length === 0) {
        orders = await Order.find({
          $or: [
            { "cart.shopId": shopId },
            { "cart.shop._id": shopId },
          ],
        }).sort({ createdAt: -1 });
      }

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Get Single Order Details (Checks SubOrder or Master Order)
router.get(
  "/order-details/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let order = await SubOrder.findById(req.params.id);

      if (!order) {
        order = await Order.findById(req.params.id).populate("subOrders");
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Update Order Status (Seller Fulfillment + Escrow Release + Ledger Logging)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, deliveryProvider, trackingCode, note } = req.body;

      let subOrder = await SubOrder.findById(id);
      let isSubOrderMode = Boolean(subOrder);
      let order = subOrder || (await Order.findById(id));

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      const previousStatus = order.status;

      // Update delivery & tracking details
      if (deliveryProvider) {
        order.deliveryProvider = deliveryProvider;
        if (!order.deliveryDetails) order.deliveryDetails = {};
        order.deliveryDetails.provider = deliveryProvider;
      }
      if (trackingCode) {
        order.trackingCode = trackingCode;
        if (!order.deliveryDetails) order.deliveryDetails = {};
        order.deliveryDetails.trackingCode = trackingCode;
      }

      // Update milestone dates
      if (!order.milestones) order.milestones = {};
      if (status === "Confirmed" && !order.milestones.confirmedAt) {
        order.milestones.confirmedAt = new Date();
      }
      if (status === "Tailoring & Handweaving" && !order.milestones.tailoringStartedAt) {
        order.milestones.tailoringStartedAt = new Date();
      }
      if (status === "Quality Checked" && !order.milestones.qualityCheckedAt) {
        order.milestones.qualityCheckedAt = new Date();
      }
      if (
        (status === "Transferred to delivery partner" || status === "Out for delivery") &&
        !order.milestones.shippedAt
      ) {
        order.milestones.shippedAt = new Date();
        if (order.deliveryDetails) order.deliveryDetails.shippedAt = new Date();

        // Increment sold_out
        const items = order.items || order.cart || [];
        for (const item of items) {
          if (item._id) {
            await Product.findByIdAndUpdate(item._id, {
              $inc: { sold_out: Number(item.qty) || 1 },
            }).catch(() => {});
          }
        }
      }

      order.status = status || order.status;

      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        note: note || `Order updated to ${order.status}`,
        updatedBy: req.seller?.name || "Merchant",
      });

      // SECURE ESCROW PROTECTION: Prevent fraudulent merchant unilateral release
      // If merchant sets status to "Delivered" without customer OTP, enter a mandatory 72-hour inspection window
      if ((status === "Delivered" || status === "Delivered - Pending Inspection") && previousStatus !== "Delivered") {
        order.deliveredAt = new Date();
        if (!order.milestones) order.milestones = {};
        order.milestones.deliveredAt = new Date();
        if (order.deliveryDetails) order.deliveryDetails.deliveredAt = new Date();

        if (order.deliveryVerification?.isOtpVerified) {
          // If OTP was already verified during courier handover, release escrow immediately
          await executeEscrowRelease(order, "Courier OTP Handover", req.seller);
        } else {
          // Enter 72-hour inspection period for customer quality check
          order.status = "Delivered - Pending Inspection";
          if (!order.deliveryVerification) order.deliveryVerification = {};
          order.deliveryVerification.inspectionWindowEndsAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
          if (order.financials) {
            order.financials.payoutStatus = "Inspection Period";
          }
          if (order.statusHistory) {
            order.statusHistory.push({
              status: "Delivered - Pending Inspection",
              timestamp: new Date(),
              note: "Garment delivered. 72-hour customer inspection & tailoring review period started.",
              updatedBy: "System",
            });
          }
        }
      }

      // If status is Cancelled, restore stock and decrement pending balance
      if (order.status === "Cancelled" && previousStatus !== "Cancelled") {
        const items = order.items || order.cart || [];
        for (const item of items) {
          if (item._id) {
            await Product.findByIdAndUpdate(item._id, {
              $inc: { stock: Number(item.qty) || 1 },
            }).catch(() => {});
          }
        }

        const netEarnings =
          order.financials?.merchantNetEarnings ||
          (order.subTotal || order.totalPrice || 0) * 0.9;

        const targetShopId = order.shopId || (order.shop && order.shop._id) || req.seller._id;
        await Shop.findByIdAndUpdate(targetShopId, {
          $inc: { pendingBalance: -netEarnings },
        }).catch(() => {});

        if (!order.cancellation) order.cancellation = {};
        order.cancellation.isCancelled = true;
        order.cancellation.cancelledBy = "Merchant";
        order.cancellation.cancelledAt = new Date();
        order.cancellation.reason = note || "Cancelled by merchant";
      }

      await order.save({ validateBeforeSave: false });

      // If this was a sub-order, update the parent order status if all sub-orders are fulfilled
      if (isSubOrderMode && subOrder.parentOrder) {
        const siblingSubOrders = await SubOrder.find({
          parentOrder: subOrder.parentOrder,
        });
        const allDelivered = siblingSubOrders.every((so) => so.status === "Delivered");
        const allCancelled = siblingSubOrders.every((so) => so.status === "Cancelled");

        let parentStatus = "Processing";
        if (allDelivered) parentStatus = "Delivered";
        else if (allCancelled) parentStatus = "Cancelled";
        else if (siblingSubOrders.some((so) => so.status === "Delivered" || so.status === "Out for delivery")) {
          parentStatus = "Partially Fulfilled";
        }

        await Order.findByIdAndUpdate(subOrder.parentOrder, {
          status: parentStatus,
        }).catch(() => {});
      }

      res.status(200).json({
        success: true,
        order,
        message: `Order status updated to ${order.status}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Customer Request Refund
router.put(
  "/order-refund/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let order = await SubOrder.findById(req.params.id);
      if (!order) {
        order = await Order.findById(req.params.id);
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      order.status = "Processing refund";
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: "Processing refund",
        timestamp: new Date(),
        note: req.body.reason || "Customer requested refund",
        updatedBy: req.user?.name || "Customer",
      });

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order refund request submitted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 7. Merchant Approve Refund
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let order = await SubOrder.findById(req.params.id);
      if (!order) {
        order = await Order.findById(req.params.id);
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      const previousStatus = order.status;
      order.status = "Refund Success";

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: "Refund Success",
        timestamp: new Date(),
        note: "Merchant approved customer refund",
        updatedBy: req.seller?.name || "Merchant",
      });

      const netEarnings =
        order.financials?.merchantNetEarnings ||
        (order.subTotal || order.totalPrice || 0) * 0.9;

      const targetShopId = order.shopId || (order.shop && order.shop._id) || req.seller._id;
      const seller = await Shop.findById(targetShopId);

      // If order was already delivered, deduct from availableBalance; otherwise deduct from pending escrow
      if (previousStatus === "Delivered") {
        await Shop.findByIdAndUpdate(targetShopId, {
          $inc: { availableBalance: -netEarnings },
        });

        if (seller) {
          await LedgerEntry.create({
            shop: seller._id,
            shopId: seller._id.toString(),
            entryType: "REFUND_DEDUCTION",
            amount: -netEarnings,
            balanceType: "availableBalance",
            balanceBefore: seller.availableBalance,
            balanceAfter: seller.availableBalance - netEarnings,
            subOrder: order._id,
            referenceCode: order.subOrderNumber || order.orderNumber,
            description: `Refund deduction for delivered Order #${order.subOrderNumber || order.orderNumber}`,
          }).catch(() => {});
        }
      } else {
        await Shop.findByIdAndUpdate(targetShopId, {
          $inc: { pendingBalance: -netEarnings },
        });
      }

      if (order.financials) {
        order.financials.payoutStatus = "Refunded";
      }

      // Restock products
      const items = order.items || order.cart || [];
      for (const item of items) {
        if (item._id) {
          await Product.findByIdAndUpdate(item._id, {
            $inc: { stock: Number(item.qty) || 1 },
          }).catch(() => {});
        }
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Refund processed and approved successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 8. Admin View All Orders
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find()
        .populate("subOrders")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Helper: Execute Escrow Release to Merchant Available Balance
const executeEscrowRelease = async (order, confirmedBy = "Customer", actor = null) => {
  if (order.financials?.payoutStatus === "Eligible for Payout" || order.financials?.payoutStatus === "Paid Out") {
    return;
  }

  const netEarnings =
    order.financials?.merchantNetEarnings ||
    (order.subTotal || order.totalPrice || 0) * 0.9;
  const platformFee =
    order.financials?.platformFeeAmount ||
    (order.subTotal || order.totalPrice || 0) * 0.1;

  if (!order.financials) order.financials = {};
  order.financials.payoutStatus = "Eligible for Payout";
  order.financials.escrowReleasedAt = new Date();

  order.status = "Delivered";
  order.deliveredAt = new Date();
  if (!order.milestones) order.milestones = {};
  order.milestones.deliveredAt = new Date();
  order.milestones.confirmedDeliveredAt = new Date();

  if (!order.deliveryVerification) order.deliveryVerification = {};
  order.deliveryVerification.verifiedAt = new Date();
  order.deliveryVerification.verifiedBy = confirmedBy;
  order.deliveryVerification.isOtpVerified = true;

  if (!order.statusHistory) order.statusHistory = [];
  order.statusHistory.push({
    status: "Delivered",
    timestamp: new Date(),
    note: `Delivery verified and escrow released via ${confirmedBy}`,
    updatedBy: actor?.name || confirmedBy,
  });

  const targetShopId = order.shopId || (order.shop && (order.shop._id || order.shop));
  const sellerRecord = await Shop.findById(targetShopId);

  if (sellerRecord) {
    const prevPending = sellerRecord.pendingBalance;
    const prevAvailable = sellerRecord.availableBalance;

    await Shop.findByIdAndUpdate(targetShopId, {
      $inc: {
        pendingBalance: -netEarnings,
        availableBalance: netEarnings,
        totalSales: order.subTotal || order.totalPrice || 0,
      },
    });

    // Create Immutable Ledger Entries
    await LedgerEntry.create({
      shop: sellerRecord._id,
      shopId: sellerRecord._id.toString(),
      entryType: "ESCROW_RELEASE",
      amount: netEarnings,
      balanceType: "availableBalance",
      balanceBefore: prevAvailable,
      balanceAfter: prevAvailable + netEarnings,
      parentOrder: order.parentOrder || order._id,
      subOrder: order._id,
      referenceCode: order.subOrderNumber || order.orderNumber,
      description: `Escrow released (${confirmedBy}) for Order #${order.subOrderNumber || order.orderNumber}`,
      metadata: { netEarnings, platformFee, confirmedBy },
    }).catch(() => {});

    await LedgerEntry.create({
      shop: sellerRecord._id,
      shopId: sellerRecord._id.toString(),
      entryType: "PLATFORM_COMMISSION",
      amount: -platformFee,
      balanceType: "availableBalance",
      balanceBefore: prevAvailable + netEarnings,
      balanceAfter: prevAvailable + netEarnings,
      parentOrder: order.parentOrder || order._id,
      subOrder: order._id,
      referenceCode: order.subOrderNumber || order.orderNumber,
      description: `Platform fee on Order #${order.subOrderNumber || order.orderNumber}`,
    }).catch(() => {});
  }

  await order.save({ validateBeforeSave: false });
};

// 9. Customer Confirm Delivery & Release Escrow
router.post(
  "/confirm-delivery/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let order = await SubOrder.findById(req.params.id);
      if (!order) {
        order = await Order.findById(req.params.id);
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      await executeEscrowRelease(order, "Customer Confirmation", req.user);

      // If sub-order, update parent order status
      if (order.parentOrder) {
        const siblingSubOrders = await SubOrder.find({ parentOrder: order.parentOrder });
        const allDelivered = siblingSubOrders.every((so) => so.status === "Delivered");
        if (allDelivered) {
          await Order.findByIdAndUpdate(order.parentOrder, { status: "Delivered" });
        }
      }

      res.status(200).json({
        success: true,
        order,
        message: "Delivery confirmed and artisan escrow released successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 10. Verify Delivery via 6-digit Courier OTP
router.post(
  "/verify-delivery-otp/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { otp } = req.body;
      let order = await SubOrder.findById(req.params.id);
      if (!order) {
        order = await Order.findById(req.params.id);
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      const expectedOtp = order.deliveryVerification?.deliveryOtp;
      if (!expectedOtp || expectedOtp.trim() !== String(otp).trim()) {
        return next(
          new ErrorHandler("Invalid delivery confirmation code! Please check with the customer.", 400)
        );
      }

      await executeEscrowRelease(order, "Courier OTP Handover", { name: "Courier" });

      res.status(200).json({
        success: true,
        order,
        message: "Delivery handover verified successfully! Escrow credited to artisan.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 11. Pre-Shipment Quality Proof Upload (Merchant Tailoring Protection)
router.post(
  "/upload-shipment-proof/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { photoUrl, note } = req.body;
      const order = await SubOrder.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      if (!order.deliveryVerification) order.deliveryVerification = {};
      order.deliveryVerification.preShipmentProof = {
        photoUrl: photoUrl || "",
        note: note || "Pre-shipment tailoring quality photo verified",
        uploadedAt: new Date(),
      };

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Pre-shipment proof saved for arbitration protection!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 12. Legal Ethiopian Tax E-Invoice (Ministry of Revenues Compliant)
router.get(
  "/tax-invoice/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let order = await SubOrder.findById(req.params.id).populate("shop customer");
      if (!order) {
        order = await Order.findById(req.params.id).populate("subOrders");
      }

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      const invoiceData = {
        invoiceNumber: order.taxInvoice?.invoiceNumber || "MEP-INV-" + order._id.toString().slice(-8),
        issueDate: order.paidAt || order.createdAt,
        platform: {
          name: "MEP Traditional Apparel Marketplace",
          tin: "0064291845",
          vatRegistrationNumber: "VAT-891230-ET",
          address: "Bole Subcity, Addis Ababa, Ethiopia",
        },
        merchant: {
          name: order.shopData?.name || order.shop?.name || "Habesha Artisan",
          tin: order.shopData?.tinNumber || order.shop?.tinNumber || "Unregistered Artisan",
          vatNumber: order.shopData?.vatNumber || order.shop?.vatNumber || "N/A",
          address: order.shopData?.address || order.shop?.address || "Addis Ababa",
        },
        customer: {
          name: order.userData?.name || order.customer?.name || order.user?.name,
          email: order.userData?.email || order.customer?.email || order.user?.email,
          phone: order.userData?.phoneNumber || order.shippingAddress?.phoneNumber,
          shippingAddress: order.shippingAddress,
        },
        items: order.items || order.cart || [],
        financials: {
          itemsTotal: order.itemsTotal || order.subTotal || order.totalPrice,
          shippingFee: order.shippingFee || order.shippingTotal || 0,
          vatRate: order.taxInvoice?.vatRate || 0,
          vatAmount: order.taxInvoice?.vatAmount || 0,
          grandTotal: order.subTotal || order.totalPrice,
          currency: "ETB",
        },
        legalDeclaration:
          "This electronic sales invoice is issued in accordance with the Ethiopian Electronic Transactions Proclamation No. 1205/2020 and Federal Tax Administration Proclamation No. 980/2016.",
      };

      res.status(200).json({
        success: true,
        invoice: invoiceData,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
