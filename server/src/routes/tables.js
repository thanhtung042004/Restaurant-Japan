const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} = require('../controllers/tableController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public: anyone can view table availability
router.get('/', getTables);
router.get('/:id', getTableById);

// Protected routes
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'manager', 'waiter', 'receptionist', 'cashier'),
  updateTableStatus
);
router.post('/', protect, authorize('admin', 'manager', 'manager'), createTable);
router.put('/:id', protect, authorize('admin', 'manager', 'manager'), updateTable);
router.delete('/:id', protect, authorize('admin', 'manager', 'manager'), deleteTable);

module.exports = router;
