import express from 'express';
import { getCommunities, createCommunity, deleteCommunity } from '../controllers/communityController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getCommunities)
    .post(protect, admin, createCommunity);

router.route('/:id')
    .delete(protect, admin, deleteCommunity);

export default router;
