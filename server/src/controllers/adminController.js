const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const mongoose = require('mongoose');

/**
 * GET /api/admin/overview
 * Returns KPI summary + system health indicators for the Overview tab.
 */
const getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      managerCount,
      waiterCount,
      customerCount,
      recentLogs,
      securityEvents,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'waiter' }),
      User.countDocuments({ role: 'customer' }),
      SystemLog.find().sort({ createdAt: -1 }).limit(8).lean(),
      SystemLog.find({ category: 'SECURITY' }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Today's logins
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const loginToday = await SystemLog.countDocuments({
      action: 'LOGIN_SUCCESS',
      createdAt: { $gte: todayStart },
    });
    const failedLoginToday = await SystemLog.countDocuments({
      action: 'LOGIN_FAILED',
      createdAt: { $gte: todayStart },
    });

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, admin: adminCount, manager: managerCount, waiter: waiterCount, customer: customerCount },
        logins: { today: loginToday, failedToday: failedLoginToday },
        recentLogs,
        securityEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/stats
 * Returns analytics data: user growth, role distribution, AI usage, etc.
 */
const getStats = async (req, res) => {
  try {
    // User growth — last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Daily logins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyLogins = await SystemLog.aggregate([
      { $match: { action: 'LOGIN_SUCCESS', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // AI usage (last 7 days)
    const aiUsage = await SystemLog.aggregate([
      { $match: { category: 'SYSTEM', action: 'AI_REQUEST', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total AI requests today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const aiToday = await SystemLog.countDocuments({ action: 'AI_REQUEST', createdAt: { $gte: todayStart } });

    res.json({
      success: true,
      data: {
        userGrowth,
        roleDistribution,
        dailyLogins,
        aiUsage,
        aiToday,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOverview, getStats };
