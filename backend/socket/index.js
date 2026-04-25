import jwt from "jsonwebtoken";
import { Message, Conversation } from "../models/chat.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { envConfig } from "../config/env.js";

// Helper functions for chat permissions
async function canCreatorChatWithSubscriber(creatorId, subscriberId) {
  const subscription = await Subscription.findOne({
    subscriberId,
    creatorId,
    status: "active"
  }).lean().select("_id"); // Optimize: only get _id, use lean()
  return !!subscription;
}

async function canSubscriberChatWithCreator(subscriberId, creatorId) {
  const subscription = await Subscription.findOne({
    subscriberId,
    creatorId,
    status: "active"
  }).lean().select("_id");
  return !!subscription;
}

function extractTokenFromCookieHeader(cookieHeader = "") {
  const tokenPart = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));
  return tokenPart ? decodeURIComponent(tokenPart.slice("token=".length)) : null;
}

// Cache for online users (use Redis in production)
const onlineConnections = new Map();

export function setupSocketIO(io) {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const cookieToken = extractTokenFromCookieHeader(socket.handshake.headers?.cookie || "");
    const token = authToken || cookieToken;
    
    if (!token) {
      console.error("Socket auth error: missing token");
      return next(new Error("Authentication error"));
    }
    
    try {
      const decoded = jwt.verify(token, envConfig.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}, Role: ${socket.userRole}`);
    const userId = socket.userId.toString();
    
    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific rooms
    if (socket.userRole === 'creator') {
      socket.join(`creator:${socket.userId}`);
    } else if (socket.userRole === 'subscriber') {
      socket.join(`subscriber:${socket.userId}`);
    }
    
    const currentConnections = onlineConnections.get(userId) || 0;
    onlineConnections.set(userId, currentConnections + 1);

    // Send snapshot
    socket.emit("online_users", {
      userIds: [...onlineConnections.keys()]
    });

    // Broadcast online status
    io.emit('user_online_status', { userId, isOnline: true });
    
    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.userId;
        
        if (!content || content.trim() === "") {
          socket.emit("message_error", { error: "Message content is required" });
          return;
        }
        
        // Optimized: Fetch users with only needed fields
        const [sender, receiver] = await Promise.all([
          User.findById(senderId).select("fullName role").lean(),
          User.findById(receiverId).select("fullName role").lean()
        ]);
        
        if (!sender || !receiver) {
          socket.emit("message_error", { error: "User not found" });
          return;
        }
        
        // Permission checks (optimized with parallel queries)
        let canChat = false;
        if (sender.role === "creator" && receiver.role === "subscriber") {
          canChat = await canCreatorChatWithSubscriber(senderId, receiverId);
        } else if (sender.role === "subscriber" && receiver.role === "creator") {
          canChat = await canSubscriberChatWithCreator(senderId, receiverId);
        }
        
        if (!canChat) {
          socket.emit("message_error", { error: "You don't have permission to message this user" });
          return;
        }
        
        // Optimized conversation lookup with atomic update
        let conversation = await Conversation.findOneAndUpdate(
          {
            participants: { $all: [senderId, receiverId], $size: 2 }
          },
          {
            $setOnInsert: {
              participants: [senderId, receiverId],
              unreadCount: new Map([[senderId.toString(), 0], [receiverId.toString(), 0]])
            }
          },
          {
            upsert: true,
            new: true,
            lean: true
          }
        );
        
        // Create message and update conversation in parallel
        const [message] = await Promise.all([
          Message.create({
            senderId,
            receiverId,
            content: content.trim()
          }),
          Conversation.updateOne(
            { _id: conversation._id },
            {
              $set: {
                lastMessage: content.trim(),
                lastMessageAt: new Date(),
                lastMessageSender: senderId
              },
              $inc: { [`unreadCount.${receiverId}`]: 1 }
            }
          )
        ]);
        
        // Populate message efficiently
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "fullName email role")
          .populate("receiverId", "fullName email role")
          .lean();
        
        const messageData = {
          _id: populatedMessage._id,
          content: populatedMessage.content,
          senderId: populatedMessage.senderId,
          receiverId: populatedMessage.receiverId,
          createdAt: populatedMessage.createdAt,
          read: populatedMessage.read
        };
        
        // Emit to receiver
        io.to(`user:${receiverId}`).emit("new_message", {
          message: messageData,
          sender: {
            _id: senderId,
            fullName: sender.fullName,
            role: sender.role
          },
          conversationId: conversation._id
        });
        
        // Acknowledge sender
        socket.emit("message_sent", { 
          success: true, 
          messageId: message._id,
          message: messageData
        });
        
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("message_error", { error: error.message });
      }
    });
    
    // Handle typing indicators (optimized with caching)
    socket.on("typing", async (data) => {
      const { receiverId, isTyping } = data;
      socket.to(`user:${receiverId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping
      });
    });
    
    // Handle mark as read (optimized with atomic operations)
    socket.on("mark_read", async (data) => {
      const { senderId } = data;
      const receiverId = socket.userId;
      
      try {
        await Promise.all([
          Message.updateMany(
            { senderId, receiverId, read: false },
            { $set: { read: true, readAt: new Date() } }
          ),
          Conversation.updateOne(
            { participants: { $all: [senderId, receiverId], $size: 2 } },
            { $set: { [`unreadCount.${receiverId}`]: 0 } }
          )
        ]);
        
        socket.emit("messages_read", { success: true, senderId });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      const connectedCount = onlineConnections.get(userId) || 0;
      if (connectedCount <= 1) {
        onlineConnections.delete(userId);
        io.emit('user_online_status', { userId, isOnline: false });
      } else {
        onlineConnections.set(userId, connectedCount - 1);
      }
    });
  });
}