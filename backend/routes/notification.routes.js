import express from "express";
import {
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's own notifications
router.get("/me", (req, res, next) => {
  req.params.userId = req.user.userId;
  next();
}, getUserNotifications);

// Get unread count for authenticated user
router.get("/me/unread-count", (req, res, next) => {
  req.params.userId = req.user.userId;
  next();
}, getUnreadCount);

// Mark all my notifications as read
router.put("/me/read-all", (req, res, next) => {
  req.params.userId = req.user.userId;
  next();
}, markAllAsRead);

// Delete my own notification
router.delete("/me/:id", async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}, deleteNotification);

// Get specific notification
router.get("/:id", async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}, getNotificationById);

// Mark specific notification as read
router.put("/:id/read", async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}, markAsRead);

export default router;