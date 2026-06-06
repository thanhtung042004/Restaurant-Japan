const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

const getOrders = async (req, res) => {
  try {
    const { status, tableId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tableId) filter.table = tableId;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('table', 'tableNumber area')
      .populate('waiter', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber area capacity')
      .populate('waiter', 'name')
      .populate('items.menuItem', 'name price image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Kitchen endpoint: get all active orders with pending/cooking items.
 */
const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['open', 'serving'] },
      'items.status': { $in: ['pending', 'cooking'] },
    })
      .populate('table', 'tableNumber area')
      .populate('waiter', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { tableId, items, note } = req.body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tableId and items array are required.',
      });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    // Validate items and pull prices from DB to prevent price manipulation
    const enrichedItems = [];
    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have menuItemId and quantity >= 1.',
        });
      }
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItemId}`,
        });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${menuItem.name}" is currently unavailable.`,
        });
      }
      enrichedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        note: item.note || '',
        status: 'pending',
      });
    }

    // If table already has an open order, append items to it
    let order = await Order.findOne({ table: tableId, status: 'open' });
    if (order) {
      order.items.push(...enrichedItems);
      if (note) order.note = note;
      await order.save();
    } else {
      order = await Order.create({
        table: tableId,
        waiter: req.user._id,
        items: enrichedItems,
        note: note || '',
      });
      // Update table status to serving
      await Table.findByIdAndUpdate(tableId, { status: 'serving' });
    }

    const populated = await order.populate([
      { path: 'table', select: 'tableNumber area' },
      { path: 'waiter', select: 'name' },
    ]);

    // Notify kitchen in realtime
    const io = req.app.get('io');
    if (io) {
      io.to('kitchen').emit('order:new', populated);
      io.emit('table:statusUpdated', {
        tableId,
        tableNumber: table.tableNumber,
        status: 'serving',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order sent to kitchen.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addItemsToOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add items to a closed order.',
      });
    }

    const newItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;
      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${menuItem.name}" is currently unavailable.`,
        });
      }
      newItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        note: item.note || '',
        status: 'pending',
      });
    }

    order.items.push(...newItems);
    await order.save();

    const populated = await order.populate('table', 'tableNumber');

    const io = req.app.get('io');
    if (io) {
      io.to('kitchen').emit('order:itemsAdded', populated);
    }

    res.json({ success: true, message: 'Items added to order.', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Kitchen updates status of a single item in an order.
 */
const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'cooking', 'done', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid item status.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Order item not found.' });
    }

    item.status = status;
    await order.save();

    const populated = await order.populate('table', 'tableNumber area');

    // Notify all connected clients about item status change
    const io = req.app.get('io');
    if (io) {
      io.emit('order:itemStatusUpdated', {
        orderId: order._id,
        itemId,
        status,
        tableNumber: populated.table?.tableNumber,
        itemName: item.name,
      });
    }

    res.json({ success: true, message: 'Item status updated.', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('table', 'tableNumber area');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, message: 'Order status updated.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed order.',
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Free up the table
    await Table.findByIdAndUpdate(order.table, { status: 'available' });

    const io = req.app.get('io');
    if (io) {
      io.emit('order:cancelled', { orderId: order._id, tableId: order.table });
      io.emit('table:statusUpdated', { tableId: order.table, status: 'available' });
    }

    res.json({ success: true, message: 'Order cancelled.', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  getKitchenOrders,
  createOrder,
  addItemsToOrder,
  updateItemStatus,
  updateOrderStatus,
  cancelOrder,
};
