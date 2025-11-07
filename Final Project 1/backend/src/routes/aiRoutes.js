import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateSummary } from '../controllers/aiController.js';
// Future imports:
// import { generateQuiz, generateBoth } from '../controllers/aiController.js';

const router = express.Router();

// ✅ Generate AI summary
router.post('/summary', generateSummary);


// router.post('/quiz', protect, generateQuiz);
// router.post('/both', protect, generateBoth);

export default router;
