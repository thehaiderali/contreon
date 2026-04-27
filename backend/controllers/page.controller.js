import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Collection from "../models/collection.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import Subscription from "../models/subscription.model.js";
import mongoose from "mongoose"; 

export const getCreatorByUrl = async (req, res) => {
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
};

// Get creator's posts by pageUrl
export const getCreatorPostsByUrl = async (req, res) => {
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
};

// Get single post by ID (public access)
export const getCreatorPostById = async (req, res) => {
  try {
    const { pageUrl, postId } = req.params;
    const token = req.cookies?.token;
    
    // Decode token to get user info if token exists
    let userId, userRole;
    if (token) {
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const { envConfig } = await import('../config/env.js');
        const decoded = jwt.verify(token, envConfig.JWT_SECRET);
        userId = decoded.userId;
        userRole = decoded.role;
      } catch (e) {
        // Token invalid, treat as not logged in
      }
    }
    
    const profile = await CreatorProfile.findOne({ pageUrl });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }
    
    const post = await Post.findOne({ 
      _id: postId, 
      creatorId: profile.creatorId,
      isPublished: true 
    }).populate("creatorId", "fullName").populate("tierId");
    
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    
    // Check subscription for paid posts
    if (post.isPaid) {
      if (!userId || userRole !== 'subscriber') {
        return res.status(403).json({ 
          success: false, 
          error: "Subscription required",
          requiresSubscription: true 
        });
      }
      
      const subscription = await Subscription.findOne({
        subscriberId: userId,
        creatorId: profile.creatorId
      });
      
      if (!subscription) {
        return res.status(403).json({ 
          success: false, 
          error: "Subscription required",
          requiresSubscription: true 
        });
      }
      
      if (subscription.status !== 'active') {
        return res.status(403).json({ 
          success: false, 
          error: "Subscription required",
          requiresSubscription: true 
        });
      }
      
      if (!post.tierId) {
        return res.status(200).json({
          success: true,
          data: post
        });
      }
      
      await subscription.populate('tierId');
      
      const userTierPrice = subscription.tierId?.price || 0;
      const postTierPrice = post.tierId?.price || 0;
      
      if (userTierPrice >= postTierPrice) {
        return res.status(200).json({
          success: true,
          data: post
        });
      }
      
      return res.status(403).json({ 
        success: false, 
        error: "Higher tier subscription required",
        requiresSubscription: true 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get creator's collections by pageUrl
export const getCreatorCollectionsByUrl = async (req, res) => {
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
};

// Get creator's memberships by pageUrl
export const getCreatorMembershipsByUrl = async (req, res) => {
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
};