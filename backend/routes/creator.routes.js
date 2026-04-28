import { Router } from "express";
import { authMiddleware, checkCreator, checkCreatorExists, checkSubscriberExists } from "../middleware/auth.js";
import {
  getCreatorProfileById,
  getMyCreatorProfile,
  getCreatorById,
  makeCreatorProfile,
  updateCreatorProfile,
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getAllMembershipsForCreator,
  getAllSubscribers,
} from "../controllers/creator.controller.js";
import {
  createPost,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePublishStatus,
  getPostStats
} from "../controllers/post.controller.js";
import {
  searchCreators,
  getRandomCreatorsWithSameInterests,
  addRecommendation,
  getRecommendations,
  deleteRecommendation
} from "../controllers/recommendation.controller.js";
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Collection from "../models/collection.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import { creatorDeleteComment, creatorFeaturedCommentToggle, getAllCommentsForPost } from "../controllers/comment.controller.js";
import { createTranscription } from "../controllers/transcription.controller.js";
import { checkMuxUploadStatus, getSignedPlaybackUrl, MuxUploadUrl } from "../controllers/mux.controller.js";
import { createConnectedAccount, createPayout, createStripeOnboarding, getStripeAccountStatus, getEarnings } from "../controllers/stripe.controller.js";

import {
  getCreatorByUrl,
  getCreatorPostsByUrl,
  getCreatorPostById,
  getCreatorCollectionsByUrl,
  getCreatorMembershipsByUrl
} from "../controllers/page.controller.js";


const creatorRouter = Router();

creatorRouter.get("/recommendations/search",authMiddleware,checkCreatorExists, searchCreators);
creatorRouter.delete("/recommendations/:recommendationId", authMiddleware, checkCreatorExists, deleteRecommendation);
creatorRouter.get("/recommendations/discover",authMiddleware,checkCreatorExists, getRandomCreatorsWithSameInterests);
creatorRouter.post("/recommendations", authMiddleware, checkCreatorExists, addRecommendation);
creatorRouter.get("/recommendations/my-recommendations",authMiddleware,checkCreatorExists, getRecommendations);
creatorRouter.get("/my-subscribers",authMiddleware,checkCreatorExists,getAllSubscribers)
creatorRouter.post("/connect-stripe",authMiddleware,checkCreatorExists,createConnectedAccount);
creatorRouter.post("/stripe-onboarding",authMiddleware,checkCreatorExists,createStripeOnboarding);
creatorRouter.get("/stripe-status",authMiddleware,checkCreatorExists,getStripeAccountStatus);
creatorRouter.post("/request-payout",authMiddleware,checkCreatorExists,createPayout);
creatorRouter.get("/earnings",authMiddleware,checkCreatorExists,getEarnings);
creatorRouter.post("/mux-upload-url", authMiddleware, checkCreatorExists, MuxUploadUrl);
creatorRouter.get("/mux-upload-status/:uploadId", authMiddleware, checkCreatorExists, checkMuxUploadStatus);
creatorRouter.get("/mux-playback-url/:playbackId", authMiddleware, checkCreatorExists, getSignedPlaybackUrl);

// Profile routes
creatorRouter.get("/profile/me", authMiddleware, checkCreator, getMyCreatorProfile);
creatorRouter.get("/profile/:creatorId", getCreatorProfileById);
creatorRouter.get("/:creatorId", getCreatorById);
creatorRouter.post("/profile", authMiddleware, checkCreator, makeCreatorProfile);
creatorRouter.put("/profile/edit", authMiddleware, checkCreator, updateCreatorProfile);

// Membership routes
creatorRouter.post("/memberships", authMiddleware, checkCreatorExists, createMembership);
creatorRouter.get("/memberships/me", authMiddleware, checkCreatorExists, getAllMembershipsForCreator);
creatorRouter.get("/memberships/:id", authMiddleware, checkCreatorExists, getMembershipById);
creatorRouter.put("/memberships/:id", authMiddleware, checkCreatorExists, updateMembership);
creatorRouter.delete("/memberships/:id", authMiddleware, checkCreatorExists, deleteMembership);


// Post routes (creator only)
creatorRouter.post("/posts", authMiddleware, checkCreatorExists, createPost);
creatorRouter.get("/posts/my-posts", authMiddleware, checkCreatorExists, getMyPosts);
creatorRouter.get("/posts/stats", authMiddleware, checkCreatorExists, getPostStats);
creatorRouter.get("/posts/:id", authMiddleware, checkCreatorExists, getPostById);
creatorRouter.put("/posts/:id", authMiddleware, checkCreatorExists, updatePost);
creatorRouter.delete("/posts/:id", authMiddleware, checkCreatorExists, deletePost);
creatorRouter.patch("/posts/:id/publish", authMiddleware, checkCreatorExists, togglePublishStatus);

// Comment routes
creatorRouter.get("/posts/:id/comments", authMiddleware, checkCreatorExists, getAllCommentsForPost);
creatorRouter.delete("/posts/:id/comments/:commentId", authMiddleware, checkCreatorExists, creatorDeleteComment);
creatorRouter.post("/posts/:id/comments/:commentId/feature-toggle", authMiddleware, checkCreatorExists, creatorFeaturedCommentToggle);

creatorRouter.post("/transcribe", authMiddleware, checkCreatorExists, createTranscription);


// Get creator by pageUrl
creatorRouter.get("/by-url/:pageUrl", getCreatorByUrl);

// Get creator's posts by pageUrl
creatorRouter.get("/by-url/:pageUrl/posts", getCreatorPostsByUrl);

// Get single post by ID (public access)
creatorRouter.get("/by-url/:pageUrl/posts/:postId",authMiddleware,checkSubscriberExists, getCreatorPostById);

// Get creator's collections by pageUrl
creatorRouter.get("/by-url/:pageUrl/collections", getCreatorCollectionsByUrl);

// Get creator's memberships by pageUrl
creatorRouter.get("/by-url/:pageUrl/memberships", getCreatorMembershipsByUrl);


export default creatorRouter;