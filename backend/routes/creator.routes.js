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
} from "../controllers/creator.controller.js";
const creatorRouter = Router();

creatorRouter.get("/profile/me", authMiddleware,checkCreator, getMyCreatorProfile);
creatorRouter.get("/profile/:creatorId", getCreatorProfileById);
creatorRouter.get("/:creatorId", getCreatorById);
creatorRouter.post("/profile", authMiddleware, checkCreator, makeCreatorProfile);
creatorRouter.put("/profile/edit", authMiddleware, checkCreator, updateCreatorProfile);
creatorRouter.post("/memberships",authMiddleware,checkCreatorExists,createMembership)
creatorRouter.get("/memberships/:id",authMiddleware,checkCreatorExists,getMembershipById)
creatorRouter.put("/memberships/:id",authMiddleware,checkCreatorExists,updateMembership)
creatorRouter.delete("/memberships/:id",authMiddleware,checkCreatorExists,deleteMembership)

export default creatorRouter;