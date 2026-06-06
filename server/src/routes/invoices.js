const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  getStatistics,
  getDailyRevenue,
  getMonthlyRevenue,
  getTopMenuItems,
  getPeakHours,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Statistics endpoints (admin only) - must be before /:id
router.get('/statistics', authorize('admin'), getStatistics);
router.get('/daily-revenue', authorize('admin'), getDailyRevenue);
router.get('/monthly-revenue', authorize('admin'), getMonthlyRevenue);
router.get('/top-items', authorize('admin'), getTopMenuItems);
router.get('/peak-hours', authorize('admin'), getPeakHours);

router.get('/', authorize('admin', 'waiter', 'receptionist'), getInvoices);
router.post('/', authorize('admin', 'waiter'), createInvoice);
router.get('/:id', authorize('admin', 'waiter'), getInvoiceById);

module.exports = router;
