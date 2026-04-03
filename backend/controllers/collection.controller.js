import mongoose from "mongoose";
import Collection from "../models/collection.model.js";
import Post from "../models/post.model.js";
import { collectionSchema, collectionUpdateSchema } from "../validation/zod.js";
import { errorParser } from "../validation/zod.js";

// Create a new collection
export async function createCollection(req, res) {
  try {
    const { success, data, error: ZodError } = collectionSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(ZodError)
      });
    }

    // Check if collection with same title exists for this creator
    const existingCollection = await Collection.findOne({ 
      title: data.title, 
      creatorId: req.user.userId 
    });
    
    if (existingCollection) {
      return res.status(400).json({
        success: false,
        error: "A collection with this title already exists"
      });
    }

    const newCollection = new Collection({
      title: data.title,
      creatorId: req.user.userId,
      description: data.description || "",
      posts: []
    });

    await newCollection.save();

    return res.status(201).json({
      success: true,
      data: {
        collection: newCollection
      },
      message: "Collection created successfully"
    });

  } catch (error) {
    console.log("Error in createCollection: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get all collections for a creator
export async function getCreatorCollections(req, res) {
  try {
    const creatorId = req.user.userId;

    const collections = await Collection.find({ creatorId })
      .populate({
        path: 'posts',
        select: 'title type isPaid isPublished createdAt thumbnailUrl',
        match: { isPublished: true }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        collections
      }
    });

  } catch (error) {
    console.log("Error in getCreatorCollections: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get a single collection by ID
export async function getCollectionById(req, res) {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid collection ID"
      });
    }

    const collection = await Collection.findById(collectionId)
      .populate({
        path: 'posts',
        select: 'title type content isPaid isPublished createdAt thumbnailUrl slug'
      });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Check if user has access (creator only or public)
    if (collection.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view this collection"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        collection
      }
    });

  } catch (error) {
    console.log("Error in getCollectionById: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get public collection by ID (for subscribers)
export async function getPublicCollectionById(req, res) {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid collection ID"
      });
    }

    const collection = await Collection.findById(collectionId)
      .populate({
        path: 'posts',
        select: 'title type isPaid isPublished createdAt thumbnailUrl slug',
        match: { isPublished: true }
      });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Return limited info for public access
    const publicCollection = {
      _id: collection._id,
      title: collection.title,
      description: collection.description,
      posts: collection.posts,
      createdAt: collection.createdAt
    };

    return res.status(200).json({
      success: true,
      data: {
        collection: publicCollection
      }
    });

  } catch (error) {
    console.log("Error in getPublicCollectionById: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Update collection
export async function updateCollection(req, res) {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid collection ID"
      });
    }

    const existingCollection = await Collection.findById(collectionId);
    if (!existingCollection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Check ownership
    if (existingCollection.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this collection"
      });
    }

    const { success, data, error: ZodError } = collectionUpdateSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(ZodError)
      });
    }

    // Check if updating title and if it's unique for this creator
    if (data.title && data.title !== existingCollection.title) {
      const duplicateTitle = await Collection.findOne({
        title: data.title,
        creatorId: req.user.userId,
        _id: { $ne: collectionId }
      });

      if (duplicateTitle) {
        return res.status(400).json({
          success: false,
          error: "A collection with this title already exists"
        });
      }
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        collection: updatedCollection
      },
      message: "Collection updated successfully"
    });

  } catch (error) {
    console.log("Error in updateCollection: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Delete collection
export async function deleteCollection(req, res) {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid collection ID"
      });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Check ownership
    if (collection.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this collection"
      });
    }

    await Collection.findByIdAndDelete(collectionId);

    return res.status(200).json({
      success: true,
      message: "Collection deleted successfully"
    });

  } catch (error) {
    console.log("Error in deleteCollection: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Add post to collection
export async function addPostToCollection(req, res) {
  try {
    const { collectionId, postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Check ownership
    if (collection.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to modify this collection"
      });
    }

    // Check if post exists and belongs to creator
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found"
      });
    }

    if (post.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You can only add your own posts to collections"
      });
    }

    // Check if post already in collection
    if (collection.posts.includes(postId)) {
      return res.status(400).json({
        success: false,
        error: "Post already in this collection"
      });
    }

    collection.posts.push(postId);
    await collection.save();

    return res.status(200).json({
      success: true,
      data: {
        collection
      },
      message: "Post added to collection successfully"
    });

  } catch (error) {
    console.log("Error in addPostToCollection: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Remove post from collection
export async function removePostFromCollection(req, res) {
  try {
    const { collectionId, postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: "Collection not found"
      });
    }

    // Check ownership
    if (collection.creatorId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to modify this collection"
      });
    }

    collection.posts = collection.posts.filter(
      (post) => post.toString() !== postId
    );
    await collection.save();

    return res.status(200).json({
      success: true,
      data: {
        collection
      },
      message: "Post removed from collection successfully"
    });

  } catch (error) {
    console.log("Error in removePostFromCollection: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Get all collections with post count (for dashboard)
export async function getCollectionsWithStats(req, res) {
  try {
    const collections = await Collection.aggregate([
      {
        $match: { creatorId: new mongoose.Types.ObjectId(req.user.userId) }
      },
      {
        $lookup: {
          from: "posts",
          localField: "posts",
          foreignField: "_id",
          as: "postDetails"
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          postCount: { $size: "$posts" },
          publishedPostCount: {
            $size: {
              $filter: {
                input: "$postDetails",
                as: "post",
                cond: { $eq: ["$$post.isPublished", true] }
              }
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        collections
      }
    });

  } catch (error) {
    console.log("Error in getCollectionsWithStats: ", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}