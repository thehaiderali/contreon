import CreatorProfile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Recommendation from "../models/recommendation.model.js";

export const searchCreators = async (req, res) => {
  try {
    const { search } = req.query;
    const currentCreatorId = req.user.userId;

    if (!search || search.trim() === '') {
      return res.json({ success: true, data: [] });
    }

    // Search users first
    const users = await User.find({
      _id: { $ne: currentCreatorId },
      role: "creator",
      fullName: { $regex: search, $options: 'i' }
    })
    .select("fullName email interests")
    .limit(10)
    .lean();

    // Get profiles for these users
    const userIds = users.map(u => u._id);
    const profiles = await CreatorProfile.find({
      creatorId: { $in: userIds }
    }).lean();

    // Get already recommended creators
    const recommendations = await Recommendation.find({
      creatorId: currentCreatorId,
      recommendedCreatorId: { $in: userIds }
    }).lean();

    const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));

    // Combine data
    const results = users.map(user => {
      const profile = profiles.find(p => p.creatorId.toString() === user._id.toString());
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        interests: user.interests || [], // interests from User model
        pageName: profile?.pageName,
        pageUrl: profile?.pageUrl,
        profileImageUrl: profile?.profileImageUrl,
        bio: profile?.bio,
        category: profile?.category,
        isAlreadyRecommended: recommendedIds.has(user._id.toString())
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
    const currentCreatorId = req.user.userId;

    // Get current user's interests (from User model, not CreatorProfile)
    const currentUser = await User.findById(currentCreatorId).select("interests");
    
    if (!currentUser || !currentUser.interests || currentUser.interests.length === 0) {
      // If no interests, return random creators (excluding self)
      const randomUsers = await User.aggregate([
        { 
          $match: { 
            _id: { $ne: currentCreatorId }, 
            role: "creator" 
          } 
        },
        { $sample: { size: 6 } }
      ]);
      
      const userIds = randomUsers.map(u => u._id);
      const profiles = await CreatorProfile.find({ 
        creatorId: { $in: userIds } 
      }).lean();
      
      const recommendations = await Recommendation.find({ 
        creatorId: currentCreatorId 
      }).lean();
      
      const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));
      
      const results = randomUsers.map(user => {
        const profile = profiles.find(p => p.creatorId.toString() === user._id.toString());
        return {
          _id: user._id,
          fullName: user.fullName,
          profileImageUrl: profile?.profileImageUrl,
          bio: profile?.bio,
          pageName: profile?.pageName,
          category: profile?.category,
          interests: user.interests || [],
          isAlreadyRecommended: recommendedIds.has(user._id.toString())
        };
      });
      
      return res.json({ success: true, data: results });
    }

    // Find users with same interests (query User model, not CreatorProfile)
    const sameInterestUsers = await User.find({
      _id: { $ne: currentCreatorId },
      role: "creator",
      interests: { $in: currentUser.interests }
    })
    .select("fullName email interests")
    .limit(20)
    .lean();

    // Get random 6 from the results
    const shuffled = sameInterestUsers.sort(() => 0.5 - Math.random());
    const selectedUsers = shuffled.slice(0, 6);

    // Get profiles for these users
    const userIds = selectedUsers.map(u => u._id);
    const profiles = await CreatorProfile.find({ 
      creatorId: { $in: userIds } 
    }).lean();

    // Get recommendations
    const recommendations = await Recommendation.find({ 
      creatorId: currentCreatorId 
    }).lean();
    
    const recommendedIds = new Set(recommendations.map(r => r.recommendedCreatorId.toString()));

    const results = selectedUsers.map(user => {
      const profile = profiles.find(p => p.creatorId.toString() === user._id.toString());
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        interests: user.interests,
        pageName: profile?.pageName,
        profileImageUrl: profile?.profileImageUrl,
        bio: profile?.bio,
        category: profile?.category,
        isAlreadyRecommended: recommendedIds.has(user._id.toString())
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
    const currentCreatorId = req.user.userId;

    // Validate that both users are creators
    const [currentUser, recommendedUser] = await Promise.all([
      User.findById(currentCreatorId),
      User.findById(recommendedCreatorId)
    ]);

    if (!currentUser || currentUser.role !== "creator") {
      return res.status(403).json({ 
        success: false, 
        message: "Only creators can make recommendations" 
      });
    }

    if (!recommendedUser || recommendedUser.role !== "creator") {
      return res.status(400).json({ 
        success: false, 
        message: "Can only recommend other creators" 
      });
    }

    if (currentCreatorId === recommendedCreatorId) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot recommend yourself" 
      });
    }

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
    const currentCreatorId = req.user.userId;

    const recommendations = await Recommendation.find({ 
      creatorId: currentCreatorId 
    })
    .populate("recommendedCreatorId", "fullName email interests")
    .lean();

    // Get profiles for recommended creators
    const recommendedIds = recommendations.map(r => r.recommendedCreatorId._id);
    const profiles = await CreatorProfile.find({
      creatorId: { $in: recommendedIds }
    }).lean();

    // Enrich recommendation data with profile info
    const enrichedRecommendations = recommendations.map(rec => {
      const profile = profiles.find(p => 
        p.creatorId.toString() === rec.recommendedCreatorId._id.toString()
      );
      
      return {
        ...rec,
        recommendedCreator: {
          ...rec.recommendedCreatorId,
          pageName: profile?.pageName,
          pageUrl: profile?.pageUrl,
          profileImageUrl: profile?.profileImageUrl,
          bio: profile?.bio,
          category: profile?.category
        }
      };
    });

    res.json({ success: true, data: enrichedRecommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const currentCreatorId = req.user.userId;

    // Find and verify ownership
    const recommendation = await Recommendation.findOne({
      _id: recommendationId,
      creatorId: currentCreatorId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found or you don't have permission to delete it"
      });
    }

    await recommendation.deleteOne();

    res.json({
      success: true,
      message: "Recommendation removed successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};