import crypto from "crypto";
import mongoose from "mongoose";
import TrackingLink from "../models/trackingLink.model.js";
import CreatorProfile from "../models/profile.model.js";

function generateToken() {
  return crypto.randomBytes(4).toString("hex");
}

export async function createTrackingLink(req, res) {
  try {
    const creatorId = req.user.userId;
    const { source, name } = req.body;

    if (!source) {
      return res.status(400).json({ success: false, error: "Source is required" });
    }

    const validSources = ["youtube", "instagram", "facebook", "twitter", "custom"];
    if (!validSources.includes(source)) {
      return res.status(400).json({ success: false, error: "Invalid source" });
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ success: false, error: "Name must be a non-empty string" });
    }

    const profile = await CreatorProfile.findOne({ creatorId });
    if (!profile) {
      return res.status(400).json({ success: false, error: "Creator profile not found" });
    }

    if (!profile.pageUrl) {
      return res.status(400).json({ success: false, error: "Creator profile page URL not found" });
    }

    const baseUrl = process.env.FRONTEND_URL;
    if (!baseUrl) {
      return res.status(500).json({ success: false, error: "FRONTEND_URL not configured" });
    }
    const originalUrl = `${baseUrl}/c/${profile.pageUrl}`;

    const token = generateToken();

    const trackingLink = await TrackingLink.create({
      creatorId,
      source,
      token,
      originalUrl,
      name: name?.trim() || `${source} Link`
    });

    const fullTrackingUrl = `${baseUrl}/l/${token}`;

    res.json({ 
      success: true, 
      data: { 
        ...trackingLink.toObject(),
        trackingUrl: fullTrackingUrl
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: "Token collision, please try again" });
    }
    console.error("Error creating tracking link:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getTrackingLinks(req, res) {
  try {
    const creatorId = req.user.userId;
    const baseUrl = process.env.FRONTEND_URL;
    if (!baseUrl) {
      return res.status(500).json({ success: false, error: "FRONTEND_URL not configured" });
    }

    const links = await TrackingLink.find({ creatorId }).sort({ createdAt: -1 });

    const linksWithUrl = links.map(link => ({
      ...link.toObject(),
      trackingUrl: `${baseUrl}/l/${link.token}`
    }));

    res.json({ success: true, data: linksWithUrl });
  } catch (error) {
    console.error("Error fetching tracking links:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteTrackingLink(req, res) {
  try {
    const creatorId = req.user.userId;
    const { id } = req.params;

    const link = await TrackingLink.findOne({ _id: id, creatorId });
    if (!link) {
      return res.status(404).json({ success: false, error: "Link not found" });
    }

    await TrackingLink.deleteOne({ _id: id, creatorId });
    res.json({ success: true, message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting tracking link:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function redirectLink(req, res) {
  try {
    const { token } = req.params;
    const cookieName = `att_${token}`;
    const hasCookie = req.cookies[cookieName];

    const link = await TrackingLink.findOne({ token });
    if (!link) {
      return res.status(404).send('Link not found');
    }

    link.clicks += 1;
    
    if (!hasCookie) {
      link.uniqueClicks += 1;
      res.cookie(cookieName, '1', { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }

    await link.save();
    res.redirect(link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Error');
  }
}

export async function getOriginalUrl(req, res) {
  try {
    const creatorId = req.user?.userId;
    if (!creatorId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    const { token } = req.params;

    const link = await TrackingLink.findOne({ token, creatorId });
    if (!link) {
      return res.status(404).json({ success: false, error: "Link not found" });
    }

    // Increment total clicks
    link.clicks += 1;
    link.lastClickedAt = new Date();

    // For getOriginalUrl, we don't track unique clicks or IP history
    // This function is meant to retrieve the original URL for display purposes
    await link.save();

    res.json({ success: true, data: { originalUrl: link.originalUrl } });
  } catch (error) {
    console.error("Error getting original URL:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLinkStats(req, res) {
  try {
    const creatorId = req.user.userId;

    const stats = await TrackingLink.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
      {
        $group: {
          _id: "$source",
          totalClicks: { $sum: "$clicks" },
          uniqueClicks: { $sum: "$uniqueClicks" },
          linkCount: { $sum: 1 }
        }
      },
      { $sort: { totalClicks: -1 } }
    ]);

    const totalClicksResult = await TrackingLink.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(creatorId) } },
      { $group: { _id: null, totalClicks: { $sum: "$clicks" }, totalUnique: { $sum: "$uniqueClicks" } } }
    ]);

    res.json({
      success: true,
      data: {
        platformStats: stats,
        totalClicks: totalClicksResult[0]?.totalClicks || 0,
        totalUniqueClicks: totalClicksResult[0]?.totalUnique || 0
      }
    });
  } catch (error) {
    console.error("Error fetching link stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}