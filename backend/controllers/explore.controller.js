import mongoose from 'mongoose';
import CreatorProfile from '../models/profile.model.js';
import RecentlyVisited from '../models/recent.model.js';
import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';
import PostView from '../models/view.model.js';
import Post from '../models/post.model.js';

// Helper: aggregate creator profile data with user info
const enrichCreator = async (creatorDoc) => {
  const user = await User.findById(creatorDoc.creatorId).select('fullName');
  if (!user) return null;
  return {
    id: creatorDoc._id,
    creatorId: creatorDoc.creatorId,
    name: user.fullName,
    tagline: creatorDoc.bio?.substring(0, 60) || '',
    avatar: creatorDoc.profileImageUrl || 'https://via.placeholder.com/40',
    cover: creatorDoc.bannerUrl || 'https://picsum.photos/300/200',
    pageUrl: creatorDoc.pageUrl,
    category: creatorDoc.category
  };
};

// ─────────────────────────────────────────────
// 1. Categories (from CreatorProfile)
// ─────────────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const distinctCategories = await CreatorProfile.distinct('category');
    const categories = [
      { id: 'all', label: 'All' },
      ...distinctCategories.map(cat => ({
        id: cat.toLowerCase(),
        label: cat
      }))
    ];
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 2. Recently visited (logged‑in user)
// ─────────────────────────────────────────────
export const getRecentlyVisited = async (req, res) => {
  try {
    const userId = req.user.userId
    const recent = await RecentlyVisited.find({ subscriberId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('creatorId', 'fullName profileImageUrl');

    const creators = await Promise.all(
      recent.map(async (item) => {
        const profile = await CreatorProfile.findOne({ creatorId: item.creatorId._id });
        return {
          id: item.creatorId._id,
          name: item.creatorId.fullName,
          avatar: profile?.profileImageUrl || 'https://i.pravatar.cc/40',
          pageUrl: profile?.pageUrl || '',
          slug: profile?.pageUrl || ''
        };
      })
    );
    res.json({ recentlyVisited: creators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 3. Creators for you (based on subscriptions)
// ─────────────────────────────────────────────
export const getCreatorsForYou = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all creators the user subscribes to
    const subscriptions = await Subscription.find({ subscriberId: userId })
      .populate('creatorId', 'fullName');

    const subscribedCreatorIds = subscriptions.map(sub => sub.creatorId._id);

    // Get similar creators: other creators that those subscribed creators also follow?
    // Simpler: recommend creators from same categories as your subscriptions
    const profilesOfSubscribed = await CreatorProfile.find({
      creatorId: { $in: subscribedCreatorIds }
    });
    const categories = [...new Set(profilesOfSubscribed.map(p => p.category))];

    let recommendedCreators = [];
    if (categories.length) {
      recommendedCreators = await CreatorProfile.aggregate([
        { $match: { category: { $in: categories }, creatorId: { $nin: subscribedCreatorIds } } },
        { $sample: { size: 10 } },
        { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' }
      ]);
    }

    // Fallback: newest creators
    if (recommendedCreators.length === 0) {
      recommendedCreators = await CreatorProfile.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: 'creatorId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' }
      ]);
    }

    const creatorsForYou = recommendedCreators.map(doc => ({
      id: doc._id,
      name: doc.user.fullName,
      tagline: doc.bio?.substring(0, 40) || '',
      cover: doc.bannerUrl || 'https://picsum.photos/300/200',
      pageUrl: doc.pageUrl || ''
    }));

    res.json({ creatorsForYou });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 4. Popular this week (by post views or subscriptions)
// ─────────────────────────────────────────────
export const getPopularThisWeek = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Aggregate views per creator (via posts)
    const popular = await PostView.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: 'postId',
          foreignField: '_id',
          as: 'post'
        }
      },
      { $unwind: '$post' },
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: '$post.creatorId',
          viewCount: { $sum: 1 }
        }
      },
      { $sort: { viewCount: -1 } },
      { $limit: 9 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'creatorprofiles',
          localField: '_id',
          foreignField: 'creatorId',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
    ]);

    const creators = popular.map(item => ({
      id: item._id,
      name: item.user.fullName,
      tagline: item.profile?.bio?.substring(0, 50) || 'Creator',
      avatar: item.profile?.profileImageUrl || 'https://i.pravatar.cc/48',
      pageUrl: item.profile?.pageUrl || ''
    }));

    res.json({ popularThisWeek: creators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 5. Topics (dynamic from categories + icons)
// ─────────────────────────────────────────────
const topicIcons = {
  'Tech': '💻',
  'Sports': '⚽',
  'Music': '🎵',
  'Art': '🎨',
  'Other': '📌',
  'Business': '📊'
};

export const getTopics = async (req, res) => {
  try {
    const categories = await CreatorProfile.distinct('category');
    const topics = categories.map(cat => ({
      id: cat.toLowerCase(),
      label: cat,
      icon: topicIcons[cat] || '🔍'
    }));
    res.json({ topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 6. Top creators by category (support ?category=xxx)
// ─────────────────────────────────────────────
export const getTopCreatorsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    let matchStage = {};
    if (category && category !== 'all') {
      // Convert from 'crypto' to proper category case (e.g., 'Crypto')
      const formattedCat = category.charAt(0).toUpperCase() + category.slice(1);
      matchStage = { category: formattedCat };
    }

    // Get top creators by number of subscribers
    const topCreators = await Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$creatorId',
          subscriberCount: { $sum: 1 }
        }
      },
      { $sort: { subscriberCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'creatorprofiles',
          localField: '_id',
          foreignField: 'creatorId',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    const creatorsPerCategory = {};
    for (const item of topCreators) {
      const cat = item.profile.category;
      if (!creatorsPerCategory[cat]) creatorsPerCategory[cat] = [];
      creatorsPerCategory[cat].push({
        id: item._id,
        name: item.user.fullName,
        tagline: item.profile.bio?.substring(0, 50) || '',
        cover: item.profile.bannerUrl || 'https://picsum.photos/300/200',
        pageUrl: item.profile.pageUrl || ''
      });
      if (creatorsPerCategory[cat].length >= 6) continue; // limit 6 per category
    }

    const result = Object.entries(creatorsPerCategory).map(([cat, creators]) => ({
      category: cat,
      creators
    }));

    res.json({ topCreatorsByCategory: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 7. New creators on platform
// ─────────────────────────────────────────────
export const getNewCreators = async (req, res) => {
  try {
    const newProfiles = await CreatorProfile.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('creatorId', 'fullName');

    const newCreators = newProfiles.map(profile => ({
      id: profile._id,
      name: profile.creatorId.fullName,
      tagline: profile.bio?.substring(0, 40) || '',
      cover: profile.bannerUrl || 'https://picsum.photos/300/200',
      pageUrl: profile.pageUrl || ''
    }));

    res.json({ newCreators });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// 8. Search (creators or topics)
// ─────────────────────────────────────────────
export const searchCreatorOrTopic = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ results: [] });

    // Search creators by name or pageUrl or bio
    const users = await User.find({
      fullName: { $regex: q, $options: 'i' },
      role: 'creator'
    }).limit(20);

    const profiles = await CreatorProfile.find({
      $or: [
        { pageUrl: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }).populate('creatorId', 'fullName');

    const combined = new Map();

    for (const user of users) {
      const profile = await CreatorProfile.findOne({ creatorId: user._id });
      combined.set(user._id.toString(), {
        id: user._id,
        name: user.fullName,
        tagline: profile?.bio || '',
        avatar: profile?.profileImageUrl || 'https://i.pravatar.cc/40',
        pageUrl: profile?.pageUrl || '',
        type: 'creator'
      });
    }

    for (const profile of profiles) {
      if (!combined.has(profile.creatorId._id.toString())) {
        combined.set(profile.creatorId._id.toString(), {
          id: profile.creatorId._id,
          name: profile.creatorId.fullName,
          tagline: profile.bio,
          avatar: profile.profileImageUrl || 'https://i.pravatar.cc/40',
          pageUrl: profile.pageUrl || '',
          type: 'creator'
        });
      }
    }

    // Also match categories as topics
    const categories = await CreatorProfile.distinct('category');
    const topicMatches = categories
      .filter(cat => cat.toLowerCase().includes(q.toLowerCase()))
      .map(cat => ({
        id: cat,
        label: cat,
        type: 'topic',
        icon: topicIcons[cat] || '#'
      }));

    const results = [...combined.values(), ...topicMatches].slice(0, 20);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// Feed: Get posts from subscribed creators
// ─────────────────────────────────────────────
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all active subscriptions for this user
    const subscriptions = await Subscription.find({
      subscriberId: userId,
      status: 'active'
    }).select('creatorId');

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          posts: [],
          hasMore: false,
          page: parseInt(page)
        }
      });
    }

    const creatorIds = subscriptions.map(sub => sub.creatorId);

    // Get posts from these creators
    const posts = await Post.find({
      creatorId: { $in: creatorIds },
      isPublished: true
    })
    .populate('creatorId', 'fullName profileImageUrl pageUrl')
    .populate('tierId', 'tierName price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments({
      creatorId: { $in: creatorIds },
      isPublished: true
    });

    // Transform posts to include creator info
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      type: post.type,
      content: post.content,
      thumbnailUrl: post.thumbnailUrl,
      videoUrl: post.videoUrl,
      audioUrl: post.audioUrl,
      videoDuration: post.videoDuration,
      description: post.description,
      isPaid: post.isPaid,
      isPublished: post.isPublished,
      commentsAllowed: post.commentsAllowed,
      createdAt: post.createdAt,
      likes: post.likes || 0,
      views: post.views || 0,
      comments: post.commentsCount || 0,
      creatorId: post.creatorId ? {
        _id: post.creatorId._id,
        fullName: post.creatorId.fullName,
        profileImageUrl: post.creatorId.profileImageUrl,
        pageUrl: post.creatorId.pageUrl
      } : null,
      tierId: post.tierId ? {
        _id: post.tierId._id,
        tierName: post.tierId.tierName,
        price: post.tierId.price
      } : null
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: transformedPosts,
        hasMore: skip + posts.length < total,
        page: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};