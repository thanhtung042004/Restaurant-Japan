const express = require('express');
const router = express.Router();
const { getOverview, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/stats', getStats);

module.exports = router;
