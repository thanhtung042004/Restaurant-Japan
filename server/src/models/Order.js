const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  note: {
    type: String,
    default: '',
  },
  // Kitchen tracks each item individually
  status: {
    type: String,
    enum: ['pending', 'cooking', 'done', 'cancelled'],
    default: 'pending',
  },
});

const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    // open -> serving -> completed / cancelled
    status: {
      type: String,
      enum: ['open', 'serving', 'completed', 'cancelled'],
      default: 'open',
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Recalculate total before saving (exclude cancelled items)
orderSchema.pre('save', function (next) {
  this.totalAmount = this.items
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
