import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStockStatus,
    updateProductPrice
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/out-of-stock')
    .put(protect, admin, updateStockStatus);

router.route('/:id/update-price')
    .put(protect, admin, updateProductPrice);

export default router;
