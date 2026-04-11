// routes/creatorRoutes.js
import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Recommendation from "../models/recommendation.model.js";

export const searchCreators = async (req, res) => {
  try {
    const { search } = req.query;
    const currentCreatorId = req.user.id;

    if (!search || search.trim() === '') {
      return res.json({ success: true, data: [] });
    }
    const creators = await User.find({
      _id: { $ne: currentCreatorId },
      role: "creator",
      fullName: { $regex: search, $options: 'i' }
    })
    .select("fullName email")
    .limit(10)
    .lean();

    // Get profiles for these creators
    const creatorIds = creators.map(c => c._id);
    const profiles = await CreatorProfile.find({
      creatorId: { $in: creatorIds }
    }).lean();

    // Get already recommended creators
    const recommendations = await Recommendation.find({
      creatorId: currentCreatorId,
      recommendedCreatorId: { $in: creatorIds }
    }).lean();

    const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));

    // Combine data
    const results = creators.map(creator => {
      const profile = profiles.find(p => p.creatorId.toString() === creator._id.toString());
      return {
        _id: creator._id,
        fullName: creator.fullName,
        email: creator.email,
        pageName: profile?.pageName,
        pageUrl: profile?.pageUrl,
        profileImageUrl: profile?.profileImageUrl,
        bio: profile?.bio,
        interests: profile?.interests || [],
        isAlreadyRecommended: recommendedIds.has(creator._id.toString())
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRandomCreatorsWithSameInterests = async (req, res) => {
  try {
    const currentCreatorId = req.user.id;

    // Get current creator's profile
    const currentProfile = await CreatorProfile.findOne({ creatorId: currentCreatorId });
    
    if (!currentProfile || !currentProfile.interests.length) {
      // If no interests, return random creators
      const randomCreators = await User.aggregate([
        { $match: { _id: { $ne: currentCreatorId }, role: "creator" } },
        { $sample: { size: 6 } }
      ]);
      
      const creatorIds = randomCreators.map(c => c._id);
      const profiles = await CreatorProfile.find({ creatorId: { $in: creatorIds } });
      const recommendations = await Recommendation.find({ creatorId: currentCreatorId });
      const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));
      
      const results = randomCreators.map(creator => {
        const profile = profiles.find(p => p.creatorId.toString() === creator._id.toString());
        return {
          _id: creator._id,
          fullName: creator.fullName,
          pageName: profile?.pageName,
          profileImageUrl: profile?.profileImageUrl,
          bio: profile?.bio,
          interests: profile?.interests || [],
          isAlreadyRecommended: recommendedIds.has(creator._id.toString())
        };
      });
      
      return res.json({ success: true, data: results });
    }

    // Find creators with same interests
    const sameInterestCreators = await CreatorProfile.aggregate([
      {
        $match: {
          creatorId: { $ne: currentCreatorId },
          interests: { $in: currentProfile.interests }
        }
      },
      { $sample: { size: 6 } }
    ]);

    const creatorIds = sameInterestCreators.map(p => p.creatorId);
    const users = await User.find({ 
      _id: { $in: creatorIds },
      role: "creator"
    }).select("fullName email");

    const recommendations = await Recommendation.find({ creatorId: currentCreatorId });
    const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));

    const results = sameInterestCreators.map(profile => {
      const user = users.find(u => u._id.toString() === profile.creatorId.toString());
      return {
        _id: profile.creatorId,
        fullName: user?.fullName || "Unknown",
        pageName: profile.pageName,
        profileImageUrl: profile.profileImageUrl,
        bio: profile.bio,
        interests: profile.interests,
        isAlreadyRecommended: recommendedIds.has(profile.creatorId.toString())
      };
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addRecommendation = async (req, res) => {
  try {
    const { recommendedCreatorId } = req.body;
    const currentCreatorId = req.user.id;

    // Check if already recommended
    const existing = await Recommendation.findOne({
      creatorId: currentCreatorId,
      recommendedCreatorId
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Creator already recommended" 
      });
    }

    const recommendation = new Recommendation({
      creatorId: currentCreatorId,
      recommendedCreatorId
    });

    await recommendation.save();

    res.json({ 
      success: true, 
      message: "Creator recommended successfully",
      data: recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const currentCreatorId = req.user.id;

    const recommendations = await Recommendation.find({ 
      creatorId: currentCreatorId 
    }).populate("recommendedCreatorId", "fullName email");

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};