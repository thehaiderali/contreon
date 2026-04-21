// import { Router } from "express";
// import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
// import {
//   createSubscription,
//   getMySubscriptions,
//   getCreatorSubscribers,
//   resumeSubscription,
//   checkSubscriptionStatus
// } from "../controllers/subscriptions.controller.js";
// import { createSubscriberCheckout } from "../controllers/stripe.controller.js";
// import { setPaymentCancel, setPaymentSuccess } from "../controllers/payment.controller.js";
// import { cancelSubscription } from "../controllers/stripe.controller.js";
// const subscriptionRouter = Router();

// // Subscriber routes
// subscriptionRouter.post("/create", authMiddleware,checkSubscriberExists, createSubscription);
// subscriptionRouter.post("/create-checkout",authMiddleware,checkSubscriberExists,createSubscriberCheckout)
// subscriptionRouter.get("/my", authMiddleware,checkSubscriberExists, getMySubscriptions);
// subscriptionRouter.get("/check/:creatorId", authMiddleware,checkSubscriberExists, checkSubscriptionStatus);
// subscriptionRouter.post("/:subscriptionId/cancel", authMiddleware,checkSubscriberExists,checkSubscriberExists, cancelSubscription);
// subscriptionRouter.post("/:subscriptionId/resume", authMiddleware,checkSubscriberExists, resumeSubscription);
// subscriptionRouter.post("/stripe-success",authMiddleware,checkSubscriberExists,setPaymentSuccess);
// subscriptionRouter.post("/stripe-cancell",authMiddleware,checkSubscriberExists,setPaymentCancel);
// // Creator routes
// subscriptionRouter.get("/creator/subscribers", authMiddleware, getCreatorSubscribers);

// export default subscriptionRouter;

import { Router } from "express";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
import {
  createSubscription,
  getMySubscriptions,
  getCreatorSubscribers,
  resumeSubscription,
  checkSubscriptionStatus
} from "../controllers/subscriptions.controller.js";
import { 
  createSubscriberCheckout, 
  cancelSubscription,
  reactivateSubscription,
  syncSubscriptionFromStripe,
  getSubscriptionByStripeId,
  debugSubscriptionStatus
} from "../controllers/stripe.controller.js";
import { setPaymentCancel, setPaymentSuccess } from "../controllers/payment.controller.js";

const subscriptionRouter = Router();

// Apply authMiddleware to all routes
subscriptionRouter.use(authMiddleware);

// ==================== SUBSCRIBER ROUTES ====================

// Checkout and Payment
subscriptionRouter.post("/create-checkout", checkSubscriberExists, createSubscriberCheckout);
subscriptionRouter.post("/stripe-success", checkSubscriberExists, setPaymentSuccess);
subscriptionRouter.post("/stripe-cancel", checkSubscriberExists, setPaymentCancel);

// Subscription Management
subscriptionRouter.post("/create", checkSubscriberExists, createSubscription);
subscriptionRouter.get("/my", checkSubscriberExists, getMySubscriptions);
subscriptionRouter.get("/check/:creatorId", checkSubscriberExists, checkSubscriptionStatus);
subscriptionRouter.post("/:subscriptionId/cancel", checkSubscriberExists, cancelSubscription);
subscriptionRouter.post("/:subscriptionId/reactivate", checkSubscriberExists, reactivateSubscription);
subscriptionRouter.post("/:subscriptionId/resume", checkSubscriberExists, resumeSubscription);

// Sync and Debug (Admin/Dev routes)
subscriptionRouter.post("/:subscriptionId/sync", checkSubscriberExists, syncSubscriptionFromStripe);
subscriptionRouter.get("/stripe/:stripeSubscriptionId", checkSubscriberExists, getSubscriptionByStripeId);

// ==================== CREATOR ROUTES ====================
subscriptionRouter.get("/creator/subscribers", getCreatorSubscribers);
subscriptionRouter.get("/debug/:subscriptionId", authMiddleware, debugSubscriptionStatus);

export default subscriptionRouter;