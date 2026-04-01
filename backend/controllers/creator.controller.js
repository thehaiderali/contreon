import mongoose from "mongoose";
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { creatorProfileSchema, errorParser, updateCreatorProfileSchema } from "../validation/zod.js";

export async function getCreatorProfileById(req, res) {
  try {
    const creatorId = req.params.creatorId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator Not Found" });
    }

    const profile = await CreatorProfile.findOne({ creatorId: creator._id });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator Profile not Found" });
    }

    return res.status(200).json({ success: true, data: { profile } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function getMyCreatorProfile(req, res) {
  try {
    const creatorId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const profile = await CreatorProfile.findOne({ creatorId });
    if (!profile) {
      return res.status(404).json({ success: false, error: "Creator Profile not Found" });
    }

    return res.status(200).json({ success: true, data: { profile } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function getCreatorById(req, res) {
  try {
    const creatorId = req.params.creatorId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator Not Found" });
    }

    return res.status(200).json({ success: true, data: { creator } });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}


export async function makeCreatorProfile(req, res) {
  try {
    const creatorId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ success: false, error: "Invalid Creator Id" });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator not Found" });
    }

    const validationResult = creatorProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: errorParser(validationResult.error)
      });
    }

    const validatedData = validationResult.data;

    const existingProfile = await CreatorProfile.findOne({ creatorId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: "Creator profile already exists for this user"
      });
    }

    const existingPageUrl = await CreatorProfile.findOne({ pageUrl: validatedData.pageUrl });
    if (existingPageUrl) {
      return res.status(400).json({
        success: false,
        error: "Page URL already taken. Please choose a different URL"
      });
    }

    const creatorProfile = await CreatorProfile.create({
      creatorId,
      bio: validatedData.bio,
      pageName: validatedData.pageName,
      pageUrl: validatedData.pageUrl,
      profileImageUrl: validatedData.profileImageUrl || '',
      bannerUrl: validatedData.bannerUrl || '',
      socialLinks: validatedData.socialLinks || [],
      aboutPage: validatedData.aboutPage || ''
    });

    await User.findByIdAndUpdate(creatorId, { onBoarded: true }, { new: true });

    return res.status(201).json({
      success: true,
      message: "Creator profile created successfully",
      data: {
        profile: creatorProfile,
        onBoarded: true
      }
    });

  } catch (error) {
    console.error("Error in makeCreatorProfile:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}`
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export async function updateCreatorProfile(req, res) {
    try {
        const creatorId = req.user?.userId;

        // Validate creator ID
        if (!mongoose.Types.ObjectId.isValid(creatorId)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid Creator Id" 
            });
        }

        // Check if user exists
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ 
                success: false, 
                error: "Creator not Found" 
            });
        }

        // Check if profile exists
        const existingProfile = await CreatorProfile.findOne({ creatorId });
        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                error: "Creator profile not found. Please create a profile first"
            });
        }

        // Validate request body
        const validationResult = updateCreatorProfileSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: errorParser(validationResult.error)
            });
        }

        const validatedData = validationResult.data;

        // Check if pageUrl is being updated and if it's already taken
        if (validatedData.pageUrl && validatedData.pageUrl !== existingProfile.pageUrl) {
            const existingPageUrl = await CreatorProfile.findOne({ 
                pageUrl: validatedData.pageUrl,
                creatorId: { $ne: creatorId } // Exclude current profile
            });
            
            if (existingPageUrl) {
                return res.status(400).json({
                    success: false,
                    error: "Page URL already taken. Please choose a different URL"
                });
            }
        }

        // Prepare update data
        const updateData = {};
        
        // Only include fields that are provided in the request
        if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
        if (validatedData.pageName !== undefined) updateData.pageName = validatedData.pageName;
        if (validatedData.pageUrl !== undefined) updateData.pageUrl = validatedData.pageUrl;
        if (validatedData.profileImageUrl !== undefined) updateData.profileImageUrl = validatedData.profileImageUrl;
        if (validatedData.bannerUrl !== undefined) updateData.bannerUrl = validatedData.bannerUrl;
        if (validatedData.socialLinks !== undefined) updateData.socialLinks = validatedData.socialLinks;
        if (validatedData.aboutPage !== undefined) updateData.aboutPage = validatedData.aboutPage;

        // Add updatedAt timestamp
        updateData.updatedAt = new Date();

        // Update the profile
        const updatedProfile = await CreatorProfile.findOneAndUpdate(
            { creatorId },
            { $set: updateData },
            { new: true, runValidators: true } // Return updated document and run validators
        );

        return res.status(200).json({
            success: true,
            message: "Creator profile updated successfully",
            data: {
                profile: updatedProfile,
                updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
            }
        });

    } catch (error) {
        console.error("Error in updateCreatorProfile:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists. Please use a different ${field}`
            });
        }

        // Handle validation errors from MongoDB
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Database validation failed",
                error: Object.values(error.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}