import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/user.model.js';

const router = express.Router();

// GET subscriber profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        displayName: user.fullName,
        email: user.email,
        country: user.country || 'Not specified',
        avatar: user.avatar || '',
        bio: user.bio || '',
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// UPDATE subscriber profile (including avatar)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, country, bio, avatar } = req.body;
    
    const updates = {};
    if (displayName !== undefined) updates.fullName = displayName;
    if (country !== undefined) updates.country = country;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: false }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        displayName: user.fullName,
        email: user.email,
        country: user.country || 'Not specified',
        avatar: user.avatar || '',
        bio: user.bio || '',
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;