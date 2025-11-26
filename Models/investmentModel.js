const mongoose = require("mongoose");


const investmentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Subcripton must have a name"]
    },
    amount:{
        type: Number,
        required: [true, "Please enter amount you want to invest"]
    },
    duration:{
        type: Number,
        required: [true, "Please enter duration of investment"]
    },
    dailyInterestRate: {
        type: Number,
        default: 0
    },
    referralBonus: {
        type: Number,
        default: 0
    },
    totalReturn: {
        type: Number,
        default: 0
    },
    availableProfit: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    totalDeposit: {
        type: Number,
        default: 0
    },
    totalWithdraw: {
        type: Number,
        default: 0
    }
})


const Investment = mongoose.model("Investment", investmentSchema)

module.exports = Investment;