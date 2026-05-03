import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/user.model.js";

const router = Router();

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.userId;
    
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }
    
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select("fullName email role profileImageUrl").limit(20);
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;