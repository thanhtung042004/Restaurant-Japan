const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/', getLogs);

module.exports = router;
