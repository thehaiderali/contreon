import { Router } from "express";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
import {
  createSubscription,
  getMySubscriptions,
  getCreatorSubscribers,
  cancelSubscription,
  resumeSubscription,
  checkSubscriptionStatus
} from "../controllers/subscriptions.controller.js";

const subscriptionRouter = Router();

// Subscriber routes
subscriptionRouter.post("/create", authMiddleware,checkSubscriberExists, createSubscription);
subscriptionRouter.get("/my", authMiddleware,checkSubscriberExists, getMySubscriptions);
subscriptionRouter.get("/check/:creatorId", authMiddleware,checkSubscriberExists, checkSubscriptionStatus);
subscriptionRouter.post("/:subscriptionId/cancel", authMiddleware,checkSubscriberExists,checkSubscriberExists, cancelSubscription);
subscriptionRouter.post("/:subscriptionId/resume", authMiddleware,checkSubscriberExists, resumeSubscription);

// Creator routes
subscriptionRouter.get("/creator/subscribers", authMiddleware, getCreatorSubscribers);

export default subscriptionRouter;