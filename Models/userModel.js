const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new  mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please enter your name"]
    },
    email:{
        type:String,
        required:[true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, "Please provide a valid email"]
    },
    role:{
        type:String,
        default:"user"
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confrim your password"],
        validate: {
            // THIS ONLY WORKS ON CREATE AND SAVE
            validator: function(el){
                return el === this.password
            },
            message:"Password are not the same!"
        }
    },
    otpToken: String,
    otpExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.methods.createOTP = async function(){
    const OTP = crypto.randomBytes(2).toString("hex");
    this.otpToken = crypto.createHash("sha256").update(OTP).digest("hex");
    
    this.otpExpires = Date.now() + 10 * 60 * 1000;
    return OTP;
}

const User = mongoose.model("User", userSchema);
module.exports = User;