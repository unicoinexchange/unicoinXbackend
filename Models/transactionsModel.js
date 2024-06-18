const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    amount:{
        type:Number,
        required:[true, "Payment must have an amount"]
    },
    paymentMode:{
        type:String,
        required:[true, "Payment must have a mode"]
    },
    TransactionDate: Date

})

const TransactionHistory = mongoose.model("TransactionHistory", transactionSchema);

module.exports = TransactionHistory;