import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['message', 'like', 'follow', 'system', 'membership']
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
  metadata: {
    type: Object,
    default: {}
  },
  
},{timestamps:true});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;