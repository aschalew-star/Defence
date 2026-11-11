const express = require("express");
const router = express.Router();
const Withdraw = require("../model/withdraw");
const Shop = require("../model/Shop");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");
const handleerror = require("../utils/handleerror");
const catchAsyncErrors = require("../utils/asynerror");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");

// 1. Create Withdrawal Request (Merchant Payout)
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount, payoutMethod } = req.body;

      if (!amount || Number(amount) < 50) {
        return next(
          new handleerror("Minimum payout request amount is 50 ETB!", 400)
        );
      }

      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new handleerror("Merchant store not found!", 404));
      }

      if (seller.status === "suspended") {
        return next(
          new handleerror("Suspended accounts cannot request withdrawals.", 403)
        );
      }

      // Legal & Tax Compliance (Ethiopian Electronic Transactions & Ministry of Revenues)
      if (seller.verificationStatus !== "Verified") {
        return next(
          new handleerror(
            "Legal Compliance Requirement: You must verify your artisan shop identity (TIN & National ID/License) before disbursing payouts.",
            403
          )
        );
      }

      if (!seller.tinNumber || seller.tinNumber.trim().length < 9) {
        return next(
          new handleerror(
            "A valid 10-digit Tax Identification Number (TIN) is required by the Ministry of Revenues for payout compliance.",
            400
          )
        );
      }

      if (seller.availableBalance < Number(amount)) {
        return next(
          new handleerror(
            `Requested amount (${Number(amount).toLocaleString()} ETB) exceeds available balance (${Number(seller.availableBalance).toLocaleString()} ETB)!`,
            400
          )
        );
      }

      const method =
        payoutMethod ||
        seller.payoutMethods?.[0] || {
          methodType: "Telebirr",
          accountName: seller.name,
          phoneNumber: seller.phoneNumber,
        };

      const withdraw = await Withdraw.create({
        shop: seller._id,
        shopId: seller._id.toString(),
        seller: {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          phoneNumber: seller.phoneNumber,
        },
        amount: Number(amount),
        payoutMethod: {
          methodType: method.methodType || method.type || "Telebirr",
          accountName: method.accountName || method.accountHolderName || seller.name,
          accountNumber: method.accountNumber || "",
          phoneNumber: method.phoneNumber || method.telebirrNumber || seller.phoneNumber || "",
          bankBranch: method.bankBranch || "",
        },
        status: "Processing",
      });

      const prevAvailable = seller.availableBalance;

      // Atomically deduct balance from seller
      await Shop.findByIdAndUpdate(seller._id, {
        $inc: { availableBalance: -Number(amount) },
        $push: {
          transections: {
            amount: Number(amount),
            status: "Processing Payout",
            reference: withdraw._id.toString(),
            createdAt: new Date(),
          },
        },
      });

      // Immutable Ledger Record
      await LedgerEntry.create({
        shop: seller._id,
        shopId: seller._id.toString(),
        entryType: "PAYOUT_REQUEST",
        amount: -Number(amount),
        balanceType: "availableBalance",
        balanceBefore: prevAvailable,
        balanceAfter: prevAvailable - Number(amount),
        withdrawRequest: withdraw._id,
        referenceCode: withdraw._id.toString(),
        description: `Payout request for ${Number(amount).toLocaleString()} ETB via ${method.methodType}`,
      }).catch(() => {});

      // Audit log
      await ActivityLog.create({
        actorId: seller._id,
        actorType: "Seller",
        actorName: seller.name,
        action: "PAYOUT_REQUESTED",
        targetId: withdraw._id,
        targetType: "Withdraw",
        details: { amount: Number(amount), method: method.methodType },
      }).catch(() => {});

      const updatedSeller = await Shop.findById(seller._id);

      res.status(201).json({
        success: true,
        withdraw,
        availableBalance: updatedSeller.availableBalance,
        message: "Payout request submitted successfully! Funds will be disbursed shortly.",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 2. Get All Withdrawal Requests (Admin, Protected)
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find()
        .populate("shop", "name email phoneNumber availableBalance isVerified")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 3. Get Seller's Own Withdrawal History
router.get(
  "/get-seller-withdraw-requests",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find({
        $or: [{ shopId: req.seller._id.toString() }, { shop: req.seller._id }],
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 4. Update Withdrawal Status (Admin Disburse / Approve / Reject, Protected)
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId, status, transactionReference, adminComment } = req.body;

      const withdraw = await Withdraw.findById(req.params.id);
      if (!withdraw) {
        return next(new handleerror("Withdraw request not found with this id", 404));
      }

      const previousStatus = withdraw.status;
      const newStatus = status === "Succeed" ? "Paid" : status || "Paid";

      withdraw.status = newStatus;
      withdraw.processedAt = new Date();
      withdraw.processedBy = req.user._id;
      if (transactionReference) withdraw.transactionReference = transactionReference;
      if (adminComment) withdraw.adminComment = adminComment;

      await withdraw.save();

      const targetShopId = sellerId || withdraw.shopId || withdraw.shop;
      const seller = await Shop.findById(targetShopId);

      if (seller) {
        // If rejected, refund the amount back to the seller's available balance
        if (newStatus === "Rejected" && previousStatus !== "Rejected") {
          const prevAvailable = seller.availableBalance;
          await Shop.findByIdAndUpdate(targetShopId, {
            $inc: { availableBalance: withdraw.amount },
            $push: {
              transections: {
                amount: withdraw.amount,
                status: "Withdrawal Refunded",
                reference: withdraw.transactionReference || withdraw._id.toString(),
                createdAt: new Date(),
              },
            },
          });

          // Ledger entry
          await LedgerEntry.create({
            shop: seller._id,
            shopId: seller._id.toString(),
            entryType: "PAYOUT_REJECTED",
            amount: withdraw.amount,
            balanceType: "availableBalance",
            balanceBefore: prevAvailable,
            balanceAfter: prevAvailable + withdraw.amount,
            withdrawRequest: withdraw._id,
            referenceCode: withdraw.transactionReference || withdraw._id.toString(),
            description: `Payout rejected by admin: ${adminComment || "Returned to available balance"}`,
          }).catch(() => {});
        } else if (
          (newStatus === "Paid" || newStatus === "Approved") &&
          previousStatus === "Processing"
        ) {
          await Shop.findByIdAndUpdate(targetShopId, {
            $inc: { totalWithdrawn: withdraw.amount },
            $push: {
              transections: {
                amount: withdraw.amount,
                status: "Paid",
                reference: withdraw.transactionReference || withdraw._id.toString(),
                createdAt: new Date(),
              },
            },
          });

          // Ledger entry
          await LedgerEntry.create({
            shop: seller._id,
            shopId: seller._id.toString(),
            entryType: "PAYOUT_COMPLETED",
            amount: -withdraw.amount,
            balanceType: "availableBalance",
            balanceBefore: seller.availableBalance,
            balanceAfter: seller.availableBalance,
            withdrawRequest: withdraw._id,
            referenceCode: withdraw.transactionReference || withdraw._id.toString(),
            description: `Payout disbursed successfully. Reference: ${withdraw.transactionReference || "Bank Transfer"}`,
          }).catch(() => {});
        }
      }

      // Audit log
      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name,
        action: `WITHDRAWAL_${newStatus.toUpperCase()}`,
        targetId: withdraw._id,
        targetType: "Withdraw",
        details: { amount: withdraw.amount, transactionReference, newStatus },
      }).catch(() => {});

      const withdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        withdraws,
        message: `Payout request marked as ${newStatus}!`,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

module.exports = router;
