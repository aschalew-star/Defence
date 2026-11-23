const nodemailer = require("nodemailer");

/**
 * Enterprise Email Notification Service
 * Renders Ethiopian artisan marketplace templates for order receipts,
 * Chapa payment verifications, tracking dispatches, and escrow payouts.
 */

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMPT_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMPT_PORT || process.env.EMAIL_PORT || 587;
  const user = process.env.SMPT_MAIL || process.env.EMAIL_USER;
  const pass = process.env.SMPT_PASSWORD || process.env.EMAIL_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  } else {
    // Development simulated mailer
    transporter = {
      sendMail: async (options) => {
        console.log(`\n================== 📧 TRANSACTIONAL EMAIL SENT ==================`);
        console.log(`To:      ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`From:    ${options.from || "MEP Crafts <noreply@mep.et>"}`);
        console.log(`Preview: ${options.text || options.subject}`);
        console.log(`=================================================================\n`);
        return { messageId: `mock-mail-${Date.now()}` };
      },
    };
  }

  return transporter;
};

// Base HTML Email Template with Ethiopian Heritage Branding
const renderEmailLayout = ({ title, preheader, bodyContent }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; margin: 0; padding: 20px; color: #1c1917; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #78350f, #451a03); padding: 32px 24px; text-align: center; color: #ffffff; }
    .monogram { width: 44px; height: 44px; margin: 0 auto 12px; background: #d97706; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; font-family: Georgia, serif; }
    .brand-title { font-size: 20px; font-weight: 800; font-family: Georgia, serif; margin: 0; letter-spacing: 0.5px; }
    .brand-sub { font-size: 11px; opacity: 0.8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .badge-amber { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-emerald { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .h1 { font-size: 22px; font-weight: 900; margin: 0 0 12px; color: #1c1917; font-family: Georgia, serif; }
    .p { font-size: 13px; line-height: 1.6; color: #57534e; margin: 0 0 18px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table th { text-align: left; padding: 10px 12px; background-color: #f5f5f4; color: #78716c; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e7e5e4; }
    .table td { padding: 12px; border-bottom: 1px solid #f5f5f4; color: #292524; }
    .escrow-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 14px 18px; margin: 24px 0; font-size: 12px; color: #78350f; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #92400e, #78350f); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 13px; margin: 16px 0; }
    .footer { background-color: #fafaf9; padding: 24px; text-align: center; font-size: 11px; color: #a8a29e; border-top: 1px solid #e7e5e4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="monogram">M</div>
      <h1 class="brand-title">MEP Traditional Crafts</h1>
      <div class="brand-sub">Ethiopian Artisan Marketplace & National Escrow</div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">Addis Ababa, Ethiopia • National Bank of Ethiopia & Chapa Escrow Compliance</p>
      <p style="margin: 0;">Need support? Email support@mep.et or call +251 900 000 000</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Order Placed Confirmation Email (Buyer)
 */
const sendOrderConfirmationEmail = async ({ user, order, subOrders = [] }) => {
  const mailer = getTransporter();
  const recipientEmail = user?.email || order?.user?.email;
  if (!recipientEmail) return;

  const orderNumber = order?.orderNumber || (order?._id ? String(order._id).slice(-8).toUpperCase() : "N/A");
  const total = Number(order?.totalPrice || 0).toLocaleString();

  const itemsHtml = (order?.cart || order?.items || [])
    .map(
      (item) => `
      <tr>
        <td><strong>${item.name}</strong><br><span style="font-size: 11px; color: #78716c;">Qty: ${item.qty || 1} ${item.selectedSize ? `• Size: ${item.selectedSize}` : ""}</span></td>
        <td style="text-align: right; font-weight: 700; font-family: monospace;">${(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB</td>
      </tr>`
    )
    .join("");

  const bodyContent = `
    <span class="badge badge-amber">Order Confirmation</span>
    <h2 class="h1">Selam, ${user?.name || "Customer"}!</h2>
    <p class="p">Thank you for supporting authentic Ethiopian artisans. Your craft order <strong>#${orderNumber}</strong> has been recorded and submitted to our workshop guild.</p>
    
    <div class="escrow-box">
      <strong>🔒 Ethiopian National Escrow Protection:</strong>
      <p style="margin: 4px 0 0;">Your payment is held safely in escrow. Funds will only be released to the artisan once you inspect and confirm receipt of your handwoven garments.</p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Artisan Craft Item</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td><strong>Total Payable</strong></td>
          <td style="text-align: right; font-weight: 900; font-size: 15px; color: #78350f; font-family: monospace;">${total} ETB</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center;">
      <a href="http://localhost:3000/order/${order._id}" class="btn">View Order & Tracking Status</a>
    </div>
  `;

  await mailer.sendMail({
    to: recipientEmail,
    from: `"MEP Traditional Crafts" <${process.env.SMPT_MAIL || "orders@mep.et"}>`,
    subject: `Order #${orderNumber} Confirmed (MEP Traditional Crafts)`,
    html: renderEmailLayout({ title: `Order #${orderNumber} Confirmed`, bodyContent }),
  });
};

/**
 * 2. Payment Succeeded Email (Buyer)
 */
const sendPaymentSuccessEmail = async ({ user, order, tx_ref, chapaId }) => {
  const mailer = getTransporter();
  const recipientEmail = user?.email || order?.user?.email;
  if (!recipientEmail) return;

  const orderNumber = order?.orderNumber || (order?._id ? String(order._id).slice(-8).toUpperCase() : "N/A");
  const total = Number(order?.totalPrice || 0).toLocaleString();

  const bodyContent = `
    <span class="badge badge-emerald">Payment Succeeded</span>
    <h2 class="h1">Payment Verified via Chapa</h2>
    <p class="p">Your payment of <strong>${total} ETB</strong> for Order <strong>#${orderNumber}</strong> was successfully verified and secured in the marketplace escrow vault.</p>

    <div style="background-color: #f5f5f4; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; font-family: monospace;">
      <div><strong>Transaction Ref:</strong> ${tx_ref || "N/A"}</div>
      ${chapaId ? `<div style="margin-top: 4px;"><strong>Chapa Settlement ID:</strong> ${chapaId}</div>` : ""}
      <div style="margin-top: 4px;"><strong>Currency:</strong> ETB (Ethiopian Birr)</div>
      <div style="margin-top: 4px;"><strong>Payment Gateway:</strong> Chapa (Telebirr / CBE Birr / Cards)</div>
    </div>

    <p class="p">Our master weavers and tailors are now preparing your order with traditional Shemma looms and delicate Tibeb embroidery.</p>

    <div style="text-align: center;">
      <a href="http://localhost:3000/order/${order?._id}" class="btn">Track Order Progress</a>
    </div>
  `;

  await mailer.sendMail({
    to: recipientEmail,
    from: `"MEP Payments" <${process.env.SMPT_MAIL || "payments@mep.et"}>`,
    subject: `Payment Receipt: ${total} ETB for Order #${orderNumber}`,
    html: renderEmailLayout({ title: "Payment Verified", bodyContent }),
  });
};

/**
 * 3. Order Status / Courier Dispatch Email (Buyer)
 */
const sendOrderStatusUpdateEmail = async ({ user, order, newStatus, trackingCode, deliveryProvider }) => {
  const mailer = getTransporter();
  const recipientEmail = user?.email || order?.user?.email;
  if (!recipientEmail) return;

  const orderNumber = order?.orderNumber || (order?._id ? String(order._id).slice(-8).toUpperCase() : "N/A");

  const bodyContent = `
    <span class="badge badge-amber">${newStatus}</span>
    <h2 class="h1">Order Status Updated</h2>
    <p class="p">Your order <strong>#${orderNumber}</strong> has progressed to: <strong style="color: #78350f;">${newStatus}</strong>.</p>

    ${
      trackingCode
        ? `
      <div style="background-color: #f5f5f4; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px;">
        <div><strong>Courier Dispatcher:</strong> ${deliveryProvider || "Zonal Courier Partner"}</div>
        <div style="margin-top: 4px; font-family: monospace;"><strong>Courier Tracking Code:</strong> ${trackingCode}</div>
      </div>
    `
        : ""
    }

    <p class="p">Once your parcel arrives, you will have a 72-hour inspection window to inspect the craftsmanship before escrow disbursement.</p>

    <div style="text-align: center;">
      <a href="http://localhost:3000/order/${order?._id}" class="btn">View Live Tracking</a>
    </div>
  `;

  await mailer.sendMail({
    to: recipientEmail,
    from: `"MEP Courier" <${process.env.SMPT_MAIL || "courier@mep.et"}>`,
    subject: `Order #${orderNumber} is now: ${newStatus}`,
    html: renderEmailLayout({ title: `Order Status: ${newStatus}`, bodyContent }),
  });
};

/**
 * 4. Payout Disbursed Email (Merchant)
 */
const sendPayoutConfirmationEmail = async ({ seller, withdraw }) => {
  const mailer = getTransporter();
  const recipientEmail = seller?.email;
  if (!recipientEmail) return;

  const amount = Number(withdraw?.amount || 0).toLocaleString();
  const bank = withdraw?.paymentMethod || "Commercial Bank of Ethiopia";
  const account = withdraw?.bankAccount || "N/A";

  const bodyContent = `
    <span class="badge badge-emerald">Disbursal Succeeded</span>
    <h2 class="h1">Artisan Payout Disbursed</h2>
    <p class="p">Congratulations, <strong>${seller?.name || "Artisan"}</strong>! Your escrow earnings of <strong>${amount} ETB</strong> have been successfully transferred to your banking account.</p>

    <div style="background-color: #f5f5f4; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 12px; font-family: monospace;">
      <div><strong>Disbursed Amount:</strong> ${amount} ETB</div>
      <div style="margin-top: 4px;"><strong>Bank Destination:</strong> ${bank}</div>
      <div style="margin-top: 4px;"><strong>Target Account / Phone:</strong> ${account}</div>
      ${withdraw?.transactionId ? `<div style="margin-top: 4px;"><strong>Chapa Transfer Ref:</strong> ${withdraw.transactionId}</div>` : ""}
    </div>

    <p class="p">Your updated financial ledger and verified tax compliance vouchers are ready in your artisan dashboard.</p>

    <div style="text-align: center;">
      <a href="http://localhost:3000/dashboard/ledger" class="btn">View Financial Ledger</a>
    </div>
  `;

  await mailer.sendMail({
    to: recipientEmail,
    from: `"MEP Finance" <${process.env.SMPT_MAIL || "finance@mep.et"}>`,
    subject: `Payout Confirmed: ${amount} ETB Transferred (${bank})`,
    html: renderEmailLayout({ title: "Payout Disbursed", bodyContent }),
  });
};

/**
 * 5. Followed Artisan New Product Launch Email
 */
const sendNewProductFollowerEmail = async ({ user, product, shop }) => {
  const mailer = getTransporter();
  const recipientEmail = user?.email;
  if (!recipientEmail || !product || !shop) return;

  const price = Number(product.discountPrice || product.originalPrice || 0).toLocaleString();
  const imageUrl =
    product.images?.[0]?.url ||
    product.featuredImage?.url ||
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80";

  const bodyContent = `
    <span class="badge badge-amber">New Artisan Craft</span>
    <h2 class="h1">New Handcrafted Item from ${shop.name}</h2>
    <p class="p">Hello <strong>${user.name || "Craft Lover"}</strong>, an artisan workshop you follow just released a brand new creation:</p>

    <div style="background-color: #fdfaf6; border: 1px solid #fed7aa; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center;">
      <img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 14px;" />
      <h3 style="font-family: Georgia, serif; font-size: 18px; color: #1c1917; margin: 0 0 6px 0;">${product.name}</h3>
      <p style="font-size: 13px; color: #78350f; font-weight: bold; margin: 0 0 10px 0;">${price} ETB ${product.discountPrice && product.originalPrice ? `<span style="text-decoration: line-through; color: #a8a29e; font-size: 11px;">${product.originalPrice} ETB</span>` : ""}</p>
      <div style="font-size: 11px; color: #78716c;">Crafted by <strong>${shop.name}</strong> • ${shop.city || "Addis Ababa"}</div>
    </div>

    <p class="p">Protected by MEP 100% Escrow & Money-Back Guarantee. Custom bespoke measurements supported.</p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/product/${product._id}" class="btn">Explore Handcrafted Piece</a>
    </div>
  `;

  await mailer.sendMail({
    to: recipientEmail,
    from: `"${shop.name} via MEP" <${process.env.SMPT_MAIL || "crafts@mep.et"}>`,
    subject: `New Craft Alert: ${shop.name} released "${product.name}"`,
    html: renderEmailLayout({ title: `New Craft: ${product.name}`, bodyContent }),
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusUpdateEmail,
  sendPayoutConfirmationEmail,
  sendNewProductFollowerEmail,
};
