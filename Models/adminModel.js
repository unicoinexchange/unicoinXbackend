const mongoose = require('mongoose');
const validator = require("validator");

const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please enter your name"]
    },
    email:{
        type:String,
        required: [true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    role:{
        type:String,
        default:"admin"
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confirm your password"],
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
        default: true,
        select: false
    }
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;