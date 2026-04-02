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
creatorRouter.get("/stripe-status",authMiddleware,checkCreatorExists,checkStripeStatus)
creatorRouter.get("/onboarding/refresh/:accountId", async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/creator/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/creator/onboarding/success`,
      type: "account_onboarding",
    });
    
    res.redirect(accountLink.url);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
export default creatorRouter;