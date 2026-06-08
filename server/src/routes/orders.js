const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  getKitchenOrders,
  createOrder,
  addItemsToOrder,
  updateItemStatus,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Kitchen screen: get all active orders with pending/cooking items
router.get(
  '/kitchen',
  authorize('admin', 'manager', 'waiter'),
  getKitchenOrders
);

router.get('/', authorize('admin', 'manager', 'waiter'), getOrders);
router.get('/:id', authorize('admin', 'manager', 'waiter'), getOrderById);
router.post('/', authorize('admin', 'manager', 'waiter'), createOrder);
router.put('/:id/items', authorize('admin', 'manager', 'waiter'), addItemsToOrder);
router.put('/:id/status', authorize('admin', 'manager', 'waiter'), updateOrderStatus);
router.put('/:id/cancel', authorize('admin', 'manager', 'waiter'), cancelOrder);

// Kitchen updates individual item status
router.put(
  '/:orderId/items/:itemId/status',
  authorize('admin', 'manager', 'waiter'),
  updateItemStatus
);

module.exports = router;
