const express = require('express');
const router = express.Router();
const {
  getReservations,
  getReservationById,
  createReservation,
  confirmReservation,
  cancelReservation,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All reservation routes require authentication
router.use(protect);

router.get(
  '/',
  authorize('admin', 'manager', 'waiter', 'customer'),
  getReservations
);
router.get(
  '/:id',
  authorize('admin', 'manager', 'waiter', 'customer'),
  getReservationById
);
router.post('/', createReservation); // All authenticated users can book
router.put('/:id/confirm', authorize('admin', 'manager', 'waiter'), confirmReservation);
router.put('/:id/cancel', cancelReservation); // customers cancel own, staff cancel any
router.put(
  '/:id/status',
  authorize('admin', 'manager'),
  updateReservationStatus
);

module.exports = router;
