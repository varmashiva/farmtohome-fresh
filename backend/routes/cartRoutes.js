import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

// All routes are private
router.route('/').get(protect, getCart);
router.route('/add').post(protect, addToCart);
router.route('/update').put(protect, updateCartItem);
router.route('/remove').delete(protect, removeCartItem);
router.route('/clear').delete(protect, clearCart);

export default router;
