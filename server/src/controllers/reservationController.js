const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const getReservations = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.reservationDate = { $gte: start, $lte: end };
    }

    // Customers can only see their own reservations
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    }

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .populate('customer', 'name email phone bio')
      .populate('table', 'tableNumber capacity area')
      .populate('confirmedBy', 'name role')
      .sort({ reservationDate: 1, reservationTime: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: reservations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('table', 'tableNumber capacity area')
      .populate('confirmedBy', 'name');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const { customerName, phone, numberOfGuests, reservationDate, reservationTime, note } =
      req.body;

    if (!customerName || !phone || !numberOfGuests || !reservationDate || !reservationTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    const date = new Date(reservationDate);

    // Find tables already reserved at this date+time
    const reservedTableIds = await Reservation.find({
      reservationDate: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      reservationTime,
      status: { $in: ['pending', 'confirmed'] },
    }).distinct('table');

    // Find a suitable available table
    const allTables = await Table.find({
      capacity: { $gte: Number(numberOfGuests) },
    }).sort({ capacity: 1 });

    // 1. Prefer tables that are currently available
    let assignedTable = allTables.find(
      (t) => t.status === 'available' && !reservedTableIds.some((id) => id && id.toString() === t._id.toString())
    );

    // 2. Fallback to any table that isn't reserved at this time
    if (!assignedTable) {
      assignedTable = allTables.find(
        (t) => !reservedTableIds.some((id) => id && id.toString() === t._id.toString())
      );
    }

    const reservationData = {
      customerName,
      phone,
      numberOfGuests,
      reservationDate,
      reservationTime,
      note,
      table: assignedTable ? assignedTable._id : null,
    };

    // Link to customer account if logged in as customer
    if (req.user && req.user.role === 'customer') {
      reservationData.customer = req.user._id;
    }

    const reservation = await Reservation.create(reservationData);

    // ponytail: mark table reserved immediately so waiter floor plan is accurate
    // Only update if it's currently available, so we don't overwrite serving/cleaning states
    let statusUpdated = false;
    if (assignedTable && assignedTable.status === 'available') {
      await Table.findByIdAndUpdate(assignedTable._id, { status: 'reserved' });
      statusUpdated = true;
    }

    const populated = await reservation.populate([
      { path: 'table', select: 'tableNumber capacity area' },
      { path: 'customer', select: 'name email bio' },
    ]);

    // Notify all connected clients in realtime
    const io = req.app.get('io');
    if (io) {
      io.emit('reservation:new', populated);
      // ponytail: also push to waiter room for notification badge
      io.to('waiter').emit('notification:new', {
        type: 'reservation',
        icon: '📅',
        message: `Đặt bàn mới: ${customerName} — ${numberOfGuests} khách lúc ${reservationTime}`,
        time: new Date(),
      });
      if (assignedTable && statusUpdated) {
        io.emit('table:statusUpdated', {
          tableId: assignedTable._id,
          tableNumber: assignedTable.tableNumber,
          status: 'reserved',
          table: { ...assignedTable.toObject(), status: 'reserved' },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: assignedTable
        ? `Reservation created. Table ${assignedTable.tableNumber} has been pre-assigned.`
        : 'Reservation created. Staff will assign a suitable table.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const confirmReservation = async (req, res) => {
  try {
    const { tableId } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    if (reservation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a reservation with status '${reservation.status}'.`,
      });
    }

    reservation.status = 'confirmed';
    reservation.confirmedBy = req.user._id;
    if (tableId) {
      reservation.table = tableId;
      await Table.findByIdAndUpdate(tableId, { status: 'reserved' });
    }
    await reservation.save();

    const populated = await reservation.populate([
      { path: 'table', select: 'tableNumber capacity area' },
      { path: 'confirmedBy', select: 'name' },
      { path: 'customer', select: 'name email phone' },
    ]);

    const io = req.app.get('io');
    if (io) {
      io.emit('reservation:confirmed', populated);
    }

    res.json({ success: true, message: 'Reservation confirmed.', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    // Customers can only cancel their own reservations
    if (
      req.user.role === 'customer' &&
      (!reservation.customer || reservation.customer.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['cancelled', 'completed'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a reservation with status '${reservation.status}'.`,
      });
    }

    // Free up the table if it was assigned
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({ success: true, message: 'Reservation cancelled.', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'table', select: 'tableNumber capacity area' },
      { path: 'customer', select: 'name email phone' },
    ]);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('reservation:statusUpdated', reservation);
    }

    res.json({
      success: true,
      message: 'Reservation status updated.',
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  confirmReservation,
  cancelReservation,
  updateReservationStatus,
};
