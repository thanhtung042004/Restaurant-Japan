const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    area: {
      type: String,
      enum: ['Tang 1', 'Tang 2', 'Phong VIP', 'Tầng 1', 'Tầng 2', 'Phòng VIP', 'Sân Vườn'],
      default: 'Tang 1',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'serving', 'cleaning'],
      default: 'available',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
