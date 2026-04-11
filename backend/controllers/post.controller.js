// post.controller.js (Modified version)

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// @desc    Create a new post
// @route   POST /api/creators/posts
// @access  Private (Creator only)
export const createPost = async (req, res) => {
  try {
    const { 
      title, 
      type, 
      content, 
      isPaid, 
      tierId,
      commentsAllowed, 
      isPublished,
      thumbnailUrl,
      description 
    } = req.body;
    
    const creatorId = req.user.userId;

    // checkCreatorExists middleware already verified user exists and is creator
    // but we'll add an extra check for safety
    const user = await User.findById(creatorId);
    if (!user || user.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Only creators can create posts"
      });
    }

    // Validate title
    if (!title || title.length < 3 || title.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 30 characters"
      });
    }

    // Validate type
    if (!type || !["text", "audio", "video"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be text, audio, or video"
      });
    }

    // Validate description for audio/video
    if ((type === "audio" || type === "video") && (!description || description.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Description is required for audio and video posts"
      });
    }

    // Validate tier for paid content
    if (isPaid && !tierId) {
      return res.status(400).json({
        success: false,
        message: "Tier selection is required for paid content"
      });
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists for this creator
    let existingPost = await Post.findOne({ slug, creatorId });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create post
    const post = new Post({
      title: title.trim(),
      type,
      slug,
      content: content || "",
      creatorId,
      isPaid: isPaid || false,
      tierId: isPaid ? tierId : undefined,
      isPublished: isPublished || false,
      thumbnailUrl: thumbnailUrl || "",
      commentsAllowed: commentsAllowed !== undefined ? commentsAllowed : true,
      description: description || ""
    });
    console.log("Post : ",post)

    await post.save();

    // Populate creator info and tier info for response
    const populatedPost = await Post.findById(post._id)
      .populate("creatorId", "fullName email")
      .populate("tierId", "name price benefits");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populatedPost
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message
    });
  }
};

// @desc    Get all posts of logged-in creator
// @route   GET /api/creators/posts/my-posts
// @access  Private

export const getMyPosts = async (req, res) => {
  try {
    const creatorId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { creatorId };
    
    // Filter by published status if provided
    if (status === "published") {
      query.isPublished = true;
    } else if (status === "draft") {
      query.isPublished = false;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("creatorId", "fullName email");

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/creators/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await Post.findOne({ _id: id, creatorId })
      .populate("creatorId", "fullName email");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message
    });
  }
};

// @desc    Update a post
// @route   PUT /api/creators/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.userId;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    // Find post and verify ownership
    const post = await Post.findOne({ _id: id, creatorId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to update it"
      });
    }

    // Validate updates
    if (updates.title) {
      if (updates.title.length < 3 || updates.title.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 3 and 30 characters"
        });
      }
      
      // Update slug if title changes
      updates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check for duplicate slug
      const existingPost = await Post.findOne({ 
        slug: updates.slug, 
        creatorId, 
        _id: { $ne: id } 
      });
      if (existingPost) {
        updates.slug = `${updates.slug}-${Date.now()}`;
      }
    }

    // Validate price for paid content
    if (updates.isPaid !== undefined && updates.isPaid === true) {
      if (!updates.price || updates.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid price is required for paid content"
        });
      }
    }

    // Validate description for audio/video
    if ((post.type === "audio" || post.type === "video") && 
        updates.description !== undefined && 
        (!updates.description || updates.description.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Description is required for audio and video posts"
      });
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    ).populate("creatorId", "fullName email");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost
    });

  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/creators/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await Post.findOneAndDelete({ _id: id, creatorId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message
    });
  }
};

// @desc    Publish/unpublish a post
// @route   PATCH /api/creators/posts/:id/publish
// @access  Private
export const togglePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user.userId;
    const { isPublished } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await Post.findOne({ _id: id, creatorId });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Validate that audio/video posts have description before publishing
    if (isPublished && (post.type === "audio" || post.type === "video")) {
      if (!post.description || post.description.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Cannot publish audio/video post without a description"
        });
      }
    }

    post.isPublished = isPublished;
    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${isPublished ? "published" : "unpublished"} successfully`,
      data: post
    });

  } catch (error) {
    console.error("Error toggling publish status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post status",
      error: error.message
    });
  }
};

// @desc    Get post statistics for creator
// @route   GET /api/creators/posts/stats
// @access  Private
export const getPostStats = async (req, res) => {
  try {
    const creatorId = req.user.userId;

    const stats = await Post.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: { 
            $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] }
          },
          draftPosts: { 
            $sum: { $cond: [{ $eq: ["$isPublished", false] }, 1, 0] }
          },
          paidPosts: { 
            $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] }
          },
          freePosts: { 
            $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] }
          },
          textPosts: { 
            $sum: { $cond: [{ $eq: ["$type", "text"] }, 1, 0] }
          },
          audioPosts: { 
            $sum: { $cond: [{ $eq: ["$type", "audio"] }, 1, 0] }
          },
          videoPosts: { 
            $sum: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        paidPosts: 0,
        freePosts: 0,
        textPosts: 0,
        audioPosts: 0,
        videoPosts: 0
      }
    });

  } catch (error) {
    console.error("Error fetching post stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
};