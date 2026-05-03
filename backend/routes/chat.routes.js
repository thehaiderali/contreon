import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const router = Router();

// Get all conversations for current user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate("participants", "fullName email role profileImageUrl")
    .sort({ lastMessageAt: -1 });
    
    // Get unread counts
    const conversationsWithUnread = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCount = conv.unreadCount.get(userId) || 0;
      return convObj;
    });
    
    return res.status(200).json({
      success: true,
      data: conversationsWithUnread
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get or create conversation between two users
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.userId;
    
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    }).populate("participants", "fullName email role profileImageUrl");
    
    if (!conversation) {
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
      
      conversation = new Conversation({
        participants: [userId, otherUserId],
        creatorId: otherUser.role === "creator" ? otherUserId : userId,
        subscriberId: otherUser.role === "subscriber" ? otherUserId : userId,
        unreadCount: new Map([[userId, 0], [otherUserId, 0]])
      });
      await conversation.save();
      await conversation.populate("participants", "fullName email role profileImageUrl");
    }
    
    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get messages for a conversation
router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;
    
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }
    
    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullName email role profileImageUrl")
      .populate("receiverId", "fullName email role profileImageUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ conversationId })
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get unread count
router.get("/unread", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false
    });
    
    return res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

export default router;