const User = require("../Models/userModel");
const { promisify } = require("util");
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

exports.verifyOTP = catchAsync( async (req, res, next) => {
    const userOTP = req.body.otp
    
    const hashedOtp = crypto.createHash("sha256").update(userOTP).digest("hex");
    
    const user = await User.findOne({otpToken: hashedOtp, otpExpires: {$gt: Date.now()}})

    if(!user){
        return next(new AppError("OTP is invalid or has expired", 400))
    }

    user.otpToken = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false })

    sendJWTToken(user, 201, res)
});

exports.userLogIn = catchAsync( async ( req, res, next ) => {
    const { email, password } = req.body;

    // CHECK IF EMAIL AND PASSWORD EXIST
    if(!email || !password) return next( new AppError("Please provide email and password", 404));

    // CHECK IF USER EXIST && PASSWORD IS CORRECT
    const user = await User.findOne({email: email}).select("+password")
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("Incorrect email or password", 401))
    }

    // IF EVERYTING IS OK, SEND TOKEN TO CLIENT
    sendJWTToken(user, 200, res)
})

exports.forgotPassword = catchAsync( async (req, res, next ) => {
    // GET USER BASED ON USER EMAIL
    const user = await User.findOne({email: req.body.email})

    // CHECK IF USER EXIST
    if(!user) return next(new AppError("There is no user with this email", 404));

    // GENERATE RESET TOKEN
    const resetToken = await user.createOTP();
    await user.save({ validateBeforeSave: false });

    // SEND GENERATED TOKEN TO USER EMAIL
    try{
        await new Email(user, resetToken).sendPasswordResetEmail();

        res.status(200).json({
            status:"success",
            message: "Password reset token sent to email"
        })
    }catch (err) {
        user.otpToken = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Try again later!, 500"));
    }
});

exports.resetPassword = catchAsync( async ( req, res, next ) => {
    // GET USER BASED ON TOKEN
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({otpToken: hashedToken, otpExpires: {$gt: Date.now()}});

    // IF TOKEN HAS NOT EXPIRED AND THERE IS A USER SET THE NEW PASSWORD
    if(!user) return next(new AppError("Token is invalid or has expired", 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.otpToken = undefined;
    user.otpExpires = undefined;

    await user.save();

    // UPDATE changePasswordAt property for user
        // MIDDLE WARE FUNCTION

    // LOG THE USER IN SEND JWT
    sendJWTToken(user, 201, res)
});

exports.updateMyPassword = catchAsync( async (req, res, next) => {
    // GET USER FROM COLLECTION
    const user = await User.findById(req.user.id).select("+password");

    // CHECK IF POSTED CURRENT PASSWORD IS CORRECT
    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError("Your current password is wrong", 401))
    }

    // IF TRUE, UPDATE PASSWORD
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // LOG IN USER, SEND JWT
    sendJWTToken(user, 201, res)
})

exports.protect = catchAsync( async (req, res, next) => {
    // GETTING TOKEN AND CHECK IF IT IS PRESENT
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) return next(new AppError("You are not logged in! Please log in to get access", 401));

    // TOKEN VERIFICATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // CHECK IF USER STILL EXISTS
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError("The user belonging to this token does no longer exist", 401))
    }

    // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if(!currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password! Please log in again.", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});