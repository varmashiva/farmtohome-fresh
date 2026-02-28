import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
import { uploadProductImages } from '../controllers/uploadController.js';

const router = express.Router();

router.route('/product-images').post(protect, admin, upload.array('images', 8), uploadProductImages);

export default router;
