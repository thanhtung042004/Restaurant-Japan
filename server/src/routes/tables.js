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
  authorize('admin', 'waiter', 'receptionist'),
  updateTableStatus
);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, authorize('admin'), updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);

module.exports = router;
