const Admin = require("../Models/adminModel");
const User = require("../Models/userModel");
const Contact = require("../Models/contactModal");
const TransactionHistory = require("../Models/transactionsModel");
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
    await newAdmin.save({ validateBeforeSave: false });

    try{
        await new Email(newAdmin, OTPToken).sendOTPEmail();

        res.status(200).json({
            status:"success",
            message:"OTP sent to email"
        })
    }catch(err){
        newAdmin.otpToken = undefined;
        newAdmin.otpExpires = undefined;
        newAdmin.save({ validateBeforeSave: false });
        console.log(err)
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

exports.deleteUser = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    // await Investment.findByIdAndDelete(user.investmentPlan.id);
    // user.transactionHistory.map(transaction => TransactionHistory.findByIdAndDelete(transaction.id));
    user.transactionHistory.map(transaction => console.log(transaction.id));
    
    // await User.findByIdAndDelete(req.params.id);
   
    
    res.status(200).json({
        status: "successful",
        message: "Client successfully deleted"
    })
})

exports.setUserInvestmentAmount = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user) return next(new AppError("User not found", 404));

    const history = await TransactionHistory.create({
        amount: req.body.amount,
        paymentMode: req.body.paymentMode,
        TransactionDate: Date.now()
    })

    user.transactionHistory.unshift(history.id);
    await user.save({ validateBeforeSave: false });

    const investPlan = await Investment.findById(user.investmentPlan.id);

    // CALCULATE USER PREVIOUS BALANCE
    const userCurrentState = await User.findById(req.params.id)

    let totalAmt = 0;
    userCurrentState.transactionHistory.map(el => totalAmt += el.amount)

    // CLACULATE INVESTMENT INCREASE BY PERCENT
    const investmentIncrease = totalAmt * (1 + investPlan.percentIncrease / 100);
    investPlan.amount = investmentIncrease.toFixed(2);

    await investPlan.save();

    res.status(200).json({
        status:"success", 
        message:"Investment Amount Inserted"
    });
});

// FUNCTION TO CALCULATE INVESTMENT
let myTimer;
const calculateInvestment = async (user, investPlan) => {

    const investmentIncrease = investPlan.amount * (1 + investPlan.totalReturn / 100);
    investPlan.amount = investmentIncrease;

    await investPlan.save();
}

const autoCalculateInvestment = async (user, investPlan) => {
    // CALCULATE THE INTERVALS IN MILLISECONDS
    const intervalInDays = investPlan.duration;

    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const intervalInMiliseconds = intervalInDays * millisecondsInDay;

    // SET UP AN INTERVAL TO RETURN THE TASK
    myTimer = setInterval(() => {
        calculateInvestment(user, investPlan);
    }, intervalInMiliseconds)
}

exports.activateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.body.id)

    if(!user) return next(new AppError("User not found", 404));

    const investPlan = await Investment.findById(user.investmentPlan.id);

    if(user.investmentStatus === false) {
        user.investmentStatus = true;
    }

    await user.save({ validateBeforeSave: false });

    if(user.investmentStatus === true){
        await new Email(user).sendInvestmentEmail();
        await autoCalculateInvestment(user, investPlan);
    }

    res.status(200).json({
        status:"success",
        message:"Investment activated"
    });
});

exports.deactivateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.body.id)
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

// FOR GETTING CONTACT INFORMATION FROM CLIENT
exports.createContact = catchAsync (async (req, res, next) => {
    const newContact = await Contact.create({
        name:req.body.name,
        email:req.body.email,
        phoneNumber:req.body.phoneNumber,
        subject:req.body.subject,
        message:req.body.message
    });

    await newContact.save(); 
     
    res.status(200).json({
        status:"successful",
        message:"Message was successful"
    })
});

exports.adminProtector = protect(Admin);