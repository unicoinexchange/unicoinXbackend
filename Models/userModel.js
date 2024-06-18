const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    active:{
        type: Boolean,
        default: false,
        select: false
    },
    passwordChangedAt: Date,
    otpToken: String,
    otpExpires: Date,
    investmentPlan:{
        type: mongoose.Schema.ObjectId,
        ref:"Investment"
    },
    transactionHistory:{
        type: [mongoose.Schema.ObjectId],
        ref: "TransactionHistory"
    },
    investmentStatus:{
        type: Boolean,
        default: false,
        select:true,
    },
    investmentStartDate: Date,
    investmentEndDate: Date,
});

// ENCRYPTING/HASHING USERS PASSWORD
userSchema.pre("save", async function(next){
    // checking if password was modified
    if(!this.isModified("password")) return next();

    // if true then encrypt password
    this.password = await bcrypt.hash(this.password, 12);

    // delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre("save", function(next){
    if(!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.changedPasswordAfter = function(JWTTimestap){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestap < changedTimestamp
    }
    return false;
}

// QUERY MIDDLEWARE TO POPULATE THE USER REFERENCE AUTHOMATICALLY WHEN EVER THERE IS A QUERY
userSchema.pre(/^find/, function(next){
    this.populate({
        path:"investmentPlan",
    })
    this.populate({
        path:"transactionHistory"
    })

    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;