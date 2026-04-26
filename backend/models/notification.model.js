// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  creatorId: {
    type: String,
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['new_post', 'new_video', 'live_stream', 'announcement', 'special_offer', 'message', 'like', 'follow', 'system', 'membership']
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  actionData: {
    type: Object,
    default: {}
  },
  metadata: {
    type: Object,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ creatorId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  await this.save();
  return this;
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, read: false });
};

// Static method to create notifications for all subscribers
notificationSchema.statics.notifySubscribers = async function(creatorId, subscribers, notificationData) {
  const notifications = subscribers.map(subscriber => ({
    userId: subscriber.userId,
    creatorId: creatorId,
    ...notificationData
  }));
  
  if (notifications.length === 0) return [];
  
  return await this.insertMany(notifications);
};

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;