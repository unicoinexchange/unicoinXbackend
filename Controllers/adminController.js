const Admin = require("../Models/adminModel");
const User = require("../Models/userModel");
const Investment = require("../Models/investmentModel");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
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

exports.setUserInvestmentAmount = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user) return next(new AppError("User not found", 404));

    const investPlan = await Investment.findById(user.investmentPlan.id);

    // CLACULATE INVESTMENT INCREASE BY PERCENT
    const investmentIncrease = req.body.amount * (1 + investPlan.totalReturn / 100);
    investPlan.amount = investmentIncrease;

    await investPlan.save();

    res.status(200).json({
        status:"success",
        message:"Investment Amount Inserted"
    });
});

// FUNCTION TO CALCULATE INVESTMENT
let myTimer;
const calculateInvestment = async (investPlan) => {
    console.log("AUTO CALCULATE IS RUNNING");

    const investmentIncrease = investPlan.amount * (1 + investPlan.totalReturn / 100);
    investPlan.amount = investmentIncrease;

    await investPlan.save();
}

const autoCalculateInvestment = async (investPlan) => {
    // CALCULATE THE INTERVALS IN MILLISECONDS
    const intervalInDays = investPlan.duration;

    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const intervalInMiliseconds = intervalInDays * millisecondsInDay;

    // RUN THE TASK INITIALLY
    calculateInvestment(investPlan);

    // SET UP AN INTERVAL TO RETURN THE TASK
    myTimer = setInterval(() => {
        calculateInvestment(investPlan);
    }, intervalInMiliseconds)
}

exports.activateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user) return next(new AppError("User not found", 404));

    const investPlan = await Investment.findById(user.investmentPlan.id);

    if(user.investmentStatus === false) {
        user.investmentStatus = true;
    }

    await user.save({ validateBeforeSave: false });

    if(user.investmentStatus === true){
        // await new Email().sendInvestmentEmail(user, investPlan);
        await autoCalculateInvestment(investPlan);
    }

    res.status(200).json({
        status:"success",
        message:"Investment acitivated"
    });
});

exports.deactivateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user) return next(new AppError("User not found", 404));

    if(user.investmentStatus === true){
        user.investmentStatus = false;
    }

    await user.save({ validateBeforeSave: false });

    if(user.investmentStatus === false) clearInterval(myTimer);

    res.status(200).json({
        status:"success",
        message:"Investment deactivated"
    })
});

exports.adminProtector = protect(Admin);