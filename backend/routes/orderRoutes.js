import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createOrder, getOrders, getMyOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
