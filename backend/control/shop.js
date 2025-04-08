const express = require("express");
const jwt = require("jsonwebtoken");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcrypt");
const handleerror = require("../utils/handleerror");
const Router = express.Router();
const { isAuthenticated, isSeller } = require("../middleware/auth");

const Shop = require("../model/shop");


Router.post(
  "/shopcreate",
  asynfun(async (req, res, next) => {
    try {
      const { name, email, password,  zipCode, address, phoneNumber } =
        req.body;

      if (!name || !email || !password) {
        return next(new handleerror("please complete the feild", 400));
      }
    //   console.log(name, password, email);

      const isExist = await Shop.findOne({ email }).select("password");

    //   console.log(isExist);

      if (isExist) {
        return next(new handleerror("seller  exists", 400));
      }

      const hashpassword = await bcrypt.hash(password, 10);

      console.log(hashpassword);

      const newseller = new Shop({
        name, email, password:hashpassword,  zipCode, address, phoneNumber 
      });

      await newseller.save();

      const token = jwt.sign({ id: newseller._id }, "Secret", {
        expiresIn: "90d",
      });
      console.log(token);

      const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // sameSite: "none",
        // secure: true,
      };

      res.status(200).cookie("seller_token", token, options).json({
        success: true,
        user: newseller,
        seller_token: token,
      });

    } catch (error) {
      console.log(error);

      return next(new handleerror(" error exists", 400));

    }
  })
);


Router.post(
    "/login",
    asynfun(async (req, res,next) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return next(new handleerror("please complete all feild", 400));
        }
  
        const isExist = await Shop.findOne({ email }).select('password');
  
        // console.log(isExist);
  
        if (!isExist) {
          return next(new handleerror("user does not exist", 400));
        }
  
        const compare=await bcrypt.compare(password,isExist.password);
  
        // console.log(compare);
  
        if(!compare){
          return next(new handleerror("Incorrect password", 400));
  
        }
  
       const hash= jwt.sign({id:isExist._id},"Secret",{expiresIn:"7d"});
  
  
       const option={ expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // sameSite: "none",
        // secure: true,
      }
  
       res.status(200).cookie("seller_token",hash,option).json({
        success: true,
        user:isExist,
        seller_token:hash
       })
  
       console.log(hash);
  
      } catch (error) {
        next(new handleerror(error.message,400));
      }
    })
  );


  // all sellers --- for admin
  Router.get(
  "/admin-all-sellers",
  // isAuthenticated,
  // isAdmin("Admin"),
  asynfun(async (req, res, next) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
Router.get(
  "/getSeller",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true, 
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// log out from shop
Router.get(
  "/logout",
  asynfun(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get shop info
Router.get(
  "/get-shop-info/:id",
  asynfun(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update shop profile picture
Router.put(
  "/update-shop-avatar",
  // isSeller,
  asynfun(async (req, res, next) => {
    try {
      let existsSeller = await Shop.findById(req.seller._id);

        const imageId = existsSeller.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });

        existsSeller.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

  
      await existsSeller.save();

      res.status(200).json({
        success: true,
        seller:existsSeller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
Router.put(
  "/update-seller-info",
  // isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



// delete seller ---admin
Router.delete(
  "/delete-seller/:id",
  // isAuthenticated,
  // isAdmin("Admin"),
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
Router.put(
  "/update-payment-methods",
  // isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete seller withdraw merthods --- only seller
Router.delete(
  "/delete-withdraw-method/",
  // isSeller,
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);




module.exports=Router