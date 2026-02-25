import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getRevenueStats, getUsersList } from '../controllers/adminController.js';

const router = express.Router();

router.route('/revenue').get(protect, admin, getRevenueStats);
router.route('/users').get(protect, admin, getUsersList);

export default router;
