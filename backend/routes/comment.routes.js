import { Router } from "express";
import { createComment, deleteComment, updateComment, getAllCommentsForPost, likeComment, dislikeComment } from "../controllers/comment.controller.js";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
const commentRouter=Router()


commentRouter.get("/post/:postId", getAllCommentsForPost);
commentRouter.post("/:postId",authMiddleware,checkSubscriberExists,createComment);
commentRouter.put("/:id",authMiddleware,checkSubscriberExists,updateComment);
commentRouter.delete("/:postId/:id",authMiddleware,checkSubscriberExists,deleteComment);
commentRouter.put("/like/:commentId",authMiddleware,likeComment);
commentRouter.put("/dislike/:commentId",authMiddleware,dislikeComment);


export default commentRouter;