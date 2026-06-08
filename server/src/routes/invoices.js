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
router.get('/statistics', authorize('admin', 'manager', 'manager'), getStatistics);
router.get('/daily-revenue', authorize('admin', 'manager', 'manager'), getDailyRevenue);
router.get('/monthly-revenue', authorize('admin', 'manager', 'manager'), getMonthlyRevenue);
router.get('/top-items', authorize('admin', 'manager', 'manager'), getTopMenuItems);
router.get('/peak-hours', authorize('admin', 'manager', 'manager'), getPeakHours);

router.get('/', authorize('admin', 'manager', 'waiter'), getInvoices);
router.post('/', authorize('admin', 'manager', 'waiter'), createInvoice);
router.get('/:id', authorize('admin', 'manager', 'waiter'), getInvoiceById);

module.exports = router;
