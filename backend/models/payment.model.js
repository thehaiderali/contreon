import mongoose, { mongo } from "mongoose";

const paymentSchema=new mongoose.Schema({

  tierId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubscriptionTier",
    required:true,
  },
  subscriptionId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subscription",
    required:true
  },
  status:{
    type:String,
    enum:["pending","success","failed"],
    default:"pending"
  },
  sessionId:{
    type:String,
    required:true,
  }

},{timestamps:true})
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;