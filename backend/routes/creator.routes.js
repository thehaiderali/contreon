import { Router } from "express";
import { authMiddleware, checkCreator, checkCreatorExists } from "../middleware/auth.js";
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
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Collection from "../models/collection.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import { creatorDeleteComment, creatorFeaturedCommentToggle, getAllCommentsForPost } from "../controllers/comment.controller.js";
import { createTranscription } from "../controllers/transcription.controller.js";
import { checkMuxUploadStatus, getSignedPlaybackUrl, MuxUploadUrl } from "../controllers/mux.controller.js";

const creatorRouter = Router();

// Mux routes
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

// Transcription route
creatorRouter.post("/transcribe", authMiddleware, checkCreatorExists, createTranscription);

// ========== PUBLIC ROUTES FOR CREATOR PAGES ==========

// Get creator by pageUrl
creatorRouter.get("/by-url/:pageUrl", async (req, res) => {
  try {
    const { pageUrl } = req.params;
    
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Creator not found"
      });
    }
    
    const user = await User.findById(profile.creatorId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Creator user not found"
      });
    }
    
    const creatorData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      displayName: profile.pageName,
      url: profile.pageUrl,
      bio: profile.bio,
      avatarUrl: profile.profileImageUrl,
      bannerUrl: profile.bannerUrl,
      aboutPage: profile.aboutPage,
      category: profile.category,
      socialLinks: profile.socialLinks
    };
    
    return res.status(200).json({
      success: true,
      data: creatorData
    });
    
  } catch (error) {
    console.error("Error fetching creator by URL:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

// Get creator's posts by pageUrl
creatorRouter.get("/by-url/:pageUrl/posts", async (req, res) => {
  try {
    const { pageUrl } = req.params;
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    
    const posts = await Post.find({ 
      creatorId: profile.creatorId, 
      isPublished: true 
    }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single post by ID (public access)
creatorRouter.get("/by-url/:pageUrl/posts/:postId", async (req, res) => {
  try {
    const { pageUrl, postId } = req.params;
    
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    
    const post = await Post.findOne({ 
      _id: postId, 
      creatorId: profile.creatorId,
      isPublished: true 
    }).populate("creatorId", "fullName");
    
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    
    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get creator's collections by pageUrl
creatorRouter.get("/by-url/:pageUrl/collections", async (req, res) => {
  try {
    const { pageUrl } = req.params;
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    
    const collections = await Collection.find({ 
      creatorId: profile.creatorId 
    }).populate("posts", "title type isPaid isPublished createdAt thumbnailUrl");
    
    return res.status(200).json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get creator's memberships by pageUrl
creatorRouter.get("/by-url/:pageUrl/memberships", async (req, res) => {
  try {
    const { pageUrl } = req.params;
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    
    const memberships = await SubscriptionTier.find({ 
      creatorId: profile.creatorId,
      isActive: true 
    });
    
    return res.status(200).json({
      success: true,
      data: memberships
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default creatorRouter;