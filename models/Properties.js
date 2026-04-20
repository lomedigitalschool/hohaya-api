
const mongoose = require("mongoose")



const propertySchema = new mongoose.Schema({
  ownerId: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
  },
  title:String,
  description:String,
  type: {
    type:String,
    enum: ["room","house","apartment","land"]
  },
  price:Number,
  rooms:Number,
  location: {
    city:String,
    district:String,
    address:String,
    coordinates: {
      lat:Number,
      lng:Number
    }
  },
  images: [String],
  status: {
    type:String,
    enum: ["active","rented","sold","archived"],
    default:"active"
  },
  isApproved: { type:Boolean, default:false },
  createdAt: { type:Date, default:Date.now }
})



module.exports = mongoose.model("Properties",propertySchema)