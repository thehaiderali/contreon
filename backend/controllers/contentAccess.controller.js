import jwt from "jsonwebtoken";
import { mux } from "../utils/mux.js";
import { envConfig } from '../config/env.js';
import Post from "../models/post.model.js";
import PostView from "../models/view.model.js";
import Subscription from "../models/subscription.model.js";
import Comment from "../models/comment.model.js";

async function recordPostView(postId, userId) {
    try {
        await PostView.create({ postId, viewerId: userId });
    } catch (error) {
        console.error("Error recording post view:", error);
    }
}

export async function getSignedPlaybackUrlWithAccess(req, res) {
    try {
        const { playbackId } = req.params;
        const userId = req.user.userId;

        if (!playbackId) {
            return res.status(400).json({
                success: false,
                error: "Playback ID is required"
            });
        }

        const post = await Post.findOne({ playbackId }).populate('tierId');
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: "Post not found"
            });
        }

        recordPostView(post._id, userId);

        const isFree = !post.isPaid && !post.tierId;

        if (isFree) {
            const signedUrl = `https://stream.mux.com/${playbackId}.m3u8`;
            return res.status(200).json({
                success: true,
                data: {
                    playbackId: playbackId,
                    signedUrl: signedUrl
                }
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required",
                requiresSubscription: true
            });
        }

        const subscription = await Subscription.findOne({
            subscriberId: userId,
            creatorId: post.creatorId,
            status: "active"
        }).populate('tierId');

        if (!subscription) {
            return res.status(403).json({
                success: false,
                error: "Subscription required to access this content",
                requiresSubscription: true
            });
        }

        const userTierPrice = subscription.tierId?.price || 0;
        const postTierPrice = post.tierId?.price || 0;

        if (userTierPrice < postTierPrice) {
            return res.status(403).json({
                success: false,
                error: "Your subscription tier does not have access to this content",
                requiresSubscription: true
            });
        }

        const signingKeyId = envConfig.MUX_SIGNING_KEY_ID;
        const signingKeyPrivate = envConfig.MUX_SIGNING_PRIVATE_KEY;

        if (!signingKeyId || !signingKeyPrivate) {
            console.error("❌ Missing signing credentials!");
            return res.status(500).json({
                success: false,
                error: "Signing key not configured"
            });
        }

        let decodedKey;
        try {
            decodedKey = Buffer.from(signingKeyPrivate, 'base64').toString('utf-8');
        } catch (decodeError) {
            return res.status(500).json({
                success: false,
                error: "Invalid private key encoding"
            });
        }

        if (!decodedKey.includes('BEGIN') || !decodedKey.includes('PRIVATE KEY')) {
            return res.status(500).json({
                success: false,
                error: "Invalid private key format"
            });
        }

        const claims = {
            sub: playbackId,
            aud: 'v',
            exp: Math.floor(Date.now() / 1000) + 86400,
            kid: signingKeyId
        };

        let signedToken;
        try {
            signedToken = jwt.sign(claims, decodedKey, { algorithm: 'RS256' });
        } catch (signError) {
            console.error("❌ Failed to sign JWT:", signError.message);
            return res.status(500).json({
                success: false,
                error: "Failed to sign token"
            });
        }

        const signedUrl = `https://stream.mux.com/${playbackId}.m3u8?token=${signedToken}`;
        
        return res.status(200).json({
            success: true,
            data: {
                playbackId: playbackId,
                signedUrl: signedUrl,
                expiresAt: new Date(claims.exp * 1000).toISOString()
            }
        });
        
    } catch (error) {
        console.error("Error in getSignedPlaybackUrlWithAccess:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export async function getAllCommentsWithAccess(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;

        const post = await Post.findById(postId).populate('tierId');
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: "Post not found"
            });
        }

        recordPostView(post._id, userId);

        const isFree = !post.isPaid && !post.tierId;

        if (isFree) {
            const comments = await Comment.find({ postId })
                .populate('authorId', 'name avatar')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: { comments }
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required to view comments on paid posts"
            });
        }

        const subscription = await Subscription.findOne({
            subscriberId: userId,
            creatorId: post.creatorId,
            status: "active"
        }).populate('tierId');

        if (!subscription) {
            return res.status(403).json({
                success: false,
                error: "Subscription required to view comments"
            });
        }

        const userTierPrice = subscription.tierId?.price || 0;
        const postTierPrice = post.tierId?.price || 0;

        if (userTierPrice < postTierPrice) {
            return res.status(403).json({
                success: false,
                error: "Your subscription tier cannot view comments on this post"
            });
        }

        recordPostView(post._id, userId);

        const comments = await Comment.find({ postId })
            .populate('authorId', 'name avatar')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: { comments }
        });

    } catch (error) {
        console.error("Error in getAllCommentsWithAccess:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export async function createCommentWithAccess(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                error: "Comment content is required"
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required to comment"
            });
        }

        const post = await Post.findById(postId).populate('tierId');
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: "Post not found"
            });
        }

        const isFree = !post.isPaid && !post.tierId;

        if (!isFree) {
            const subscription = await Subscription.findOne({
                subscriberId: userId,
                creatorId: post.creatorId,
                status: "active"
            }).populate('tierId');

            if (!subscription) {
                return res.status(403).json({
                    success: false,
                    error: "Subscription required to comment on paid posts"
                });
            }

            const userTierPrice = subscription.tierId?.price || 0;
            const postTierPrice = post.tierId?.price || 0;

            if (userTierPrice < postTierPrice) {
                return res.status(403).json({
                    success: false,
                    error: "Your subscription tier cannot comment on this post"
                });
            }

            const existingComment = await Comment.findOne({ postId, authorId: userId });
            
            if (existingComment) {
                return res.status(400).json({
                    success: false,
                    error: "You have already commented on this post"
                });
            }
        }

        const newComment = new Comment({
            authorId: userId,
            postId,
            content: content.trim()
        });

        await newComment.save();
        await newComment.populate('authorId', 'name avatar');

        return res.status(200).json({
            success: true,
            data: { comment: newComment },
            message: "Comment created successfully"
        });

    } catch (error) {
        console.error("Error in createCommentWithAccess:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}