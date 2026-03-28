import mongoose from "mongoose";
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { creatorProfileSchema, errorParser } from "../validation/zod.js";

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

    // ✅ Fixed: define creator before checking it
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