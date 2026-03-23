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
      enum: ["regular", "premium"],
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
  },
  { timestamps: true }
);

const SubscriptionTier = model("SubscriptionTier", subscriptionTierSchema);
export default SubscriptionTier;