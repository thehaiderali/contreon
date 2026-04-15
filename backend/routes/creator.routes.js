import { Router } from "express";
import { authMiddleware, checkCreator, checkCreatorExists } from "../middleware/auth.js";
import {
  getCreatorProfileById,
  getMyCreatorProfile,
  getCreatorById,
  makeCreatorProfile,
  updateCreatorProfile,
  createMembership,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getAllMembershipsForCreator,
} from "../controllers/creator.controller.js";
import {
  createPost,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePublishStatus,
  getPostStats
} from "../controllers/post.controller.js";
import { creatorDeleteComment,  creatorFeaturedCommentToggle, getAllCommentsForPost } from "../controllers/comment.controller.js";
import { createTranscription } from "../controllers/transcription.controller.js";
import { checkMuxUploadStatus, getSignedPlaybackUrl, MuxUploadUrl } from "../controllers/mux.controller.js";

const creatorRouter = Router();
creatorRouter.post("/mux-upload-url",authMiddleware,checkCreatorExists,MuxUploadUrl)
creatorRouter.get("/mux-upload-status/:uploadId",authMiddleware,checkCreatorExists,checkMuxUploadStatus)
creatorRouter.get("/mux-playback-url/:playbackId",authMiddleware,checkCreatorExists,getSignedPlaybackUrl)
creatorRouter.get("/profile/me", authMiddleware, checkCreator, getMyCreatorProfile);
creatorRouter.get("/profile/:creatorId", getCreatorProfileById);
creatorRouter.get("/:creatorId", getCreatorById);
creatorRouter.post("/profile", authMiddleware, checkCreator, makeCreatorProfile);
creatorRouter.put("/profile/edit", authMiddleware, checkCreator, updateCreatorProfile);
creatorRouter.post("/memberships", authMiddleware, checkCreatorExists, createMembership);
creatorRouter.get("/memberships/me",authMiddleware,checkCreatorExists,getAllMembershipsForCreator)
creatorRouter.get("/memberships/:id", authMiddleware, checkCreatorExists, getMembershipById);
creatorRouter.put("/memberships/:id", authMiddleware, checkCreatorExists, updateMembership);
creatorRouter.delete("/memberships/:id", authMiddleware, checkCreatorExists, deleteMembership);
creatorRouter.post("/posts", authMiddleware, checkCreatorExists, createPost);
creatorRouter.get("/posts/my-posts", authMiddleware, checkCreatorExists, getMyPosts);
creatorRouter.get("/posts/stats", authMiddleware, checkCreatorExists, getPostStats);
creatorRouter.get("/posts/:id", authMiddleware, checkCreatorExists, getPostById);
creatorRouter.put("/posts/:id", authMiddleware, checkCreatorExists, updatePost);
creatorRouter.delete("/posts/:id", authMiddleware, checkCreatorExists, deletePost);
creatorRouter.patch("/posts/:id/publish", authMiddleware, checkCreatorExists, togglePublishStatus);
creatorRouter.get("/posts/:id/comments",authMiddleware,checkCreatorExists,getAllCommentsForPost);
creatorRouter.delete("/posts/:id/comments/:commentId",authMiddleware,checkCreatorExists,creatorDeleteComment);
creatorRouter.post("/posts/:id/comments/:commentId/feature-toggle",authMiddleware,checkCreatorExists,creatorFeaturedCommentToggle);
creatorRouter.post("/transcribe",authMiddleware,checkCreatorExists,createTranscription)

export default creatorRouter;