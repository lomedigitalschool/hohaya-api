const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  userId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
  },
  type: {
    type:String,
    enum: ["rent","deposit","visitFee","commission"]
  },
  amount:Number,
  status: {
    type:String,
    enum: ["pending","completed","failed"]
  },
  paymentMethod:String,
  createdAt: { type:Date, default:Date.now }
})

module.exports = mongoose.model("Transactions",transactionSchema)