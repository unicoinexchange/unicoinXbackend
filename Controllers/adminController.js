const Admin = require("../Models/adminModel");
const AppError = require("../Utils/appError");
const catchAsync = require("../Utils/catchAsync");
const { createOTP, sendJWTToken, correctPassword } = require("../Utils/appFeatures");
const Email = require("../Utils/email");
const crypto = require("crypto");

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

exports.verifyOTP = catchAsync( async (req, res, next) => {

    const adminOTP = req.body.otp;

    const hashedOtp = crypto.createHash("sha256").update(adminOTP).digest("hex");

    const admin = await Admin.findOne({otpToken: hashedOtp, otpExpires: {$gt: Date.now()}});

    if(!admin){
        return next(new AppError("OTP is invalid or has expired", 400));
    }

    admin.active = true;
    admin.otpToken = undefined;
    admin.otpExpires = undefined;
    await admin.save({ validateBeforeSave: false });

    sendJWTToken(admin, 201, res);
});

// exports.adminLogin = catchAsync( async ( req, res, next ) => {
//     const { email, password } = req.body;

//     // CHECK IF EMAIL AND PASSWORD EXIST
//     if(!email || !password) return next( new AppError("Please provide email and password", 404));

//     // CHECK IF USER EXIST && PASSWORD IS CORRECT
//     const admin = await Admin.findOne({email: email}).select("+password");
//     if(!admin || !(await correctPassword(password, admin.password))){
//         return next(new AppError("Incorrect email of password", 401))
//     }

//     // IF EVERYTHING IS OK SEND TOKEN TO CLIENT
//     sendJWTToken(admin, 200, res)
// });

