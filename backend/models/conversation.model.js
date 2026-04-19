import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscriberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { timestamps: true });

conversationSchema.index({ participants: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;