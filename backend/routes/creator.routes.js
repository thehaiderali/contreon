import { Router } from "express";
import { authMiddleware, checkCreator, checkCreatorExists } from "../middleware/auth.js";
import {
  getCreatorProfileById,
  getMyCreatorProfile,
  getCreatorById,
  makeCreatorProfile,
  updateCreatorProfile,
  creatorConnectStripe,
  checkStripeStatus
} from "../controllers/creator.controller.js";

const creatorRouter = Router();

creatorRouter.get("/profile/me", authMiddleware,checkCreator, getMyCreatorProfile);
creatorRouter.get("/profile/:creatorId", getCreatorProfileById);
creatorRouter.get("/:creatorId", getCreatorById);
creatorRouter.post("/profile", authMiddleware, checkCreator, makeCreatorProfile);
creatorRouter.put("/profile/edit", authMiddleware, checkCreator, updateCreatorProfile);
creatorRouter.post("/connect-stripe",authMiddleware,checkCreatorExists,creatorConnectStripe)
creatorRouter.get("/stripe-status",checkStripeStatus)
export default creatorRouter;