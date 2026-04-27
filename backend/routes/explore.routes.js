import express from 'express';
import {
  getCategories,
  getRecentlyVisited,
  getCreatorsForYou,
  getPopularThisWeek,
  getTopics,
  getTopCreatorsByCategory,
  getNewCreators,
  searchCreatorOrTopic
} from '../controllers/explore.controller.js';
import { authMiddleware, checkSubscriberExists } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/topics', getTopics);
router.get('/popular-this-week', getPopularThisWeek);
router.get('/top-creators', getTopCreatorsByCategory);
router.get('/new', getNewCreators);
router.get('/search', searchCreatorOrTopic);

// Protected routes (require login)
router.get('/recently-visited', authMiddleware,checkSubscriberExists, getRecentlyVisited);
router.get('/creators-for-you', authMiddleware,checkSubscriberExists, getCreatorsForYou);

export default router;