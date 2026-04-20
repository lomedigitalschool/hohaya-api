
const mongoose = require("mongoose")

const visitSchema =new mongoose.Schema({
  propertyId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Properties"
  },
  tenantId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
  },
  ownerId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
  },
  visitDate:Date,
  status: {
    type:String,
    enum: ["pending","accepted","rejected","completed"],
    default:"pending"
  },
  message:String,
  createdAt: { type:Date, default:Date.now }
})

module.exports=mongoose.model("Visits",visitSchema)