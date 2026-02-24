import express from 'express';
import { registerUser, loginUser, googleAuth, googleCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected route to get user details from token
router.get('/me', protect, getMe);

export default router;
