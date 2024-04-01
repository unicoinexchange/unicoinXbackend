const Admin = require("../Models/adminModel");
const catchAsync = require("../Utils/catchAsync");
const { createOTP } = require("../Utils/appFeatures");
const Email = require("../Utils/email");
const { forgotPassword, resetPassword, updateMyPassword, updateDetails, verifyOTP, login, protect } = require("./handlerFactory");

exports.adminSignUp = catchAsync( async (req, res, next) => {
    const newAdmin = await Admin.create({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    const OTPToken = await createOTP(newAdmin);
    newAdmin.save({ validateBeforeSave: false });

    try{
        await new Email(newAdmin, OTPToken).sendOTPEmail();

        res.status(200).json({
            status:"success",
            message:"OTP sent to email"
        })
    }catch(err){
        newAdmin.otpToken = undefined;
        newAdmin.otpExpires = undefined;
        newAdmin.save({ validateBeforeSave: false })
    };
});

exports.adminVerifyOTP = verifyOTP(Admin);

exports.adminLogin = login(Admin);

exports.adminForgetPassword = forgotPassword(Admin);

exports.adminResetPassword = resetPassword(Admin);

exports.adminUpdatePassword = updateMyPassword(Admin);

exports.updateAdmin = updateDetails(Admin);


exports.getAllAdmin = catchAsync( async (req, res, next) => {
    const admins = await Admin.find();

    res.status(200).json({
        status:"success",
        result: admins.length,
        data:{
            DataTransferItem:admins
        }
    })
});

exports.getAdmin = catchAsync( async(req, res, next) => {
    const admin = await Admin.findById(req.user.id)

    res.status(200).json({
        status:"success",
        data:{
            data:admin
        }
    })
});

exports.adminProtector = protect(Admin);