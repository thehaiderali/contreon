import { Router } from "express";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
import { 
    getSignedPlaybackUrlWithAccess, 
    getAllCommentsWithAccess, 
    createCommentWithAccess 
} from "../controllers/contentAccess.controller.js";

const contentAccessRouter = Router();

contentAccessRouter.get("/video/:playbackId", authMiddleware, checkSubscriberExists,getSignedPlaybackUrlWithAccess);
contentAccessRouter.get("/comments/:postId", authMiddleware, checkSubscriberExists,getAllCommentsWithAccess);
contentAccessRouter.post("/comments/:postId", authMiddleware,checkSubscriberExists, createCommentWithAccess);

export default contentAccessRouter;