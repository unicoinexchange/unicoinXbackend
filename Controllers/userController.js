const User = require("../Models/userModel");
const catchAsync = require("../Utils/catchAsync");
const Email = require("../Utils/email");
const { createOTP } = require("../Utils/appFeatures");
const { forgotPassword, resetPassword, updateMyPassword, updateDetails, verifyOTP, login, protect } = require("./handlerFactory");


exports.userSignUp = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    const OTPToken = await createOTP(newUser);
    newUser.save({ validateBeforeSave: false });

    try{
        await new Email(newUser, OTPToken).sendOTPEmail();
    
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

exports.userVerifyOTP = verifyOTP(User);

exports.userLogIn = login(User);

exports.userForgetPassword = forgotPassword(User);

exports.userResetPassword = resetPassword(User);

exports.userUpdatePassword = updateMyPassword(User);

exports.updateUser = updateDetails(User);

exports.getAllUsers = catchAsync( async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "successful",
        results:users.length,
        data:{
            users:users
        }
    })
});

exports.getUser = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        status:"successful",
        data:{
            data: user
        }
    })
});

exports.userProtector = protect(User);
