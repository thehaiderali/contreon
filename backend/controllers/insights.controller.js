import Post from "../models/post.model.js";
import PostView from "../models/view.model.js";
import Comment from "../models/comment.model.js";
import Subscription from "../models/subscription.model.js";

export async function getCreatorInsights(req, res) {
  try {
    const creatorId = req.user.userId;

    // Get all posts by this creator
    const posts = await Post.find({ creatorId, isPublished: true }).select('_id title type createdAt');
    const postIds = posts.map(p => p._id);

    // Total views
    const totalViews = await PostView.countDocuments({ postId: { $in: postIds } });

    // Total comments
    const totalComments = await Comment.countDocuments({ postId: { $in: postIds } });

    // Total likes/dislikes on comments
    const comments = await Comment.find({ postId: { $in: postIds } });
    const totalLikes = comments.reduce((sum, c) => sum + (c.likes?.length || 0), 0);
    const totalDislikes = comments.reduce((sum, c) => sum + (c.dislikes?.length || 0), 0);

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ 
      creatorId, 
      status: 'active' 
    });

    // Views per post
    const viewsPerPost = await PostView.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Comments per post
    const commentsPerPost = await Comment.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Map post titles to results
    const postMap = {};
    posts.forEach(p => { postMap[p._id.toString()] = { title: p.title, type: p.type, date: p.createdAt }; });

    const topPostsByViews = viewsPerPost.map(v => ({
      postId: v._id,
      title: postMap[v._id.toString()]?.title || 'Unknown',
      type: postMap[v._id.toString()]?.type || 'text',
      views: v.count
    }));

    const topPostsByComments = commentsPerPost.map(c => ({
      postId: c._id,
      title: postMap[c._id.toString()]?.title || 'Unknown',
      type: postMap[c._id.toString()]?.type || 'text',
      comments: c.count
    }));

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentViews = await PostView.countDocuments({
      postId: { $in: postIds },
      createdAt: { $gte: sevenDaysAgo }
    });
    const recentComments = await Comment.countDocuments({
      postId: { $in: postIds },
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalViews,
        totalComments,
        totalSubscribers,
        totalLikes,
        totalDislikes,
        recentViews,
        recentComments,
        totalPosts: posts.length,
        topPostsByViews,
        topPostsByComments
      }
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getPostInsights(req, res) {
  try {
    const { postId } = req.params;
    const creatorId = req.user.userId;

    const post = await Post.findOne({ _id: postId, creatorId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const views = await PostView.countDocuments({ postId });
    const comments = await Comment.countDocuments({ postId });

    // Daily views for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyViews = await PostView.aggregate([
      { 
        $match: { 
          postId: post._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        postId: post._id,
        title: post.title,
        views,
        comments,
        dailyViews
      }
    });
  } catch (error) {
    console.error('Error fetching post insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}