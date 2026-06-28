const express = require('express');
const router = express.Router();
const { getSettings, updateSetting, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/:key', updateSetting);

module.exports = router;
