const express = require('express');
const router = express.Router();
const {
  foodSuggestion,
  businessAnalysis,
  getChatHistory,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// All authenticated users can get food suggestions
router.post('/food-suggestion', foodSuggestion);

// Admin only: business analysis with real data
router.post('/business-analysis', authorize('admin'), businessAnalysis);

// View chat history
router.get('/history', getChatHistory);

module.exports = router;
