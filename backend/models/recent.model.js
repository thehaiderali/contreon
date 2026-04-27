import mongoose from "mongoose";

const recentlyVisitedSchema = new mongoose.Schema({
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expireAt: { 
    type: Date, 
    default: Date.now,
    expires: 259200  
  }
});

const RecentlyVisited= mongoose.model("RecentlyVisited", recentlyVisitedSchema);
export default RecentlyVisited