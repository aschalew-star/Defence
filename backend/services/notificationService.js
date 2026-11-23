const eventBus = require("./eventBus");
const Notification = require("../model/notification");
const User = require("../model/user");
const { sendSMS } = require("./smsService");
const {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusUpdateEmail,
  sendPayoutConfirmationEmail,
  sendNewProductFollowerEmail,
} = require("./emailService");
const { notifyUser } = require("../socket");
const { shouldNotify } = require("./preferenceService");

/**
 * Helper to persist In-App Notification and push real-time socket packet
 */
const createInAppNotification = async ({
  recipientId,
  recipientType = "user",
  title,
  message,
  type = "order_update",
  actionUrl = "",
  metadata = {},
  priority = "medium",
}) => {
  try {
    if (!recipientId) return null;

    const notif = await Notification.create({
      recipient: recipientId,
      recipientType,
      title,
      message,
      type,
      actionUrl,
      metadata,
      priority,
    });

    // Real-time socket delivery to online users
    notifyUser(recipientId.toString(), "new_notification", notif);

    return notif;
  } catch (err) {
    console.error("[InApp Notification Error]:", err.message);
    return null;
  }
};

/**
 * 1. Event: ORDER_CREATED
 */
eventBus.subscribe("ORDER_CREATED", async ({ order, subOrders = [], user }) => {
  if (!order) return;
  const orderNumber = order.orderNumber || (order._id ? String(order._id).slice(-8).toUpperCase() : "N/A");
  const recipientUser = user || order.user;
  const phone = order.shippingAddress?.phoneNumber || recipientUser?.phoneNumber;

  // A. In-App Notification for Buyer (Check Preference)
  if (recipientUser?._id && shouldNotify(recipientUser, "orderUpdates", "inApp")) {
    await createInAppNotification({
      recipientId: recipientUser._id,
      recipientType: "user",
      title: `Order #${orderNumber} Placed`,
      message: `Your craft order totaling ${Number(order.totalPrice || 0).toLocaleString()} ETB is secured with escrow protection.`,
      type: "order_update",
      actionUrl: `/order/${order._id}`,
      metadata: { orderId: order._id, orderNumber },
    });
  }

  // B. In-App Notification for each Artisan Merchant (Merchant Operations)
  for (const sub of subOrders) {
    const shopId = sub.shopId || sub.shop;
    if (shopId) {
      await createInAppNotification({
        recipientId: shopId,
        recipientType: "seller",
        title: `New Artisan Order #${sub.subOrderNumber || orderNumber}`,
        message: `New craft sub-order received from ${recipientUser?.name || "Customer"}. Check tailored measurements & begin handweaving.`,
        type: "order_update",
        actionUrl: `/order/${sub._id}`,
        metadata: { subOrderId: sub._id, orderId: order._id },
        priority: "high",
      });
    }
  }

  // C. Email Confirmation to Buyer (Check Preference)
  if (shouldNotify(recipientUser, "orderUpdates", "email")) {
    sendOrderConfirmationEmail({ user: recipientUser, order, subOrders }).catch((e) =>
      console.error("[Email Error] Order confirmation:", e.message)
    );
  }

  // D. SMS to Buyer (Check Preference)
  if (phone && shouldNotify(recipientUser, "orderUpdates", "sms")) {
    const smsText = `MEP Crafts: Your order #${orderNumber} for ${Number(order.totalPrice || 0).toLocaleString()} ETB is confirmed. Escrow holds your payment until delivery. View: http://localhost:3000/order/${order._id}`;
    sendSMS(phone, smsText, { orderId: order._id }).catch((e) =>
      console.error("[SMS Error] Order placed:", e.message)
    );
  }
});

/**
 * 2. Event: PAYMENT_SUCCESS
 */
eventBus.subscribe("PAYMENT_SUCCESS", async ({ order, subOrders = [], tx_ref, chapaId }) => {
  if (!order) return;
  const orderNumber = order.orderNumber || (order._id ? String(order._id).slice(-8).toUpperCase() : "N/A");
  const recipientUser = order.user;
  const phone = order.shippingAddress?.phoneNumber || recipientUser?.phoneNumber;

  // A. In-App Notification for Buyer (Check Preference)
  if ((order.userRef || recipientUser?._id) && shouldNotify(recipientUser, "orderUpdates", "inApp")) {
    await createInAppNotification({
      recipientId: order.userRef || recipientUser._id,
      recipientType: "user",
      title: "Chapa Payment Verified",
      message: `Payment of ${Number(order.totalPrice || 0).toLocaleString()} ETB verified (Ref: ${tx_ref || "N/A"}). Artisan guild notified.`,
      type: "order_update",
      actionUrl: `/order/${order._id}`,
      metadata: { tx_ref, chapaId, orderId: order._id },
    });
  }

  // B. In-App Notification for Artisans (Escrow Hold Active)
  for (const sub of subOrders) {
    const shopId = sub.shopId || sub.shop;
    if (shopId) {
      const net = sub.financials?.merchantNetEarnings || sub.subTotal * 0.9;
      await createInAppNotification({
        recipientId: shopId,
        recipientType: "seller",
        title: "Escrow Payment Verified",
        message: `Order #${sub.subOrderNumber || orderNumber} payment confirmed. ${net.toLocaleString()} ETB credited to your pending escrow balance.`,
        type: "payout_processed",
        actionUrl: `/dashboard/ledger`,
        priority: "high",
      });
    }
  }

  // C. Email Receipt to Buyer (Check Preference)
  if (shouldNotify(recipientUser, "orderUpdates", "email")) {
    sendPaymentSuccessEmail({ user: recipientUser, order, tx_ref, chapaId }).catch((e) =>
      console.error("[Email Error] Payment receipt:", e.message)
    );
  }

  // D. SMS to Buyer (Check Preference)
  if (phone && shouldNotify(recipientUser, "orderUpdates", "sms")) {
    const smsText = `MEP Crafts: Payment of ${Number(order.totalPrice || 0).toLocaleString()} ETB verified via Chapa (Ref: ${tx_ref || "CHAPA"}). Artisan is now tailoring your items.`;
    sendSMS(phone, smsText, { tx_ref }).catch((e) =>
      console.error("[SMS Error] Payment success:", e.message)
    );
  }
});

/**
 * 3. Event: ORDER_STATUS_UPDATED
 */
eventBus.subscribe("ORDER_STATUS_UPDATED", async ({ order, subOrder, newStatus, trackingCode, deliveryProvider }) => {
  const activeOrder = subOrder || order;
  if (!activeOrder) return;

  const orderNumber = activeOrder.subOrderNumber || activeOrder.orderNumber || String(activeOrder._id).slice(-8).toUpperCase();
  const recipientUser = activeOrder.user;
  const phone = activeOrder.shippingAddress?.phoneNumber || recipientUser?.phoneNumber;

  // A. In-App Notification for Buyer (Check Preference)
  const userId = activeOrder.userRef || recipientUser?._id;
  if (userId && shouldNotify(recipientUser, "orderUpdates", "inApp")) {
    await createInAppNotification({
      recipientId: userId,
      recipientType: "user",
      title: `Order Status: ${newStatus}`,
      message: `Your craft order #${orderNumber} is now "${newStatus}".${trackingCode ? ` Tracking code: ${trackingCode}` : ""}`,
      type: "order_update",
      actionUrl: `/order/${activeOrder._id}`,
      metadata: { orderId: activeOrder._id, newStatus, trackingCode },
    });
  }

  // B. Email to Buyer (Check Preference)
  if (shouldNotify(recipientUser, "orderUpdates", "email")) {
    sendOrderStatusUpdateEmail({
      user: recipientUser,
      order: activeOrder,
      newStatus,
      trackingCode,
      deliveryProvider,
    }).catch((e) => console.error("[Email Error] Status update:", e.message));
  }

  // C. SMS to Buyer (Check Preference)
  if (phone && shouldNotify(recipientUser, "orderUpdates", "sms")) {
    const smsText = `MEP Crafts: Order #${orderNumber} is now: ${newStatus}.${trackingCode ? ` Courier: ${deliveryProvider || "Zonal"} (${trackingCode}).` : ""} Track: http://localhost:3000/order/${activeOrder._id}`;
    sendSMS(phone, smsText, { orderId: activeOrder._id, newStatus }).catch((e) =>
      console.error("[SMS Error] Status update:", e.message)
    );
  }
});

/**
 * 4. Event: PRODUCT_CREATED (Notify Merchant Followers)
 */
eventBus.subscribe("PRODUCT_CREATED", async ({ product, shop }) => {
  if (!product || !shop) return;
  const shopId = shop._id || product.shopId;
  if (!shopId) return;

  try {
    // Find all marketplace customers following this artisan workshop
    const followers = await User.find({ followedShops: shopId });
    if (!followers || followers.length === 0) return;

    const craftTitle = product.name;
    const price = Number(product.discountPrice || product.originalPrice || 0).toLocaleString();

    for (const follower of followers) {
      // Check granular user preferences
      const canInApp = shouldNotify(follower, "artisanUpdates", "inApp");
      const canEmail = shouldNotify(follower, "artisanUpdates", "email");
      const canSms = shouldNotify(follower, "artisanUpdates", "sms");

      // A. In-App Notification
      if (canInApp) {
        createInAppNotification({
          recipientId: follower._id,
          recipientType: "user",
          title: `New Craft from ${shop.name}`,
          message: `${shop.name} just published "${craftTitle}" (${price} ETB). Explore the latest handwoven piece!`,
          type: "order_update",
          actionUrl: `/product/${product._id}`,
          metadata: { productId: product._id, shopId },
        }).catch(() => {});
      }

      // B. Email Alert
      if (canEmail && follower.email) {
        sendNewProductFollowerEmail({ user: follower, product, shop }).catch((e) =>
          console.error("[Email Error] Follower craft alert:", e.message)
        );
      }

      // C. SMS Alert (if user explicitly enabled SMS for artisan updates)
      if (canSms && follower.phoneNumber) {
        const smsText = `MEP Artisan Alert: ${shop.name} released "${craftTitle}" (${price} ETB). Explore now: http://localhost:3000/product/${product._id}`;
        sendSMS(follower.phoneNumber, smsText, { productId: product._id }).catch((e) =>
          console.error("[SMS Error] Follower product SMS:", e.message)
        );
      }
    }
    console.log(`[Notification Engine] Dispatched new product alert for "${craftTitle}" to ${followers.length} follower(s) of ${shop.name}`);
  } catch (err) {
    console.error("[Follower Notification Error]:", err.message);
  }
});

/**
 * 5. Event: DISPUTE_FILED
 */
eventBus.subscribe("DISPUTE_FILED", async ({ dispute, order, customer }) => {
  if (!dispute) return;
  const shopId = dispute.shop || dispute.shopId;
  const disputeNumber = dispute.disputeNumber || "N/A";

  // In-App Notification for Merchant
  if (shopId) {
    await createInAppNotification({
      recipientId: shopId,
      recipientType: "seller",
      title: `Dispute Filed: #${disputeNumber}`,
      message: `Customer ${customer?.name || "Buyer"} filed claim: "${dispute.reason}". Please respond via Arbitration Desk within 72 hours.`,
      type: "dispute_update",
      actionUrl: `/dashboard/disputes`,
      priority: "urgent",
    });
  }
});

/**
 * 6. Event: DISPUTE_RESOLVED
 */
eventBus.subscribe("DISPUTE_RESOLVED", async ({ dispute, resolution }) => {
  if (!dispute) return;
  const disputeNumber = dispute.disputeNumber || "N/A";
  const customer = dispute.customer;
  const customerId = customer?._id || customer;
  const customerPhone = customer?.phoneNumber;

  // In-App Notification for Buyer (Check Preference)
  if (customerId && shouldNotify(customer, "disputesReturns", "inApp")) {
    await createInAppNotification({
      recipientId: customerId,
      recipientType: "user",
      title: `Claim #${disputeNumber} Resolved`,
      message: `Arbitration decision: ${resolution.decision || "Resolved"}. ${resolution.refundAmount ? `Refund of ${resolution.refundAmount} ETB approved.` : ""}`,
      type: "dispute_update",
      actionUrl: `/user/disputes`,
      priority: "high",
    });
  }

  // SMS to Buyer (Check Preference)
  if (customerPhone && shouldNotify(customer, "disputesReturns", "sms")) {
    const smsText = `MEP Escrow: Claim #${disputeNumber} has been resolved by mediator (${resolution.decision || "Approved"}). Check details at http://localhost:3000/user/disputes`;
    sendSMS(customerPhone, smsText, { disputeNumber }).catch((e) =>
      console.error("[SMS Error] Dispute resolved:", e.message)
    );
  }
});

/**
 * 7. Event: PAYOUT_DISBURSED
 */
eventBus.subscribe("PAYOUT_DISBURSED", async ({ seller, withdraw }) => {
  if (!seller || !withdraw) return;
  const amount = Number(withdraw.amount || 0).toLocaleString();
  const phone = seller.phoneNumber;

  // A. In-App Notification for Seller
  await createInAppNotification({
    recipientId: seller._id,
    recipientType: "seller",
    title: "Artisan Payout Disbursed",
    message: `${amount} ETB successfully disbursed to your ${withdraw.paymentMethod || "Bank"} account (${withdraw.bankAccount || "N/A"}).`,
    type: "payout_processed",
    actionUrl: `/dashboard/ledger`,
    priority: "high",
  });

  // B. Email to Seller
  sendPayoutConfirmationEmail({ seller, withdraw }).catch((e) =>
    console.error("[Email Error] Payout confirmation:", e.message)
  );

  // C. SMS to Seller
  if (phone) {
    const smsText = `MEP Artisan Hub: Payout of ${amount} ETB disbursed to your account (${withdraw.bankAccount || "Bank"}). Ref: ${withdraw.transactionId || "SUCCESS"}.`;
    sendSMS(phone, smsText, { withdrawId: withdraw._id }).catch((e) =>
      console.error("[SMS Error] Payout disbursed:", e.message)
    );
  }
});

console.log("⚡ [NotificationService] Event-driven multi-channel engine initialized with follower alerts & user preference gating");

module.exports = {
  createInAppNotification,
};
