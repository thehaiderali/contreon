import { Message, Conversation } from "../models/chat.model.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import mongoose from "mongoose";
import CreatorProfile from "../models/profile.model.js";
// Helper: Check if subscriber has active subscription to creator
async function isActiveSubscriber(subscriberId, creatorId) {
  const subscription = await Subscription.findOne({
    subscriberId,
    creatorId,
    status: "active"
  });
  return !!subscription;
}

// Helper: Check if creator can chat with subscriber
async function canCreatorChatWithSubscriber(creatorId, subscriberId) {
  return await isActiveSubscriber(subscriberId, creatorId);
}

// Helper: Check if subscriber can chat with creator
async function canSubscriberChatWithCreator(subscriberId, creatorId) {
  return await isActiveSubscriber(subscriberId, creatorId);
}

function isParticipant(conversation, userId) {
  return conversation.participants.some(
    (participant) => participant.toString() === userId.toString()
  );
}

// Get or create conversation between two users
export async function getOrCreateConversation(req, res) {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }

    const otherUser = await User.findById(otherUserId).select("-password");
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Permission check based on roles
    const currentUserRole = req.user.role;
    const otherUserRole = otherUser.role;

    if (currentUserRole === "creator" && otherUserRole === "subscriber") {
      const canChat = await canCreatorChatWithSubscriber(currentUserId, otherUserId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          error: "You can only chat with your active subscribers"
        });
      }
    } else if (currentUserRole === "subscriber" && otherUserRole === "creator") {
      const canChat = await canSubscriberChatWithCreator(currentUserId, otherUserId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          error: "You can only chat with creators you are subscribed to"
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "Chat is only available between creators and their subscribers"
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId], $size: 2 }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, otherUserId],
        unreadCount: new Map()
      });
      conversation.unreadCount.set(currentUserId.toString(), 0);
      conversation.unreadCount.set(otherUserId.toString(), 0);
      await conversation.save();
    } else {
      // Reset unread count for current user
      conversation.unreadCount.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        otherUser: {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          email: otherUser.email,
          role: otherUser.role
        }
      }
    });

  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get all conversations for current user
export async function getMyConversations(req, res) {
  try {
    const currentUserId = req.user.userId;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "fullName email role")
      .populate("lastMessageSender", "fullName");

    // Format conversations with other user info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== currentUserId
      );
      const unreadCount = conv.unreadCount.get(currentUserId.toString()) || 0;

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        lastMessageSender: conv.lastMessageSender,
        unreadCount
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        conversations: formattedConversations
      }
    });

  } catch (error) {
    console.error("Error in getMyConversations:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get messages for a conversation
export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId;
    const { limit = 50, before } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    if (!isParticipant(conversation, currentUserId)) {
      return res.status(403).json({
        success: false,
        error: "You are not a participant in this conversation"
      });
    }

    const [participant1, participant2] = conversation.participants;
    
    const query = {
      $or: [
        { senderId: participant1, receiverId: participant2 },
        { senderId: participant2, receiverId: participant1 }
      ],
      $and: [{
        $or: [
          { senderId: currentUserId, deletedBySender: false },
          { receiverId: currentUserId, deletedByReceiver: false }
        ]
      }]
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("senderId", "fullName email role")
      .populate("receiverId", "fullName email role");

    // Mark unread messages as read
    const otherUserId = conversation.participants.find(
      p => p.toString() !== currentUserId
    );
    
    await Message.updateMany(
      {
        receiverId: currentUserId,
        senderId: otherUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Reset unread count
    conversation.unreadCount.set(currentUserId.toString(), 0);
    await conversation.save();

    return res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Send a message (REST endpoint)
export async function sendMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message content is required"
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Message cannot exceed 2000 characters"
      });
    }

    const receiver = await User.findById(receiverId).select("-password");
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found"
      });
    }

    // Permission check
    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    if (senderRole === "creator" && receiverRole === "subscriber") {
      const canChat = await canCreatorChatWithSubscriber(senderId, receiverId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          error: "You can only message your active subscribers"
        });
      }
    } else if (senderRole === "subscriber" && receiverRole === "creator") {
      const canChat = await canSubscriberChatWithCreator(senderId, receiverId);
      if (!canChat) {
        return res.status(403).json({
          success: false,
          error: "You can only message creators you are subscribed to"
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: "Chat is only available between creators and their subscribers"
      });
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        unreadCount: new Map()
      });
      conversation.unreadCount.set(senderId.toString(), 0);
      conversation.unreadCount.set(receiverId.toString(), 0);
      await conversation.save();
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content: content.trim()
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = senderId;
    
    // Increment unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName email role")
      .populate("receiverId", "fullName email role");

    const io = req.app.get("io");
    if (io) {
      const messageData = {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        senderId: populatedMessage.senderId,
        receiverId: populatedMessage.receiverId,
        createdAt: populatedMessage.createdAt,
        read: populatedMessage.read
      };

      const payload = {
        message: messageData,
        sender: {
          _id: req.user.userId,
          fullName: req.user.fullName || populatedMessage.senderId?.fullName,
          role: req.user.role
        },
        conversationId: conversation._id
      };

      io.to(`user:${receiverId}`).emit("new_message", payload);
      console.log("[chat/rest->socket] emitted new_message", {
        from: senderId,
        to: receiverId,
        room: `user:${receiverId}`,
        conversationId: conversation._id.toString(),
        messageId: message._id.toString()
      });
    } else {
      console.warn("[chat/rest->socket] io not available on app instance");
    }

    return res.status(201).json({
      success: true,
      data: {
        message: populatedMessage,
        conversationId: conversation._id
      }
    });

  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Delete a message (for current user only)
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found"
      });
    }

    if (message.senderId.toString() === currentUserId) {
      message.deletedBySender = true;
    } else if (message.receiverId.toString() === currentUserId) {
      message.deletedByReceiver = true;
    } else {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own messages"
      });
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteMessage:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get unread count for current user
export async function getUnreadCount(req, res) {
  try {
    const currentUserId = req.user.userId;

    const conversations = await Conversation.find({
      participants: currentUserId
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(currentUserId.toString()) || 0;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUnread
      }
    });

  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Mark conversation as read
export async function markConversationAsRead(req, res) {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    if (!isParticipant(conversation, currentUserId)) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const otherUserId = conversation.participants.find(
      p => p.toString() !== currentUserId
    );

    // Mark messages as read
    await Message.updateMany(
      {
        receiverId: currentUserId,
        senderId: otherUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Reset unread count
    conversation.unreadCount.set(currentUserId.toString(), 0);
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read"
    });

  } catch (error) {
    console.error("Error in markConversationAsRead:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Add these imports at the top


// Get all subscribers for a creator (WhatsApp-style)
export async function getCreatorSubscribers(req, res) {
  try {
    const creatorId = req.user.userId;

    // Get all active subscriptions for this creator
    const subscriptions = await Subscription.find({
      creatorId,
      status: "active"
    }).populate("subscriberId", "fullName email role");

    // Get all conversations for this creator
    const conversations = await Conversation.find({
      participants: creatorId
    });

    // Create a map of last messages
    const lastMessageMap = new Map();
    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(
        p => p.toString() !== creatorId
      );
      
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: creatorId, receiverId: otherParticipant },
          { senderId: otherParticipant, receiverId: creatorId }
        ],
        $and: [{
          $or: [
            { senderId: creatorId, deletedBySender: false },
            { receiverId: creatorId, deletedByReceiver: false }
          ]
        }]
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        lastMessageMap.set(otherParticipant.toString(), {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        });
      }
    }

    // Format subscribers list
    const subscribers = [];
    for (const sub of subscriptions) {
      const subscriber = sub.subscriberId;
      const lastMessageData = lastMessageMap.get(subscriber._id.toString());
      
      // Get unread count
      const unreadCount = await Message.countDocuments({
        senderId: subscriber._id,
        receiverId: creatorId,
        read: false
      });

      subscribers.push({
        _id: subscriber._id,
        fullName: subscriber.fullName,
        email: subscriber.email,
        role: subscriber.role,
        lastMessage: lastMessageData?.content || null,
        lastMessageAt: lastMessageData?.createdAt || sub.createdAt,
        lastMessageSender: lastMessageData?.senderId || null,
        unreadCount: unreadCount,
        avatar: null // You can add avatar URL if you have it
      });
    }

    // Sort by lastMessageAt (most recent first)
    subscribers.sort((a, b) => 
      new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
    );

    return res.status(200).json({
      success: true,
      data: { subscribers }
    });

  } catch (error) {
    console.error("Error in getCreatorSubscribers:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get all creators a subscriber is subscribed to (WhatsApp-style)
export async function getSubscriberCreators(req, res) {
  try {
    const subscriberId = req.user.userId;

    // Get all active subscriptions for this subscriber
    const subscriptions = await Subscription.find({
      subscriberId,
      status: "active"
    }).populate("creatorId", "fullName email role");

    // Get all conversations for this subscriber
    const conversations = await Conversation.find({
      participants: subscriberId
    });

    // Create a map of last messages
    const lastMessageMap = new Map();
    for (const conv of conversations) {
      const otherParticipant = conv.participants.find(
        p => p.toString() !== subscriberId
      );
      
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: subscriberId, receiverId: otherParticipant },
          { senderId: otherParticipant, receiverId: subscriberId }
        ],
        $and: [{
          $or: [
            { senderId: subscriberId, deletedBySender: false },
            { receiverId: subscriberId, deletedByReceiver: false }
          ]
        }]
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        lastMessageMap.set(otherParticipant.toString(), {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId
        });
      }
    }

    // Get creator profiles for avatars/banners
    const creatorIds = subscriptions.map(s => s.creatorId._id);
    const profiles = await CreatorProfile.find({
      creatorId: { $in: creatorIds }
    });

    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.creatorId.toString(), profile);
    });

    // Format creators list
    const creators = [];
    for (const sub of subscriptions) {
      const creator = sub.creatorId;
      const profile = profileMap.get(creator._id.toString());
      const lastMessageData = lastMessageMap.get(creator._id.toString());
      
      // Get unread count
      const unreadCount = await Message.countDocuments({
        senderId: creator._id,
        receiverId: subscriberId,
        read: false
      });

      creators.push({
        _id: creator._id,
        fullName: creator.fullName,
        email: creator.email,
        role: creator.role,
        pageName: profile?.pageName,
        pageUrl: profile?.pageUrl,
        avatar: profile?.profileImageUrl,
        bannerUrl: profile?.bannerUrl,
        lastMessage: lastMessageData?.content || null,
        lastMessageAt: lastMessageData?.createdAt || sub.createdAt,
        lastMessageSender: lastMessageData?.senderId || null,
        unreadCount: unreadCount
      });
    }

    // Sort by lastMessageAt (most recent first)
    creators.sort((a, b) => 
      new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
    );

    return res.status(200).json({
      success: true,
      data: { creators }
    });

  } catch (error) {
    console.error("Error in getSubscriberCreators:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get conversation with a specific user (with messages)
export async function getConversationWithUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const { limit = 50, before } = req.query;

    // Check if user exists
    const otherUser = await User.findById(userId).select("-password");
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, userId],
        unreadCount: new Map()
      });
      conversation.unreadCount.set(currentUserId.toString(), 0);
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    // Get messages
    const query = {
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ],
      $and: [{
        $or: [
          { senderId: currentUserId, deletedBySender: false },
          { receiverId: currentUserId, deletedByReceiver: false }
        ]
      }]
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("senderId", "fullName email role")
      .populate("receiverId", "fullName email role");

    // Get last message for preview
    const lastMessage = await Message.findOne({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ],
      $and: [{
        $or: [
          { senderId: currentUserId, deletedBySender: false },
          { receiverId: currentUserId, deletedByReceiver: false }
        ]
      }]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        otherUser: {
          _id: otherUser._id,
          fullName: otherUser.fullName,
          email: otherUser.email,
          role: otherUser.role
        },
        messages: messages.reverse(),
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || null,
        hasMore: messages.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error in getConversationWithUser:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Mark messages as read for a specific user
export async function markMessagesAsRead(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Mark all messages from this user as read
    const result = await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Update conversation unread count
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    });

    if (conversation) {
      conversation.unreadCount.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        updatedCount: result.modifiedCount
      },
      message: "Messages marked as read"
    });

  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Update user online status (for Socket.IO)
export async function updateOnlineStatus(req, res) {
  try {
    const { isOnline } = req.body;
    const userId = req.user.userId;

    // You can store online status in Redis or a separate collection
    // For now, we'll just acknowledge
    return res.status(200).json({
      success: true,
      data: { userId, isOnline }
    });

  } catch (error) {
    console.error("Error in updateOnlineStatus:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}