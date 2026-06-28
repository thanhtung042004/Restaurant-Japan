const SystemLog = require('../models/SystemLog');

/**
 * GET /api/logs
 * Query params: category, severity, from, to, search, page, limit
 */
const getLogs = async (req, res) => {
  try {
    const { category, severity, from, to, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }
    if (search) {
      filter.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await SystemLog.countDocuments(filter);
    const logs = await SystemLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: logs,
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

module.exports = { getLogs };
