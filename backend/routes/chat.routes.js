import { Router } from "express";
import { authMiddleware, checkCreatorExists, checkSubscriberExists } from "../middleware/auth.js";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
  markConversationAsRead,
  getCreatorSubscribers,
  getSubscriberCreators,
  getConversationWithUser,
  markMessagesAsRead,
  updateOnlineStatus
} from "../controllers/chat.controller.js";

const chatRouter = Router();

// All chat routes require authentication
chatRouter.use(authMiddleware);

// Conversations
chatRouter.get("/conversations", getMyConversations);
chatRouter.get("/conversations/unread-count", getUnreadCount);
chatRouter.post("/conversations/:otherUserId", getOrCreateConversation);
chatRouter.post("/conversations/:conversationId/read", markConversationAsRead);

// Messages
chatRouter.get("/conversations/:conversationId/messages", getMessages);
chatRouter.post("/messages", sendMessage);
chatRouter.delete("/messages/:messageId", deleteMessage);

// WhatsApp-style endpoints
chatRouter.get("/creator/subscribers", checkCreatorExists, getCreatorSubscribers);
chatRouter.get("/subscriber/creators", checkSubscriberExists, getSubscriberCreators);
chatRouter.get("/conversation/:userId", getConversationWithUser);
chatRouter.post("/mark-read/:userId", markMessagesAsRead);
chatRouter.post("/online-status", updateOnlineStatus);

export default chatRouter;