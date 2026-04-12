import { Router } from "express";
import { createComment } from "../controllers/comment.controller";
import { authMiddleware, checkSubscriberExists } from "../middleware/auth";
const commentRouter=Router()


commentRouter.post("/",authMiddleware,checkSubscriberExists,createComment);
commentRouter.put("/:id",authMiddleware,checkSubscriberExists,createComment);
commentRouter.delete("/:id",authMiddleware,checkSubscriberExists,createComment);



export default commentRouter