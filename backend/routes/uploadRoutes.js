import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
import { uploadProductImage } from '../controllers/uploadController.js';

const router = express.Router();

router.route('/product-image').post(protect, admin, upload.single('image'), uploadProductImage);

export default router;
