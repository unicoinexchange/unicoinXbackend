const mongoose = require("mongoose");
const validator = require("validator");

const contactSchema = new mongoose.Schema({
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
    phoneNumber:{
        type:String,
        required:[true, "Please enter a your phone number"],
        validate:[validator.isMobilePhone, "Please provide a valid phone number"],
    },
    subject:{
        type:String,
        required:[true, "Please provide a subject"]
    },
    message:{
        type:String,
        required:[true, "Please provide a message"]
    }
})

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;