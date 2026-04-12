import { Router } from "express";
import { createComment, deleteComment, updateComment } from "../controllers/comment.controller";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth";
const commentRouter=Router()


commentRouter.post("/",authMiddleware,checkSubscriberExists,createComment);
commentRouter.put("/:id",authMiddleware,checkSubscriberExists,updateComment);
commentRouter.delete("/:id",authMiddleware,checkSubscriberExists,deleteComment);



export default commentRouter;