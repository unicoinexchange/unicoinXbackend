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

exports.editUserInvestmentDetails = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user.investmentPlan) return next(new AppError("User does not have an investment plan", 404));

    const investment = await Investment.findById(user.investmentPlan.id)

    investment.bonus = req.body.bonus;
    investment.referralBonus = req.body.referralBonus;
    investment.totalDeposit = req.body.totalDeposit;
    investment.availableProfit = req.body.availableProfit;
    investment.totalWithdraw = req.body.totalWithdraw;

    await investment.save();

    res.status(200).json({
        status: "successful",
        message: "Investment successfully updated"
    })
})

exports.getUser = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)

    res.status(200).json({
        status: "successful",
        data:{
            user:user
        }
    })
})

exports.deleteUser = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user.investmentPlan) return await User.findByIdAndDelete(req.params.id);

    await Investment.findByIdAndDelete(user.investmentPlan.id);

    if(user.transactionHistory.length === 0) return await User.findByIdAndDelete(req.params.id)

    for(var x = 0; x < user.transactionHistory.length; x++){
        var transactionId = user.transactionHistory[x].id
        await TransactionHistory.findByIdAndDelete(transactionId)
    }

    await User.findByIdAndDelete(req.params.id);
   
    res.status(200).json({
        status: "successful",
        message: "Client successfully deleted"
    })
})

exports.setUserInvestmentAmount = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.params.id)
  
    if(!user) return next(new AppError("User not found", 404));

    if(!user.investmentPlan) return next(new AppError("User does not have an investment plan", 404));

    const investPlan = await Investment.findById(user.investmentPlan.id);

    const history = await TransactionHistory.create({
        amount: req.body.amount,
        paymentMode: req.body.paymentMode,
        TransactionDate: Date.now()
    })
    
    user.transactionHistory.unshift(history.id);
    await user.save({ validateBeforeSave: false });

    // CALCULATE USER PREVIOUS BALANCE
    const userCurrentState = await User.findById(req.params.id)

    let totalAmt = 0;
    userCurrentState.transactionHistory.map(el => totalAmt += el.amount)

    investPlan.amount = totalAmt.toFixed(2);

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
        // calculateInvestment(user, investPlan);
    }, intervalInMiliseconds)
}

exports.activateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.body.id)

    if(!user) return next(new AppError("User not found", 404));

    if(!user.investmentPlan) return next(new AppError("User cannot be activated without investment plan", 404));

    if(user.transactionHistory.length === 0) return next(new AppError("User investment cannot be activated without transaction", 404))

    const investPlan = await Investment.findById(user.investmentPlan.id);

    if(user.investmentStatus === false) {
        user.investmentStatus = true;
        await new Email(user).sendInvestmentEmail();
        // await autoCalculateInvestment(user, investPlan);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status:"success",
        message:"Investment activated"
    });
});

exports.deactivateUserInvestment = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.body.id)
    if(!user) return next(new AppError("User not found", 404));

    if(!user.investmentPlan) return next(new AppError("User has no investment", 404));

    if(!user.investmentStatus) return next(new AppError("User has no active investment", 404));

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