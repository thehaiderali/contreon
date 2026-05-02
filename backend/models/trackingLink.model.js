import mongoose from "mongoose";

const trackingLinkSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  source: {
    type: String,
    enum: ["youtube", "instagram", "facebook", "twitter", "custom"],
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  uniqueClicks: {
    type: Number,
    default: 0
  },
  lastClickedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

trackingLinkSchema.index({ creatorId: 1 });

const TrackingLink = mongoose.models.TrackingLink || mongoose.model("TrackingLink", trackingLinkSchema);


export default TrackingLink;