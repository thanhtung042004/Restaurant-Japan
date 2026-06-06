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
  authorize('admin', 'chef', 'waiter'),
  getKitchenOrders
);

router.get('/', authorize('admin', 'waiter', 'receptionist'), getOrders);
router.get('/:id', authorize('admin', 'waiter', 'chef'), getOrderById);
router.post('/', authorize('admin', 'waiter'), createOrder);
router.put('/:id/items', authorize('admin', 'waiter'), addItemsToOrder);
router.put('/:id/status', authorize('admin', 'waiter'), updateOrderStatus);
router.put('/:id/cancel', authorize('admin', 'waiter'), cancelOrder);

// Kitchen updates individual item status
router.put(
  '/:orderId/items/:itemId/status',
  authorize('admin', 'chef', 'waiter'),
  updateItemStatus
);

module.exports = router;
