const express = require("express");
const router = express.Router();
const Category = require("../model/category");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const { ETHIOPIAN_CATEGORIES } = require("../config/constants");

// 1. Get All Categories (Public, with hierarchical nesting or flat list)
router.get(
  "/get-all-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let categories = await Category.find({ isActive: true })
        .populate("parent", "name slug")
        .sort({ sortOrder: 1, name: 1 });

      // If database is fresh/empty, auto-seed with standard Ethiopian categories
      if (categories.length === 0) {
        const seedData = ETHIOPIAN_CATEGORIES.map((catName, index) => ({
          name: catName,
          sortOrder: index,
          isActive: true,
        }));
        categories = await Category.insertMany(seedData);
      }

      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Get Single Category Details
router.get(
  "/get-category/:slugOrId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { slugOrId } = req.params;
      let category = null;

      if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(slugOrId).populate("parent");
      }
      if (!category) {
        category = await Category.findOne({ slug: slugOrId }).populate("parent");
      }

      if (!category) {
        return next(new ErrorHandler("Category not found!", 404));
      }

      // Find children sub-categories
      const subCategories = await Category.find({
        parent: category._id,
        isActive: true,
      });

      res.status(200).json({
        success: true,
        category,
        subCategories,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Create Category (Admin Protected)
router.post(
  "/admin-create-category",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, icon, parent, commissionRate, image, sortOrder } =
        req.body;

      if (!name) {
        return next(new ErrorHandler("Category name is required!", 400));
      }

      const existing = await Category.findOne({ name: name.trim() });
      if (existing) {
        return next(new ErrorHandler("Category with this name already exists!", 400));
      }

      let imageData = undefined;
      if (image && image.startsWith("data:image")) {
        const result = await cloudinary.v2.uploader.upload(image, {
          folder: "categories",
        });
        imageData = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      const category = await Category.create({
        name: name.trim(),
        description: description || "",
        icon: icon || "",
        parent: parent || null,
        commissionRate: commissionRate !== undefined ? Number(commissionRate) : null,
        image: imageData,
        sortOrder: sortOrder || 0,
      });

      res.status(201).json({
        success: true,
        category,
        message: "Category created successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Update Category (Admin Protected)
router.put(
  "/admin-update-category/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return next(new ErrorHandler("Category not found!", 404));
      }

      const { name, description, icon, parent, commissionRate, isActive, image, sortOrder } =
        req.body;

      if (name) category.name = name.trim();
      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      if (parent !== undefined) category.parent = parent || null;
      if (commissionRate !== undefined)
        category.commissionRate = commissionRate !== null ? Number(commissionRate) : null;
      if (isActive !== undefined) category.isActive = isActive;
      if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);

      if (image && image.startsWith("data:image")) {
        if (category.image?.public_id) {
          await cloudinary.v2.uploader.destroy(category.image.public_id).catch(() => {});
        }
        const result = await cloudinary.v2.uploader.upload(image, {
          folder: "categories",
        });
        category.image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      await category.save();

      res.status(200).json({
        success: true,
        category,
        message: "Category updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Delete Category (Admin Protected)
router.delete(
  "/admin-delete-category/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return next(new ErrorHandler("Category not found!", 404));
      }

      if (category.image?.public_id) {
        await cloudinary.v2.uploader.destroy(category.image.public_id).catch(() => {});
      }

      await Category.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Category deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

