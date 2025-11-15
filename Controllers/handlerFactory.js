const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const Email = require("../Utils/email");
const crypto = require("crypto");
const { promisify } = require("util");
const { createOTP, sendJWTToken, correctPassword } = require("../Utils/appFeatures");
const jwt = require("jsonwebtoken");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.verifyOTP = Model => catchAsync( async (req, res, next) => {
    
    const hashedOtp = crypto.createHash("sha256").update(req.body.otp).digest("hex");
    
    const doc = await Model.findOne({$and: [{otpToken: hashedOtp}, {otpExpires: {$gt: new Date()}}]});
    
    if(!doc){
        return next(new AppError("OTP is invalid or has expired", 400));
    }

    doc.active = true;
    doc.otpToken = undefined;
    doc.otpExpires = undefined;
    await doc.save({ validateBeforeSave: false });

    sendJWTToken(doc, 201, res);
})

exports.login = Model => catchAsync( async (req, res, next) => {
    const { email, password } = req.body;

    // CHECK IF EMAIL AND PASSWORD EXIST
    if(!email || !password) return next( new AppError("Please provide email and password", 404));

    // CHECK IF USER EXIST && PASSWORD IS CORRECT
    const doc = await Model.findOne({email: email}).select("+password");
    if(!doc || !(await correctPassword(password, doc.password))){
        return next(new AppError("Incorrect email or password", 401));
    }

    // IF EVERYTING IS OK, SEND TOKEN TO CLIENT
    sendJWTToken(doc, 200, res);
})

exports.forgotPassword = Model => catchAsync( async (req, res, next) => {
    // GET USER BASED ON USER EMAIL
    const doc = await Model.findOne({email: req.body.email});

    // CHECK IF USER EXIST
    if(!doc) return next(new AppError("There is no user with this email", 404, res));

    // GENERATE RESET TOKEN
    const resetToken = await createOTP(doc);
    await doc.save({ validateBeforeSave: false });

    // SEND GENERATED TOKEN TO USER EMAIL
    try{
        await new Email(doc, resetToken).sendPasswordResetEmail();

        res.status(200).json({
            status:"success",
            message: "Password reset token sent to email"
        })
    }catch (err) {
        doc.otpToken = undefined;
        doc.otpExpires = undefined;
        await doc.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending the email. Try again later!", 500, res));
    }
});

exports.resetPassword = Model => catchAsync( async (req, res, next) => {
    // GET USER BASED ON TOKEN
    const hashedToken = crypto.createHash("sha256").update(req.body.otp).digest("hex");
    
    const doc = await Model.findOne({$and: [{otpToken: hashedToken}, {otpExpires: {$gt: new Date()}}]});
    
    // IF TOKEN HAS NOT EXPIRED AND THERE IS A USER SET THE NEW PASSWORD
    if(!doc) return next(new AppError("Token is invalid or has expired", 400, res));

    doc.password = req.body.password;
    doc.passwordConfirm = req.body.passwordConfirm;
    doc.otpToken = undefined;
    doc.otpExpires = undefined;

    await doc.save();

    // UPDATE changePasswordAt property for user
        // MIDDLE WARE FUNCTION

    // LOG THE USER IN SEND JWT
    sendJWTToken(doc, 201, res);
});

exports.updateMyPassword = Model => catchAsync( async (req, res, next) => {
    // GET USER FROM COLLECTION
    const doc = await Model.findById(req.user.id).select("+password");

    // CHECK IF POSTED CURRENT PASSWORD IS CORRECT
    if(!(await correctPassword(req.body.currentPassword, doc.password))){
        return next(new AppError("Your current password is wrong", 401))
    }

    // IF TRUE, UPDATE PASSWORD
    doc.password = req.body.password;
    doc.passwordConfirm = req.body.passwordConfirm;
    await doc.save();

    // LOG IN USER, SEND JWT
    sendJWTToken(doc, 201, res);
});

exports.updateDetails = Model => catchAsync( async (req, res, next ) => {
    // FILTERED OUT UNWANTED FIELDS NAMES THAT ARE NOT ALLOWED TO BE UPDATED
    const filteredBody = filterObj(req.body, "name", "email");

    // UPDATE USER DOCUMENT
    const updatedDoc = await Model.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:"successful",
        message:"Details updated sucessfully",
        data:{
            user:updatedDoc
        }
    });
});

exports.protect = Model => catchAsync( async (req, res, next) => {
    // GETTING TOKEN AND CHECK IF IT IS PRESENT
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token) return next(new AppError("You are not logged in! Please log in to get access", 401));

    // TOKEN VERIFICATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // CHECK IF USER STILL EXISTS
    const currentDoc = await Model.findById(decoded.id);
    if(!currentDoc){
        return next(new AppError("The user belonging to this token does no longer exist", 401))
    }

    // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
    if(currentDoc.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password! Please log in again.", 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentDoc;
    next();
});

exports.restrictTo = (...roles) => {
    return( req, res, next ) => {
        if(!roles.includes(req.user.role)){
            return next(
                new AppError("You do not have permission to perform this action", 403)
            );
        }
        next();
    };
};