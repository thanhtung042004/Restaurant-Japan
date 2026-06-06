const Table = require('../models/Table');

const getTables = async (req, res) => {
  try {
    const { status, area } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (area) filter.area = area;

    const tables = await Table.find(filter).sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Table created successfully.',
      data: table,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists.',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }
    res.json({ success: true, message: 'Table updated.', data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }
    res.json({ success: true, message: 'Table deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'reserved', 'serving', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    // Broadcast table status change to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('table:statusUpdated', {
        tableId: table._id,
        tableNumber: table.tableNumber,
        status: table.status,
        table,
      });
    }

    res.json({ success: true, message: 'Table status updated.', data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
};
