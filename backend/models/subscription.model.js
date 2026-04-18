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
    tierType: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePriceId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "incomplete", "past_due", "cancelled", "incomplete_expired"],
      default: "incomplete",
    },
    startDate: {
      type: Date,
      default: Date.now,
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