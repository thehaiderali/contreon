import mongoose from "mongoose";

const recentlyVisitedSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscriber',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  expireAt: { 
    type: Date, 
    default: Date.now,
    expires: 259200  
  }
});

export default mongoose.model("RecentlyVisited", recentlyVisitedSchema);