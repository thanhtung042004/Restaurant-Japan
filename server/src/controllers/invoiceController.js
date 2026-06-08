const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Table = require('../models/Table');
const statsService = require('../services/statsService');

const getInvoices = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, startDate, endDate, page = 1, limit = 20 } =
      req.query;
    const filter = {};

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate('table', 'tableNumber area')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: invoices,
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

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('order')
      .populate('table', 'tableNumber area')
      .populate('processedBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      orderId,
      discountPercent = 0,
      vatPercent = 8,
      paymentMethod = 'cash',
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }

    const order = await Order.findById(orderId).populate('table');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot create invoice for a cancelled order.' });
    }

    // Check if paid invoice already exists
    const existingInvoice = await Invoice.findOne({
      order: orderId,
      paymentStatus: 'paid',
    });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'A paid invoice already exists for this order.',
      });
    }

    // Only include non-cancelled items
    const activeItems = order.items.filter((i) => i.status !== 'cancelled');
    const subtotal = activeItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const discount = Math.round((subtotal * Number(discountPercent)) / 100);
    const afterDiscount = subtotal - discount;
    const vat = Math.round((afterDiscount * Number(vatPercent)) / 100);
    const total = afterDiscount + vat;

    const invoiceItems = activeItems.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      subtotal: i.price * i.quantity,
    }));

    const invoice = await Invoice.create({
      order: orderId,
      table: order.table._id,
      processedBy: req.user._id,
      items: invoiceItems,
      subtotal,
      discount,
      discountPercent: Number(discountPercent),
      vat,
      vatPercent: Number(vatPercent),
      total,
      paymentMethod,
      paymentStatus: 'paid',
    });

    // Close the order and move table to cleaning
    order.status = 'completed';
    await order.save();
    await Table.findByIdAndUpdate(order.table._id, { status: 'cleaning' });

    // Notify clients
    const io = req.app.get('io');
    if (io) {
      io.emit('table:statusUpdated', {
        tableId: order.table._id,
        tableNumber: order.table.tableNumber,
        status: 'cleaning',
      });
    }

    const populated = await invoice.populate([
      { path: 'table', select: 'tableNumber area' },
      { path: 'processedBy', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created. Payment received.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { period = 'day', date } = req.query;
    const stats = await statsService.getStatistics(period, date);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDailyRevenue = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await statsService.getDailyRevenue(month, year);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.query;
    const data = await statsService.getMonthlyRevenue(year);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopMenuItems = async (req, res) => {
  try {
    const { limit = 10, period = 'month' } = req.query;
    const data = await statsService.getTopMenuItems(Number(limit), period);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPeakHours = async (req, res) => {
  try {
    const data = await statsService.getPeakHours();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  getStatistics,
  getDailyRevenue,
  getMonthlyRevenue,
  getTopMenuItems,
  getPeakHours,
};
