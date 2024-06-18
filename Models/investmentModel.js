const mongoose = require("mongoose");


const investmentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Subcripton must have a name"]
    },
    amount:{
        type:Number,
        required: [true, "Please enter amount you want to invest"]
    },
    duration:{
        type:Number,
        required: [true, "Please enter duration of investment"]
    },
    referralBonus: Number,
    totalReturn: Number,
})


const Investment = mongoose.model("Investment", investmentSchema)

module.exports = Investment;