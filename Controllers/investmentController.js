const Investment = require("../Models/investmentModel");
const catchAsync = require("../Utils/catchAsync");
const User = require("../Models/userModel");
const AppError = require("../Utils/appError");
const { protect } = require("../Controllers/handlerFactory");

exports.createInvestment = catchAsync( async ( req, res, next ) => {
    // RETRIVE USER
    const user = await User.findById(req.user.id);

    // CHECK IF USER ALREADY HAS AN ACTIVE INVESTMENT
    if(user.investmentPlan !== undefined) return next(new AppError("User already has an inactive investment", 400));
    if(user.investmentStatus) return next(new AppError("User already has an active investment, You can only upgrade to a higher plan", 400));

    // PROCEED IN CREATING A NEW INVESTMENT RECORD
    const investment = await Investment.create({
        name:req.body.name, 
        amount: 0.00,
        duration: req.body.duration,
        investmentBonus: req.body.investmentBonus,
        referralBonus: req.body.referralBonus,
        totalReturn: req.body.totalReturn,
    })

    user.investmentPlan = investment.id;
    user.investmentStartDate = new Date();
    
    // CALCULATE INVESTMENT END DATE BASED ON PLAN DURATION AND OTHER CRITERIA
    user.investmentEndDate = new Date(new Date().getTime() + investment.duration);

    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
        status:"successful",
        message: "Investment Successful"
    })
});

exports.investmentProtector = protect(User)



