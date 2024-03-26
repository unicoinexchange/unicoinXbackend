const User = require("../Models/userModel");
const Admin = require("../Models/adminModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const Email = require("../Utils/email");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const jwtAuthToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

const sendJWTToken = (user, statusCode, res) => {
    const JWTToken = jwtAuthToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status:"success",
        jwtToken: JWTToken,
        data:{
            user:user
        }
    })
}

exports.userSignUp = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    const OTPToken = await newUser.createOTP();
    newUser.save({ validateBeforeSave: false })

    try{
        const url = 0;
        await new Email(newUser, url, OTPToken).sendOTPEmail();
    
        res.status(200).json({
            status:"success",
            message:"OTP sent to email"
        })
    }catch(err){
        newUser.otpToken = undefined;
        newUser.otpExpires = undefined;
        newUser.save({ validateBeforeSave: false })
    }
});

exports.verifyOTP = catchAsync( async (req, res, next) => {
    const userOTP = req.body.otp
    
    const hashedOtp = crypto.createHash("sha256").update(userOTP).digest("hex");
    
    const user = await User.findOne({otpToken: hashedOtp, otpExpires: {$gt: Date.now()}})

    if(!user){
        return next(new AppError("OTP is invalid or has expired", 400))
    }

    sendJWTToken(user, 201, res)
});