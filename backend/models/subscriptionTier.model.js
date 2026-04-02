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
    stripeProductId:{
      type:String
    },
    stripePriceId:{
      type:String,
    }
  },
  { timestamps: true }
);

const SubscriptionTier = model("SubscriptionTier", subscriptionTierSchema);
export default SubscriptionTier;