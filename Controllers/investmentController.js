const Investment = require("../Models/investmentModel");
const catchAsync = require("../Utils/catchAsync");
const User = require("../Models/userModel");
const AppError = require("../Utils/appError");
const { protect } = require("../Controllers/handlerFactory");

exports.createInvestment = catchAsync( async ( req, res, next ) => {
    // RETRIVE USER
    const user = await User.findById(req.user.id);

    // CHECK IF USER ALREADY HAS AN ACTIVE INVESTMENT
    if(user.investmentPlan !== undefined && user.investmentStatus === false){
        res.status(200).json({
            message:"You already have an inactive investment, complete your payment to activate"
        })
        return;
    } 

    if(user.investmentStatus){
        res.status(200).json({
            message:"You already have an active investment, You can only upgrade to a higher plan"
        })
        return;
    } 

    // PROCEED IN CREATING A NEW INVESTMENT RECORD
    const investment = await Investment.create({
        name:req.body.name, 
        amount: 0.00,
        duration: req.body.duration,
        referralBonus: 0.00,
        percentIncrease: req.body.percentIncrease,
        bonus: 0.00,
        totalDeposit: 0.00,
        availableProfit: 0.00,
        totalWithdraw: 0.00
    })

    user.investmentPlan = investment.id;
    user.investmentStartDate = new Date();
    
    // CALCULATE INVESTMENT END DATE BASED ON PLAN DURATION AND OTHER CRITERIA
    user.investmentEndDate = new Date(new Date().getTime() + investment.duration);

    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        status:"successful",
        message: "Investment details submitted successfully, proceed to payment"
    })
});

exports.investmentProtector = protect(User)



