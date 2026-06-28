const express = require('express');
const router = express.Router();
const { getSessions, getAlerts, getBlockedIPs, blockIP, unblockIP } = require('../controllers/securityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/sessions', getSessions);
router.get('/alerts', getAlerts);
router.get('/blocked-ips', getBlockedIPs);
router.post('/blocked-ips', blockIP);
router.delete('/blocked-ips/:ip', unblockIP);

module.exports = router;
