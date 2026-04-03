import { Router } from "express";
import { authMiddleware, checkCreatorExists } from "../middleware/auth.js";
import {
  createCollection,
  getCreatorCollections,
  getCollectionById,
  getPublicCollectionById,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection,
  getCollectionsWithStats
} from "../controllers/collection.controller.js";

const collectionRouter = Router();
collectionRouter.post("/", authMiddleware, checkCreatorExists, createCollection);
collectionRouter.get("/my", authMiddleware, checkCreatorExists, getCreatorCollections);
collectionRouter.get("/my/stats", authMiddleware, checkCreatorExists, getCollectionsWithStats);
collectionRouter.get("/:collectionId", authMiddleware, checkCreatorExists, getCollectionById);
collectionRouter.put("/:collectionId", authMiddleware, checkCreatorExists, updateCollection);
collectionRouter.delete("/:collectionId", authMiddleware, checkCreatorExists, deleteCollection);
collectionRouter.post(
  "/:collectionId/posts/:postId",
  authMiddleware,
  checkCreatorExists,
  addPostToCollection
);
collectionRouter.delete(
  "/:collectionId/posts/:postId",
  authMiddleware,
  checkCreatorExists,
  removePostFromCollection
);
collectionRouter.get("/public/:collectionId", getPublicCollectionById);

export default collectionRouter;