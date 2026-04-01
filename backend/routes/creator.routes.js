import { Router } from "express";
import { authMiddleware, checkCreator } from "../middleware/auth.js";
import {
  getCreatorProfileById,
  getMyCreatorProfile,
  getCreatorById,
  makeCreatorProfile,
  updateCreatorProfile
} from "../controllers/creator.controller.js";

const creatorRouter = Router();

creatorRouter.get("/profile/me", authMiddleware,checkCreator, getMyCreatorProfile);
creatorRouter.get("/profile/:creatorId", getCreatorProfileById);
creatorRouter.get("/:creatorId", getCreatorById);
creatorRouter.post("/profile", authMiddleware, checkCreator, makeCreatorProfile);
creatorRouter.put("/profile/edit", authMiddleware, checkCreator, updateCreatorProfile);

export default creatorRouter;