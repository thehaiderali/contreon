import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getCreatorInsights, getPostInsights } from "../controllers/insights.controller.js";

const insightsRouter = Router();

insightsRouter.get('/', authMiddleware, getCreatorInsights);
insightsRouter.get('/post/:postId', authMiddleware, getPostInsights);

export default insightsRouter;