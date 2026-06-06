const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: 1,
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    reservationTime: {
      type: String,
      required: [true, 'Reservation time is required'],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
    // pending -> confirmed -> arrived -> completed
    // pending -> cancelled
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'arrived', 'cancelled', 'completed'],
      default: 'pending',
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
