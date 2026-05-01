import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createTrackingLink, getTrackingLinks, deleteTrackingLink, getLinkStats, redirectLink, getOriginalUrl } from "../controllers/trackingLink.controller.js";

const trackingLinkRouter = Router();

trackingLinkRouter.get('/l/:token', redirectLink);
trackingLinkRouter.post('/', authMiddleware, createTrackingLink);
trackingLinkRouter.get('/', authMiddleware, getTrackingLinks);
trackingLinkRouter.delete('/:id', authMiddleware, deleteTrackingLink);
trackingLinkRouter.get('/stats', authMiddleware, getLinkStats);
trackingLinkRouter.get('/original/:token', authMiddleware, getOriginalUrl);

export default trackingLinkRouter;