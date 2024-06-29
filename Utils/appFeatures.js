const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.createOTP = async ( operator ) => {
    const OTP = crypto.randomBytes(2).toString("hex");
    operator.otpToken = crypto.createHash("sha256").update(OTP).digest("hex");

    operator.otpExpires = Date.now() + 10 * 60 * 60;
    return OTP
};

const jwtAuthToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

exports.sendJWTToken = ( operator, statusCode, res ) => {
    const JWTToken = jwtAuthToken(operator._id);

    operator.password = undefined;

    res.status(statusCode).json({
        status:"success",
        JWTToken: JWTToken,
        message: "Login successful",
        data:{
            user:operator
        }
    })
};

exports.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}