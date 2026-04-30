import express from "express";
import { verifyToken, checkAdmin } from "../middleware/auth.js";
import { 
  getDashboardStats, 
  getCreatorAnalytics, 
  getSubscriberAnalytics, 
  getRevenueAnalytics,
  getCreatorDetails,
  getPlatformOverview,
  getContentAnalytics,
  getTopCreators,
  getRecentActivity,
  getPaymentAnalytics,
  getTierAnalytics,
  getChurnAnalytics,
  getEngagementAnalytics,
  getGrowthTrends
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", verifyToken, checkAdmin, getDashboardStats);
router.get("/creators", verifyToken, checkAdmin, getCreatorAnalytics);
router.get("/creators/:id", verifyToken, checkAdmin, getCreatorDetails);
router.get("/subscribers", verifyToken, checkAdmin, getSubscriberAnalytics);
router.get("/revenue", verifyToken, checkAdmin, getRevenueAnalytics);
router.get("/overview", verifyToken, checkAdmin, getPlatformOverview);
router.get("/content", verifyToken, checkAdmin, getContentAnalytics);
router.get("/top-creators", verifyToken, checkAdmin, getTopCreators);
router.get("/activity", verifyToken, checkAdmin, getRecentActivity);
router.get("/payments", verifyToken, checkAdmin, getPaymentAnalytics);
router.get("/tiers", verifyToken, checkAdmin, getTierAnalytics);
router.get("/churn", verifyToken, checkAdmin, getChurnAnalytics);
router.get("/engagement", verifyToken, checkAdmin, getEngagementAnalytics);
router.get("/growth", verifyToken, checkAdmin, getGrowthTrends);

export default router;