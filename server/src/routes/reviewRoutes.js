import express from 'express';
import { getProductReviews, submitReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', authenticate, submitReview);

export default router;
