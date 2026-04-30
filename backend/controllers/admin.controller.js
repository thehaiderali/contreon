import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import Payment from "../models/payment.model.js";
import Post from "../models/post.model.js";
import View from "../models/view.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCreators,
      onboardedCreators,
      totalSubscribers,
      activeSubscriptions,
      allTiers,
      recentPayments
    ] = await Promise.all([
      User.countDocuments({ role: "creator" }),
      User.countDocuments({ role: "creator", onBoarded: true }),
      User.countDocuments({ role: "subscriber" }),
      Subscription.countDocuments({ status: "active" }),
      SubscriptionTier.find({ isActive: true }).select("price creatorId"),
      Payment.find().sort({ createdAt: -1 }).limit(100)
    ]);

    const totalRevenue = allTiers.reduce((sum, tier) => sum + (tier.price || 0), 0);
    const averageRevenuePerCreator = totalCreators > 0 ? totalRevenue / totalCreators : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
      { $lookup: { from: "subscriptiontiers", localField: "tierId", foreignField: "_id", as: "tier" } },
      { $unwind: "$tier" },
      { $group: { _id: null, total: { $sum: "$tier.price" } } }
    ]);

    const creatorGrowth = await User.aggregate([
      { $match: { role: "creator", createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const subscriberGrowth = await User.aggregate([
      { $match: { role: "subscriber", createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalCreators,
      onboardedCreators,
      notOnboardedCreators: totalCreators - onboardedCreators,
      totalSubscribers,
      activeSubscriptions,
      totalRevenue: totalRevenue || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      averageRevenuePerCreator: Math.round(averageRevenuePerCreator * 100) / 100,
      newCreatorsThisMonth: creatorGrowth[0]?.count || 0,
      newSubscribersThisMonth: subscriberGrowth[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCreatorAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", onboarded } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: "creator" };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (onboarded !== undefined) {
      query.onBoarded = onboarded === "true";
    }

    const [creators, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    const creatorIds = creators.map(c => c._id);
    const [subscriptionCounts, tierData] = await Promise.all([
      Subscription.aggregate([
        { $match: { creatorId: { $in: creatorIds }, status: "active" } },
        { $group: { _id: "$creatorId", count: { $sum: 1 } } }
      ]),
      SubscriptionTier.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        { $group: { _id: "$creatorId", totalRevenue: { $sum: "$price" } } }
      ])
    ]);

    const subCountMap = Object.fromEntries(subscriptionCounts.map(s => [s._id.toString(), s.count]));
    const revenueMap = Object.fromEntries(tierData.map(t => [t._id.toString(), t.totalRevenue]));

    const creatorsWithStats = creators.map(creator => ({
      ...creator.toObject(),
      subscriberCount: subCountMap[creator._id.toString()] || 0,
      totalRevenue: revenueMap[creator._id.toString()] || 0
    }));

    res.status(200).json({
      creators: creatorsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriberAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20, creatorId } = req.query;
    const skip = (page - 1) * limit;

    const query = { role: "subscriber" };
    if (creatorId) {
      query._id = creatorId;
    }

    const [subscribers, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    const subscriberIds = subscribers.map(s => s._id);
    const subscriptions = await Subscription.aggregate([
      { $match: { subscriberId: { $in: subscriberIds } } },
      { $group: { _id: "$subscriberId", count: { $sum: 1 }, activeCount: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } } } }
    ]);

    const subMap = Object.fromEntries(subscriptions.map(s => [s._id.toString(), { count: s.count, active: s.activeCount }]));

    const subscribersWithSubs = subscribers.map(sub => ({
      ...sub.toObject(),
      subscriptionCount: subMap[sub._id.toString()]?.count || 0,
      activeSubscriptions: subMap[sub._id.toString()]?.active || 0
    }));

    res.status(200).json({
      subscribers: subscribersWithSubs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueByDay = await Payment.aggregate([
      { $match: { status: "success", createdAt: { $gte: startDate } } },
      { $lookup: { from: "subscriptiontiers", localField: "tierId", foreignField: "_id", as: "tier" } },
      { $unwind: "$tier" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$tier.price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueByCreator = await SubscriptionTier.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$creatorId", totalRevenue: { $sum: "$price" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "creator" } },
      { $unwind: "$creator" },
      { $project: { _id: 0, creatorName: "$creator.fullName", creatorEmail: "$creator.email", totalRevenue: 1 } }
    ]);

    const totalRevenue = revenueByDay.reduce((sum, day) => sum + day.revenue, 0);
    const averageDailyRevenue = days > 0 ? totalRevenue / days : 0;

    res.status(200).json({
      period: days,
      totalRevenue,
      averageDailyRevenue: Math.round(averageDailyRevenue * 100) / 100,
      dailyBreakdown: revenueByDay,
      topCreatorsByRevenue: revenueByCreator
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCreatorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const creator = await User.findById(id).select("-password");
    if (!creator || creator.role !== "creator") {
      return res.status(404).json({ message: "Creator not found" });
    }

    const [subscriptions, tiers, profile] = await Promise.all([
      Subscription.find({ creatorId: id }).populate("subscriberId", "fullName email").sort({ createdAt: -1 }),
      SubscriptionTier.find({ creatorId: id }),
      creator.profile ? User.findById(id).populate("profile") : null
    ]);

    const activeSubs = subscriptions.filter(s => s.status === "active").length;
    const totalRevenue = tiers.reduce((sum, tier) => sum + (tier.price || 0), 0);

    res.status(200).json({
      creator,
      profile,
      subscriptions: subscriptions.map(s => ({
        subscriber: s.subscriberId,
        tier: s.tierType,
        status: s.status,
        startDate: s.startDate,
        nextBillingDate: s.nextBillingDate
      })),
      tiers: tiers.map(t => ({
        name: t.tierName,
        price: t.price,
        subscribers: subscriptions.filter(s => s.tierId.toString() === t._id.toString() && s.status === "active").length
      })),
      stats: {
        totalSubscribers: subscriptions.length,
        activeSubscribers: activeSubs,
        totalRevenue,
        isOnboarded: creator.onBoarded,
        stripeConnected: creator.stripeAccountStatus?.chargesEnabled || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlatformOverview = async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalActive7Days,
      totalActive30Days,
      subscriptionStatusBreakdown,
      creatorOnboardingStatus
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: last7Days } }),
      User.countDocuments({ lastLogin: { $gte: last30Days } }),
      Subscription.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: "creator" } },
        { $group: { _id: "$onBoarded", count: { $sum: 1 } } }
      ])
    ]);

    const activeRate = totalUsers > 0 ? Math.round((totalActive30Days / totalUsers) * 100) : 0;

    res.status(200).json({
      totalUsers,
      activeUsersLast7Days: totalActive7Days,
      activeUsersLast30Days: totalActive30Days,
      engagementRate: activeRate,
      subscriptionStatus: Object.fromEntries(subscriptionStatusBreakdown.map(s => [s._id, s.count])),
      creatorOnboarding: {
        onboarded: creatorOnboardingStatus.find(c => c._id === true)?.count || 0,
        notOnboarded: creatorOnboardingStatus.find(c => c._id === false)?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalPosts, postsByCreator, topCreatorsByPosts, recentPosts] = await Promise.all([
      Post.countDocuments(),
      Post.aggregate([
        { $group: { _id: "$creatorId", postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "creator" } },
        { $unwind: "$creator" },
        { $project: { _id: 0, creatorName: "$creator.fullName", postCount: 1 } }
      ]),
      Post.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$creatorId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "creator" } },
        { $unwind: "$creator" },
        { $project: { _id: 0, creatorName: "$creator.fullName", posts: "$count" } }
      ]),
      Post.find().populate("creatorId", "fullName").sort({ createdAt: -1 }).limit(10)
    ]);

    const contentTypes = await Post.aggregate([
      { $group: { _id: "$contentType", count: { $sum: 1 } } }
    ]);

    const publishedVsDraft = await Post.aggregate([
      { $group: { _id: "$isPublished", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalPosts,
      postsByCreator,
      topCreatorsByPosts,
      recentPosts: recentPosts.map(p => ({
        id: p._id,
        title: p.title,
        creator: p.creatorId?.fullName,
        contentType: p.contentType,
        isPublished: p.isPublished,
        createdAt: p.createdAt
      })),
      contentTypeBreakdown: Object.fromEntries(contentTypes.map(c => [c._id || "unknown", c.count])),
      publishStatus: Object.fromEntries(publishedVsDraft.map(p => [p._id ? "published" : "draft", p.count]))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopCreators = async (req, res) => {
  try {
    const { metric = "revenue", limit = 10 } = req.query;

    let sortField = "totalRevenue";
    if (metric === "subscribers") sortField = "subscriberCount";
    if (metric === "posts") sortField = "postCount";

    const creators = await User.find({ role: "creator" }).select("-password");
    const creatorIds = creators.map(c => c._id);

    const [subCounts, revenues, postCounts, tierPrices] = await Promise.all([
      Subscription.aggregate([
        { $match: { creatorId: { $in: creatorIds }, status: "active" } },
        { $group: { _id: "$creatorId", count: { $sum: 1 } } }
      ]),
      SubscriptionTier.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        { $group: { _id: "$creatorId", total: { $sum: "$price" } } }
      ]),
      Post.aggregate([
        { $match: { creatorId: { $in: creatorIds } } },
        { $group: { _id: "$creatorId", count: { $sum: 1 } } }
      ]),
      SubscriptionTier.find({ creatorId: { $in: creatorIds } }).select("creatorId price")
    ]);

    const subMap = Object.fromEntries(subCounts.map(s => [s._id.toString(), s.count]));
    const revenueMap = Object.fromEntries(revenues.map(r => [r._id.toString(), r.total]));
    const postMap = Object.fromEntries(postCounts.map(p => [p._id.toString(), p.count]));

    const rankedCreators = creators.map(c => ({
      id: c._id,
      name: c.fullName,
      email: c.email,
      onBoarded: c.onBoarded,
      subscriberCount: subMap[c._id.toString()] || 0,
      totalRevenue: revenueMap[c._id.toString()] || 0,
      postCount: postMap[c._id.toString()] || 0
    }));

    rankedCreators.sort((a, b) => b[sortField] - a[sortField]);

    res.status(200).json({
      metric,
      topCreators: rankedCreators.slice(0, parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const { type = "all", limit = 20 } = req.query;
    const parsedLimit = parseInt(limit);

    const [recentUsers, recentSubscriptions, recentPayments] = await Promise.all([
      User.find().select("fullName email role createdAt").sort({ createdAt: -1 }).limit(parsedLimit),
      Subscription.find()
        .populate("subscriberId", "fullName email")
        .populate("creatorId", "fullName")
        .sort({ createdAt: -1 })
        .limit(parsedLimit),
      Payment.find()
        .populate({ path: "subscriptionId", populate: { path: "subscriberId", select: "fullName" } })
        .sort({ createdAt: -1 })
        .limit(parsedLimit)
    ]);

    const activities = [];

    if (type === "all" || type === "users") {
      recentUsers.forEach(u => {
        activities.push({
          type: "user_registered",
          user: u.fullName,
          email: u.email,
          role: u.role,
          timestamp: u.createdAt
        });
      });
    }

    if (type === "all" || type === "subscriptions") {
      recentSubscriptions.forEach(s => {
        activities.push({
          type: "subscription_created",
          subscriber: s.subscriberId?.fullName,
          creator: s.creatorId?.fullName,
          tier: s.tierType,
          status: s.status,
          timestamp: s.createdAt
        });
      });
    }

    if (type === "all" || type === "payments") {
      recentPayments.forEach(p => {
        activities.push({
          type: "payment",
          status: p.status,
          sessionId: p.sessionId,
          timestamp: p.createdAt
        });
      });
    }

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      activities: activities.slice(0, parsedLimit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [paymentStats, statusBreakdown, failedPayments] = await Promise.all([
      Payment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: 1 }, success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }, pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } } } }
      ]),
      Payment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Payment.find({ status: "failed" }).sort({ createdAt: -1 }).limit(10)
    ]);

    const dailyPayments = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = paymentStats[0] || { total: 0, success: 0, failed: 0, pending: 0 };
    const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

    res.status(200).json({
      period: days,
      totalTransactions: stats.total,
      successfulTransactions: stats.success,
      failedTransactions: stats.failed,
      pendingTransactions: stats.pending,
      successRate,
      dailyBreakdown: dailyPayments,
      recentFailures: failedPayments.map(p => ({
        sessionId: p.sessionId,
        status: p.status,
        createdAt: p.createdAt
      })),
      statusDistribution: Object.fromEntries(statusBreakdown.map(s => [s._id, s.count]))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTierAnalytics = async (req, res) => {
  try {
    const [tiers, priceDistribution, tierPopularity] = await Promise.all([
      SubscriptionTier.find({ isActive: true }).populate("creatorId", "fullName"),
      SubscriptionTier.aggregate([
        { $match: { isActive: true } },
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 5, 10, 20, 50, 100, Infinity],
            default: "Other",
            output: { count: { $sum: 1 } }
          }
        }
      ]),
      Subscription.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$tierId", subscriberCount: { $sum: 1 } } },
        { $sort: { subscriberCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: "subscriptiontiers", localField: "_id", foreignField: "_id", as: "tier" } },
        { $unwind: "$tier" },
        { $project: { _id: 0, tierName: "$tier.tierName", price: "$tier.price", subscriberCount: 1 } }
      ])
    ]);

    const avgPrice = tiers.length > 0 ? tiers.reduce((sum, t) => sum + t.price, 0) / tiers.length : 0;

    res.status(200).json({
      totalTiers: tiers.length,
      averagePrice: Math.round(avgPrice * 100) / 100,
      priceDistribution: Object.fromEntries(priceDistribution.map(p => [`${p._id}`, p.count])),
      tierPricing: tiers.map(t => ({
        id: t._id,
        tierName: t.tierName,
        price: t.price,
        creator: t.creatorId?.fullName
      })),
      topTiersBySubscribers: tierPopularity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChurnAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [cancelledSubscriptions, pastDueSubscriptions, churnByMonth] = await Promise.all([
      Subscription.countDocuments({ status: "cancelled", updatedAt: { $gte: startDate } }),
      Subscription.countDocuments({ status: "past_due" }),
      Subscription.aggregate([
        { $match: { status: "cancelled" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
      ])
    ]);

    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: "active" });
    const churnRate = totalSubscriptions > 0 ? Math.round((cancelledSubscriptions / totalSubscriptions) * 100) : 0;

    const cancelledList = await Subscription.find({ status: "cancelled" })
      .populate("subscriberId", "fullName email")
      .populate("creatorId", "fullName")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      period: days,
      cancelledCount: cancelledSubscriptions,
      pastDueCount: pastDueSubscriptions,
      activeSubscriptions,
      totalSubscriptions,
      churnRate,
      monthlyChurn: churnByMonth,
      recentCancellations: cancelledList.map(s => ({
        subscriber: s.subscriberId?.fullName,
        creator: s.creatorId?.fullName,
        cancelledAt: s.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEngagementAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [viewsByDay, topViewedPosts, engagementByCreator] = await Promise.all([
      View.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      View.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$postId", viewCount: { $sum: 1 } } },
        { $sort: { viewCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: "posts", localField: "_id", foreignField: "_id", as: "post" } },
        { $unwind: "$post" },
        { $project: { _id: 0, postTitle: "$post.title", viewCount: 1 } }
      ]),
      View.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$creatorId", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "creator" } },
        { $unwind: "$creator" },
        { $project: { _id: 0, creatorName: "$creator.fullName", views: 1 } }
      ])
    ]);

    const totalViews = viewsByDay.reduce((sum, d) => sum + d.views, 0);
    const avgDailyViews = days > 0 ? Math.round(totalViews / days) : 0;

    res.status(200).json({
      period: days,
      totalViews,
      averageDailyViews: avgDailyViews,
      dailyViews: viewsByDay,
      topViewedPosts,
      topCreatorsByViews: engagementByCreator
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGrowthTrends = async (req, res) => {
  try {
    const { metric = "all", period = "90" } = req.query;
    const days = parseInt(period);

    const getStartDate = (daysBack) => {
      const d = new Date();
      d.setDate(d.getDate() - daysBack);
      return d;
    };

    const [dailyCreators, dailySubscribers, dailyRevenue] = await Promise.all([
      User.aggregate([
        { $match: { role: "creator", createdAt: { $gte: getStartDate(days) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { role: "subscriber", createdAt: { $gte: getStartDate(days) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: getStartDate(days) } } },
        { $lookup: { from: "subscriptiontiers", localField: "tierId", foreignField: "_id", as: "tier" } },
        { $unwind: "$tier" },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$tier.price" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const cumulativeCreators = [];
    const cumulativeSubscribers = [];
    let cCreator = 0, cSubscriber = 0;

    const allDates = [...new Set([
      ...dailyCreators.map(d => d._id),
      ...dailySubscribers.map(d => d._id),
      ...dailyRevenue.map(d => d._id)
    ])].sort();

    const creatorMap = Object.fromEntries(dailyCreators.map(d => [d._id, d.count]));
    const subscriberMap = Object.fromEntries(dailySubscribers.map(d => [d._id, d.count]));
    const revenueMap = Object.fromEntries(dailyRevenue.map(d => [d._id, d.revenue]));

    allDates.forEach(date => {
      cCreator += creatorMap[date] || 0;
      cSubscriber += subscriberMap[date] || 0;
      cumulativeCreators.push({ date, count: cCreator });
      cumulativeSubscribers.push({ date, count: cSubscriber });
    });

    res.status(200).json({
      period: days,
      newCreatorsByDay: dailyCreators,
      newSubscribersByDay: dailySubscribers,
      dailyRevenue,
      cumulativeCreators,
      cumulativeSubscribers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};