import express from 'express';
import { protect, admin, captain } from '../middleware/authMiddleware.js';
import { createOrder, getOrders, getMyOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, captain, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, captain, updateOrderStatus);
router.route('/:id/cancel').put(protect, admin, cancelOrder);

export default router;
