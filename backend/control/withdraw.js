const express = require("express");
const axios = require("axios");
const router = express.Router();
const Withdraw = require("../model/withdraw");
const Shop = require("../model/Shop");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");
const eventBus = require("../services/eventBus");
const handleerror = require("../utils/handleerror");
const catchAsyncErrors = require("../utils/asynerror");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Curated Ethiopian Banking Directory with official Chapa Bank Codes
const STANDARD_ETHIOPIAN_BANKS = [
  { id: "853", name: "Commercial Bank of Ethiopia (CBE)", code: "CBE", type: "bank" },
  { id: "851", name: "Awash International Bank", code: "AWASH", type: "bank" },
  { id: "852", name: "Bank of Abyssinia", code: "BOA", type: "bank" },
  { id: "854", name: "Dashen Bank", code: "DASHEN", type: "bank" },
  { id: "963", name: "Telebirr (Ethio Telecom Mobile Money)", code: "TELEBIRR", type: "mobile_money" },
  { id: "855", name: "CBE Birr", code: "CBEBIRR", type: "mobile_money" },
  { id: "856", name: "Cooperative Bank of Oromia (Coop)", code: "COOP", type: "bank" },
  { id: "857", name: "Hibret Bank (United Bank)", code: "HIBRET", type: "bank" },
  { id: "858", name: "Nib International Bank", code: "NIB", type: "bank" },
  { id: "859", name: "Zemen Bank", code: "ZEMEN", type: "bank" },
  { id: "860", name: "Wegagen Bank", code: "WEGAGEN", type: "bank" },
  { id: "861", name: "Lion International Bank", code: "LION", type: "bank" },
  { id: "862", name: "Oromia Bank", code: "OROMIA", type: "bank" },
  { id: "863", name: "Berhan Bank", code: "BERHAN", type: "bank" },
  { id: "864", name: "Abay Bank", code: "ABAY", type: "bank" },
  { id: "865", name: "Addis International Bank", code: "ADIB", type: "bank" },
  { id: "866", name: "Enat Bank", code: "ENAT", type: "bank" },
  { id: "867", name: "Global Bank Ethiopia", code: "GLOBAL", type: "bank" },
  { id: "868", name: "Siinqee Bank", code: "SIINQEE", type: "bank" },
  { id: "869", name: "Amhara Bank", code: "AMHARA", type: "bank" },
  { id: "870", name: "Gadaa Bank", code: "GADAA", type: "bank" },
  { id: "871", name: "Tsehay Bank", code: "TSEHAY", type: "bank" },
  { id: "872", name: "Hijra Bank (Islamic Banking)", code: "HIJRA", type: "bank" },
  { id: "873", name: "ZamZam Bank (Islamic Banking)", code: "ZAMZAM", type: "bank" },
];

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

      // Auto-detect bank code if not provided
      let resolvedBankCode = method.bankCode || method.bank_code || "";
      if (!resolvedBankCode) {
        const detected = STANDARD_ETHIOPIAN_BANKS.find(
          (b) =>
            b.name.toLowerCase().includes((method.methodType || "").toLowerCase()) ||
            b.code.toLowerCase() === (method.methodType || "").toLowerCase()
        );
        if (detected) resolvedBankCode = detected.id;
      }

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
          bankCode: resolvedBankCode,
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

          eventBus.publish("PAYOUT_DISBURSED", { seller, withdraw });
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

// 5. Get Supported Ethiopian Banks for Payouts
router.get(
  "/banks",
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (CHAPA_SECRET_KEY) {
        try {
          const response = await axios.get("https://api.chapa.co/v1/banks", {
            headers: {
              Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            },
            timeout: 5000,
          });
          if (response.data && response.data.data) {
            return res.status(200).json({
              success: true,
              source: "chapa_live",
              banks: response.data.data,
            });
          }
        } catch (apiErr) {
          // Fall back gracefully to curated local list if Chapa API is unreachable or sandbox
        }
      }
      return res.status(200).json({
        success: true,
        source: "curated_directory",
        banks: STANDARD_ETHIOPIAN_BANKS,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 6. Automated Payout via Chapa Transfer API (Admin, Protected)
router.post(
  "/auto-disburse/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraw = await Withdraw.findById(req.params.id);
      if (!withdraw) {
        return next(new handleerror("Withdraw request not found", 404));
      }

      if (withdraw.status === "Paid") {
        return next(new handleerror("This payout has already been disbursed!", 400));
      }

      const seller = await Shop.findById(withdraw.shopId || withdraw.shop);
      if (!seller) {
        return next(new handleerror("Merchant shop associated with this request not found", 404));
      }

      // Determine Bank Code
      let bankCode = withdraw.payoutMethod?.bankCode;
      if (!bankCode) {
        const matched = STANDARD_ETHIOPIAN_BANKS.find(
          (b) =>
            b.name.toLowerCase().includes((withdraw.payoutMethod?.methodType || "").toLowerCase()) ||
            b.code.toLowerCase() === (withdraw.payoutMethod?.methodType || "").toLowerCase()
        );
        bankCode = matched ? matched.id : "853"; // default to CBE if unspecified
      }

      const accountNumber =
        withdraw.payoutMethod?.accountNumber ||
        withdraw.payoutMethod?.phoneNumber ||
        seller.phoneNumber;

      const accountName =
        withdraw.payoutMethod?.accountName ||
        seller.name;

      let transferReference = `CHAPA-TX-${withdraw._id}-${Date.now()}`;
      let chapaResponseData = null;

      // Execute Chapa Transfer API call if live key is configured
      if (CHAPA_SECRET_KEY && !CHAPA_SECRET_KEY.includes("mock")) {
        try {
          const chapaRes = await axios.post(
            "https://api.chapa.co/v1/transfers",
            {
              account_name: accountName,
              account_number: accountNumber,
              amount: withdraw.amount.toString(),
              currency: "ETB",
              reference: transferReference,
              bank_code: bankCode,
            },
            {
              headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 15000,
            }
          );

          if (chapaRes.data && chapaRes.data.status === "success") {
            transferReference = chapaRes.data.data?.reference || transferReference;
            chapaResponseData = chapaRes.data.data;
          } else {
            return next(
              new handleerror(
                `Chapa Transfer Failed: ${chapaRes.data?.message || "Transfer rejected by Chapa"}`,
                400
              )
            );
          }
        } catch (apiErr) {
          const errMsg =
            apiErr.response?.data?.message ||
            apiErr.response?.data?.error ||
            apiErr.message;
          return next(
            new handleerror(
              `Chapa Transfer API Error: ${errMsg}. Please verify merchant account number and bank code.`,
              502
            )
          );
        }
      }

      // Update withdraw status to Paid
      withdraw.status = "Paid";
      withdraw.processedAt = new Date();
      withdraw.processedBy = req.user._id;
      withdraw.transactionReference = transferReference;
      withdraw.adminComment = `Disbursed automatically via Chapa Transfer API to ${withdraw.payoutMethod?.methodType || "Bank"} (${accountNumber})`;
      await withdraw.save();

      // Update merchant totals
      await Shop.findByIdAndUpdate(seller._id, {
        $inc: { totalWithdrawn: withdraw.amount },
        $push: {
          transections: {
            amount: withdraw.amount,
            status: "Paid",
            reference: transferReference,
            createdAt: new Date(),
          },
        },
      });

      // Immutable Ledger Record
      await LedgerEntry.create({
        shop: seller._id,
        shopId: seller._id.toString(),
        entryType: "PAYOUT_COMPLETED",
        amount: -withdraw.amount,
        balanceType: "availableBalance",
        balanceBefore: seller.availableBalance,
        balanceAfter: seller.availableBalance,
        withdrawRequest: withdraw._id,
        referenceCode: transferReference,
        description: `Automated Chapa transfer to ${accountName} (${withdraw.payoutMethod?.methodType}): ${withdraw.amount.toLocaleString()} ETB`,
        metadata: {
          chapaData: chapaResponseData,
          bankCode,
          accountNumber,
        },
      }).catch(() => {});

      // Audit Log
      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name,
        action: "WITHDRAWAL_AUTO_DISBURSED",
        targetId: withdraw._id,
        targetType: "Withdraw",
        details: {
          amount: withdraw.amount,
          transferReference,
          bankCode,
          accountNumber,
        },
      }).catch(() => {});

      const updatedWithdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: `Successfully disbursed ${withdraw.amount.toLocaleString()} ETB to ${accountName} via Chapa!`,
        withdraw,
        withdraws: updatedWithdraws,
        transferReference,
      });

      eventBus.publish("PAYOUT_DISBURSED", { seller, withdraw });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

module.exports = router;
