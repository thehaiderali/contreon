import { model, Schema } from "mongoose";

const subscriptionTierSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tierName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    perks: {
      type: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stripePrices: [{ 
    interval: String, 
    priceId: String,
    isActive: { type: Boolean, default: true }
  }],
    stripeProductId:{
      type:String
    },
    stripePriceId:{
      type:String,
    },
   currency: { type: String, default: 'usd' },
  },
  { timestamps: true }
);

const SubscriptionTier = model("SubscriptionTier", subscriptionTierSchema);
export default SubscriptionTier;