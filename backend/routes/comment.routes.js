import { Router } from "express";
import { createComment, deleteComment, updateComment } from "../controllers/comment.controller.js";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth.js";
const commentRouter=Router()


commentRouter.post("/:postId",authMiddleware,checkSubscriberExists,createComment);
commentRouter.put("/:id",authMiddleware,checkSubscriberExists,updateComment);
commentRouter.delete("/:id",authMiddleware,checkSubscriberExists,deleteComment);


export default commentRouter;