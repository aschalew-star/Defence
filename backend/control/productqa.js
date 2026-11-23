const express = require("express");
const router = express.Router();
const ProductQA = require("../model/productQA");
const Product = require("../model/product");
const Notification = require("../model/notification");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller } = require("../middleware/auth");

// 1. Get Questions & Answers for a Product
router.get(
  "/product/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const questions = await ProductQA.find({
        product: productId,
        status: "published",
      }).sort({ helpfulVotes: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        questions,
        total: questions.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Ask a Question About a Product (Authenticated Shopper)
router.post(
  "/ask",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, question } = req.body;

      if (!productId || !question || !question.trim()) {
        return next(new ErrorHandler("Product ID and question text are required", 400));
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const newQA = await ProductQA.create({
        product: product._id,
        shop: product.shopRef || product.shopId,
        user: req.user._id,
        userName: req.user.name || "Habesha Customer",
        userAvatar: req.user.avatar?.url || "",
        question: question.trim(),
        answers: [],
      });

      // Increment product questionsCount
      await Product.findByIdAndUpdate(productId, {
        $inc: { questionsCount: 1 },
      });

      // Notify the artisan shop owner
      if (product.shopRef) {
        await Notification.create({
          recipient: product.shopRef,
          recipientType: "seller",
          title: "New Customer Question 💬",
          message: `${req.user.name || "A customer"} asked about "${product.name}": "${question.slice(0, 80)}..."`,
          type: "qa_reply",
          referenceId: newQA._id.toString(),
          referenceUrl: `/product/${product._id}`,
        }).catch(() => {});
      }

      res.status(201).json({
        success: true,
        message: "Your question has been posted! The artisan workshop will be notified.",
        qa: newQA,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Answer a Question (Artisan Merchant or Admin)
router.post(
  "/answer/:questionId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { answer } = req.body;
      const { questionId } = req.params;

      if (!answer || !answer.trim()) {
        return next(new ErrorHandler("Answer text is required", 400));
      }

      const qa = await ProductQA.findById(questionId);
      if (!qa) {
        return next(new ErrorHandler("Question not found", 404));
      }

      // Verify seller owns this product's shop
      const sellerIdStr = req.seller._id.toString();
      if (qa.shop.toString() !== sellerIdStr) {
        return next(new ErrorHandler("You can only answer questions for your own workshop crafts", 403));
      }

      qa.answers.push({
        responder: req.seller._id,
        responderType: "merchant",
        responderName: req.seller.name || "Artisan Workshop",
        answer: answer.trim(),
        isVerifiedSeller: true,
        createdAt: new Date(),
      });

      await qa.save();

      // Notify the customer who asked
      await Notification.create({
        recipient: qa.user,
        recipientType: "user",
        title: "Artisan Answered Your Question! ✨",
        message: `${req.seller.name} answered your question: "${answer.slice(0, 100)}..."`,
        type: "qa_reply",
        referenceId: qa.product.toString(),
        referenceUrl: `/product/${qa.product}`,
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: "Answer published successfully!",
        qa,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Upvote / Helpful Question
router.put(
  "/helpful/:questionId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const qa = await ProductQA.findByIdAndUpdate(
        req.params.questionId,
        { $inc: { helpfulVotes: 1 } },
        { new: true }
      );

      if (!qa) {
        return next(new ErrorHandler("Question not found", 404));
      }

      res.status(200).json({
        success: true,
        helpfulVotes: qa.helpfulVotes,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
