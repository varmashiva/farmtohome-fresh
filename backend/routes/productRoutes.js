import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductSize,
    addProductImage,
    removeProductImage
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/size')
    .put(protect, admin, updateProductSize);

router.route('/:id/add-images')
    .put(protect, admin, addProductImage);

router.route('/:id/remove-image')
    .delete(protect, admin, removeProductImage);

export default router;
