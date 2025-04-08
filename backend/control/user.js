// const User=require("../model/user")
const express = require("express");
const jwt = require("jsonwebtoken");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcrypt");
const handleerror = require("../utils/handleerror");
const Router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const User = require("../model/user")

Router.post(
  "/signup",
  asynfun(async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
       return next(new handleerror("please complete the feild", 400));
      }
      // console.log(name, password, email);

      const isExist = await User.findOne({ email }).select('password');

      console.log(isExist);

      if (isExist) {
        return next(new handleerror("user exists", 400));
      }

      const hashpassword=await bcrypt.hash(password,10);

      // console.log(hashpassword);


      const newUser=new User( {
        name:name,
        password:hashpassword,
        email:email
      });

      await newUser.save();

      const token=jwt.sign({id:newUser._id},"Secret",{ expiresIn: "90d" });
      console.log(token);
      
      const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // sameSite: "none",
        // secure: true,
      };
    
      res.status(200).cookie("token", token, options).json({
        success: true,
        user:newUser,
        token:token
      });


    } catch (error) {
      console.log(error);
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

      const isExist = await User.findOne({ email }).select('password');

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

     res.status(200).cookie("token",hash,option).json({
      success: true,
      user:isExist,
      token:hash
     })

     console.log(hash);

    } catch (error) {
      next(new handleerror(error.message,400));
    }
  })
);

// load user
Router.get(
  "/getuser",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new handleerror("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// log out user
Router.get(
  "/logout",
  asynfun(async (req, res, next) => {
    try {
      res.cookie("token", null, {
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
      return next(new handleerror(error.message, 500));
    }
  })
);

// update user info
Router.put(
  "/update-user-info",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new handleerror("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new handleerror("Please provide the correct information", 400)
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// update user avatar
Router.put(
  "/update-avatar",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      let existsUser = await User.findById(req.user.id);
      if (req.body.avatar !== "") {
        const imageId = existsUser.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });

        existsUser.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await existsUser.save();

      res.status(200).json({
        success: true,
        user: existsUser,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// update user addresses
Router.put(
  "/update-user-addresses",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new handleerror(`${req.body.addressType} address already exists`)
        );
      }

      const existsAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// delete user address
Router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// update user password
Router.put(
  "/update-user-password",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );

      if (!isPasswordMatched) {
        return next(new handleerror("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new handleerror("Password doesn't matched with each other!", 400)
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// find user infoormation with the userId
Router.get(
  "/user-info/:id",
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// all users --- for admin
Router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),
  asynfun(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// delete users --- admin
Router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new handleerror("User is not available with this id", 400)
        );
      }

      const imageId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);



module.exports = Router;
