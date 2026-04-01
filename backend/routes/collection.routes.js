import { Router } from "express";
import { creationCollection,deleteCollection,updateCollection } from "../controllers/collection.controller";
import { checkCreatorExists } from "../middleware/auth";

const collectionRouter=Router();


collectionRouter.post("/",checkCreatorExists,creationCollection)
collectionRouter.put("/:collectionId",checkCreatorExists,updateCollection)
collectionRouter.delete("/:collectionId",checkCreatorExists,deleteCollection)




export default collectionRouter