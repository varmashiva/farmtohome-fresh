import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserCart, syncUserCart } from '../controllers/userController.js';

const router = express.Router();

router.route('/cart').get(protect, getUserCart).put(protect, syncUserCart);

export default router;
