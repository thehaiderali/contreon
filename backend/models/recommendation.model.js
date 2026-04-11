// models/Recommendation.js
import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  recommendedCreatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  recommendedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

recommendationSchema.index(
  { creatorId: 1, recommendedCreatorId: 1 }, 
  { unique: true }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;