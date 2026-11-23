const express = require("express");
const router = express.Router();
const Wallet = require("../model/wallet");
const User = require("../model/user");
const Notification = require("../model/notification");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Helper: Ensure user has a wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      loyaltyCoins: 100, // 100 welcome coins
      transactions: [
        {
          transactionType: "coins_redemption",
          amount: 0,
          coinsChange: 100,
          description: "Welcome loyalty reward coins!",
          status: "completed",
        },
      ],
    });
    await User.findByIdAndUpdate(userId, { wallet: wallet._id, loyaltyCoins: 100 });
  }
  return wallet;
};

// 1. Get Wallet Balance and Summary (with Tiered Loyalty & Cashback Unlocking)
router.get(
  "/balance",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const wallet = await getOrCreateWallet(req.user._id);
      let needsSave = false;

      // 1. Unlock matured pending cashback (AliExpress escrow inspection maturity)
      if (Array.isArray(wallet.pendingCashback) && wallet.pendingCashback.length > 0) {
        const now = new Date();
        for (const item of wallet.pendingCashback) {
          if (item.status === "pending" && item.unlocksAt && new Date(item.unlocksAt) <= now) {
            item.status = "credited";
            wallet.balance += item.amount;
            wallet.totalCashbackEarned = (wallet.totalCashbackEarned || 0) + item.amount;
            wallet.transactions.push({
              transactionType: "cashback",
              amount: item.amount,
              orderId: item.orderId,
              description: "Cashback unlocked following order inspection period",
              status: "completed",
              createdAt: now,
            });
            needsSave = true;
          }
        }
      }

      // 2. Evaluate VIP Tier progression based on buyer total spending
      try {
        const User = require("../model/user");
        const userDoc = await User.findById(req.user._id);
        const spent = userDoc?.buyerStats?.totalSpent || 0;
        let targetTier = "Bronze";
        let targetRate = 1;

        if (spent >= 100000) { targetTier = "Diamond"; targetRate = 5; }
        else if (spent >= 50000) { targetTier = "Platinum"; targetRate = 4; }
        else if (spent >= 25000) { targetTier = "Gold"; targetRate = 3; }
        else if (spent >= 10000) { targetTier = "Silver"; targetRate = 2; }

        if (wallet.loyaltyTier !== targetTier) {
          wallet.loyaltyTier = targetTier;
          wallet.cashbackRate = targetRate;
          wallet.transactions.push({
            transactionType: "loyalty_tier_bonus",
            amount: 0,
            description: `Promoted to ${targetTier} VIP Loyalty Tier (${targetRate}% cashback)!`,
            status: "completed",
            createdAt: new Date(),
          });
          needsSave = true;
        }
      } catch (e) {}

      if (needsSave) {
        await wallet.save();
      }

      res.status(200).json({
        success: true,
        wallet: {
          balance: wallet.balance,
          currency: wallet.currency,
          loyaltyCoins: wallet.loyaltyCoins,
          loyaltyTier: wallet.loyaltyTier || "Bronze",
          cashbackRate: wallet.cashbackRate || 1,
          totalCashbackEarned: wallet.totalCashbackEarned || 0,
          pendingCashback: (wallet.pendingCashback || []).filter((p) => p.status === "pending"),
          referralCode: wallet.referralCode || "",
          recentTransactions: wallet.transactions.slice(-15).reverse(),
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Top-up Wallet Balance (Simulated CBE/Telebirr Top-Up)
router.post(
  "/topup",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount, paymentMethod = "Telebirr" } = req.body;
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0) {
        return next(new ErrorHandler("Please enter a valid positive top-up amount", 400));
      }

      const wallet = await getOrCreateWallet(req.user._id);
      wallet.balance += numAmount;

      // 5% bonus loyalty coins on top-up
      const bonusCoins = Math.round(numAmount * 0.05);
      wallet.loyaltyCoins += bonusCoins;

      const ref = "TOP-" + Date.now() + "-" + Math.floor(100 + Math.random() * 900);

      wallet.transactions.push({
        transactionType: "topup",
        amount: numAmount,
        coinsChange: bonusCoins,
        referenceId: ref,
        description: `Wallet top-up via ${paymentMethod} (+${bonusCoins} bonus coins)`,
        status: "completed",
      });

      await wallet.save();
      await User.findByIdAndUpdate(req.user._id, { loyaltyCoins: wallet.loyaltyCoins });

      res.status(200).json({
        success: true,
        message: `Successfully added ${numAmount.toLocaleString()} ETB to your wallet!`,
        balance: wallet.balance,
        loyaltyCoins: wallet.loyaltyCoins,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Redeem Loyalty Coins for Wallet Balance (100 coins = 50 ETB)
router.post(
  "/redeem-coins",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { coins } = req.body;
      const numCoins = Number(coins);

      if (!numCoins || numCoins < 50) {
        return next(new ErrorHandler("Minimum 50 coins required for redemption", 400));
      }

      const wallet = await getOrCreateWallet(req.user._id);

      if (wallet.loyaltyCoins < numCoins) {
        return next(
          new ErrorHandler(
            `Insufficient coins. You have ${wallet.loyaltyCoins} coins available.`,
            400
          )
        );
      }

      // Conversion rate: 1 coin = 0.5 ETB (e.g. 100 coins = 50 ETB store credit)
      const creditAmount = Math.round((numCoins * 0.5) * 100) / 100;

      wallet.loyaltyCoins -= numCoins;
      wallet.balance += creditAmount;

      wallet.transactions.push({
        transactionType: "coins_redemption",
        amount: creditAmount,
        coinsChange: -numCoins,
        description: `Redeemed ${numCoins} Habesha coins for ${creditAmount} ETB store credit`,
        status: "completed",
      });

      await wallet.save();
      await User.findByIdAndUpdate(req.user._id, { loyaltyCoins: wallet.loyaltyCoins });

      res.status(200).json({
        success: true,
        message: `Redeemed ${numCoins} coins for ${creditAmount} ETB wallet credit!`,
        balance: wallet.balance,
        loyaltyCoins: wallet.loyaltyCoins,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Get Paginated Wallet Transactions
router.get(
  "/transactions",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const wallet = await getOrCreateWallet(req.user._id);
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 15;

      const allTx = (wallet.transactions || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const startIndex = (page - 1) * limit;
      const paginatedTx = allTx.slice(startIndex, startIndex + limit);

      res.status(200).json({
        success: true,
        transactions: paginatedTx,
        total: allTx.length,
        page,
        pages: Math.ceil(allTx.length / limit),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Admin: Inspect User Wallet (Protected, Admin Only)
router.get(
  "/admin/user-wallet/:userId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const targetUser = await User.findById(userId).select("name email phoneNumber role");
      if (!targetUser) {
        return next(new ErrorHandler("User not found", 404));
      }

      const wallet = await getOrCreateWallet(userId);
      res.status(200).json({
        success: true,
        user: targetUser,
        wallet: {
          balance: wallet.balance,
          currency: wallet.currency || "ETB",
          loyaltyCoins: wallet.loyaltyCoins || 0,
          loyaltyTier: wallet.loyaltyTier || "Bronze",
          totalCashbackEarned: wallet.totalCashbackEarned || 0,
          recentTransactions: (wallet.transactions || []).slice(-10).reverse(),
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Admin: Deposit / Credit Funds to User Wallet (Protected, Admin Only)
router.post(
  "/admin/deposit-to-user",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId, amount, description, bonusCoins, transactionRef } = req.body;

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return next(new ErrorHandler("Please provide a valid deposit amount greater than 0", 400));
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return next(new ErrorHandler("User account not found", 404));
      }

      const wallet = await getOrCreateWallet(userId);
      wallet.balance += numAmount;

      const coinsToAdd = parseInt(bonusCoins, 10) || 0;
      if (coinsToAdd > 0) {
        wallet.loyaltyCoins = (wallet.loyaltyCoins || 0) + coinsToAdd;
        await User.findByIdAndUpdate(userId, { loyaltyCoins: wallet.loyaltyCoins });
      }

      const txRef = transactionRef || `ADMIN-DEP-${Date.now()}`;
      const desc = description || `Administrative Deposit (${numAmount.toLocaleString()} ETB)`;

      wallet.transactions.push({
        transactionType: "cashback_earned",
        amount: numAmount,
        coinsChange: coinsToAdd,
        description: desc,
        status: "completed",
        reference: txRef,
        createdAt: new Date(),
      });

      await wallet.save();

      // Create in-app notification for the recipient user
      try {
        await Notification.create({
          user: userId,
          title: "Wallet Credit Received",
          message: `Your marketplace wallet has been credited with ${numAmount.toLocaleString()} ETB. (${desc})`,
          type: "wallet_credit",
          metadata: {
            amount: numAmount,
            reference: txRef,
          },
        });
      } catch (notifErr) {
        console.warn("Could not create user notification for wallet deposit:", notifErr.message);
      }

      res.status(200).json({
        success: true,
        message: `Successfully deposited ${numAmount.toLocaleString()} ETB to ${targetUser.name}'s wallet!`,
        newBalance: wallet.balance,
        newCoins: wallet.loyaltyCoins,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
