import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tierId: {
     type: Schema.Types.ObjectId,
      ref: "SubscriptionTier",
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
    },
    stripePriceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    startDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    cancelDate: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscription = model("Subscription", subscriptionSchema);
export default Subscription;