const express = require("express");
const Event = require("../model/event");
const catchAsyncErrors = require("../utils/asynerror");
const Shop = require("../model/Shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/handleerror");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// create event
router.post(
  "/create-event",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      let images = [];
      if (req.body.images) {
        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else if (Array.isArray(req.body.images)) {
          images = req.body.images;
        }
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        if (typeof images[i] === "object" && images[i].url) {
          imagesLinks.push(images[i]);
        } else if (typeof images[i] === "string") {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      }

      // Reorder & set featured/main image
      let featuredIndex = parseInt(req.body.featuredImageIndex, 10);
      if (isNaN(featuredIndex) || featuredIndex < 0 || featuredIndex >= imagesLinks.length) {
        featuredIndex = 0;
      }

      if (featuredIndex > 0 && featuredIndex < imagesLinks.length) {
        const [chosenMain] = imagesLinks.splice(featuredIndex, 1);
        imagesLinks.unshift(chosenMain);
      }

      imagesLinks.forEach((img, idx) => {
        img.isFeatured = idx === 0;
      });

      const eventData = { ...req.body };
      eventData.images = imagesLinks;
      if (imagesLinks.length > 0) {
        eventData.featuredImage = {
          public_id: imagesLinks[0].public_id,
          url: imagesLinks[0].url,
        };
      }
      eventData.shop = {
        _id: shop._id,
        name: shop.name,
        email: shop.email,
        avatar: shop.avatar,
        address: shop.address,
        city: shop.city,
        ratings: shop.ratings,
        isVerified: shop.isVerified,
      };
      eventData.shopRef = shop._id;

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// get single event by id
router.get(
  "/get-event/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return next(new ErrorHandler("Cultural promotional event not found!", 404));
      }
      res.status(200).json({
        success: true,
        event,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// get all events
router.get(
  "/get-all-events",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// get all events of a shop
router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// delete event of a shop
router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return next(new ErrorHandler("Event not found with this id", 404));
      }

      if (event.images && event.images.length > 0) {
        for (let i = 0; i < event.images.length; i++) {
          if (event.images[i].public_id) {
            await cloudinary.v2.uploader.destroy(
              event.images[i].public_id
            );
          }
        }
      }

      await Event.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Event deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// all events --- for admin
router.get(
  "/admin-all-events",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
