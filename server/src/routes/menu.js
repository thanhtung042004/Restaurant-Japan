const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public: anyone can browse the menu
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Admin only: manage menu items
router.post('/', protect, authorize('admin', 'manager', 'manager'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('admin', 'manager', 'manager'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'manager', 'manager'), deleteMenuItem);
router.patch('/:id/toggle-availability', protect, authorize('admin', 'manager', 'chef'), toggleAvailability);

module.exports = router;
