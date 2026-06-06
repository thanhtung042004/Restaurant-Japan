const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public: customers can see active categories
router.get('/', getCategories);

// Admin: see all categories including inactive
router.get('/all', protect, authorize('admin', 'manager', 'manager'), getAllCategories);
router.post('/', protect, authorize('admin', 'manager', 'manager'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin', 'manager', 'manager'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'manager', 'manager'), deleteCategory);

module.exports = router;
