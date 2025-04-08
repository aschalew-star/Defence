const ErrorHandler = require("./catchAsynErrors");
const catchAsyncErrors = require("../utils/asynerror");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, "Secret");

    req.user = await User.findById(decoded.id);

    next();
});


exports.isSeller = catchAsyncErrors(async(req,res,next) => {

    const {seller_token} = req.cookies;

    console.log(seller_token);
    
    if(!seller_token){
        return next(new ErrorHandler("Please login to continue", 401));
    }
    
    const decoded = jwt.verify(seller_token, "Secret");
    
    req.seller = await Shop.findById(decoded.id);
    
    console.log(req.seller);

    next();
});


exports.isAdmin = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
        };
        next();
    }
}


