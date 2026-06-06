const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

/**
 * Get overall statistics for a given period.
 * @param {string} period - 'day' | 'month' | 'year'
 * @param {string} date - Optional ISO date string
 */
const getStatistics = async (period = 'day', date) => {
  const now = date ? new Date(date) : new Date();
  let startDate, endDate;

  if (period === 'day') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  const [revenueData, orderCount] = await Promise.all([
    Invoice.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalSubtotal: { $sum: '$subtotal' },
          totalDiscount: { $sum: '$discount' },
          totalVat: { $sum: '$vat' },
          count: { $sum: 1 },
        },
      },
    ]),
    Order.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate },
    }),
  ]);

  const revenue = revenueData[0];
  return {
    period,
    startDate,
    endDate,
    totalRevenue: revenue?.totalRevenue || 0,
    totalSubtotal: revenue?.totalSubtotal || 0,
    totalDiscount: revenue?.totalDiscount || 0,
    totalVat: revenue?.totalVat || 0,
    totalInvoices: revenue?.count || 0,
    totalOrders: orderCount,
    averageOrderValue:
      revenue?.count > 0
        ? Math.round(revenue.totalRevenue / revenue.count)
        : 0,
  };
};

/**
 * Get daily revenue breakdown for a specific month.
 * @param {number|string} month - 1-12
 * @param {number|string} year - e.g. 2025
 */
const getDailyRevenue = async (month, year) => {
  const now = new Date();
  const targetMonth = month ? Number(month) - 1 : now.getMonth();
  const targetYear = year ? Number(year) : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const data = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const daysInMonth = endDate.getDate();
  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const found = data.find((d) => d._id === day);
    result.push({
      day,
      date: new Date(targetYear, targetMonth, day).toISOString().split('T')[0],
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0,
    });
  }

  return result;
};

/**
 * Get monthly revenue breakdown for a specific year.
 * @param {number|string} year
 */
const getMonthlyRevenue = async (year) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const data = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthNames = [
    'Thang 1', 'Thang 2', 'Thang 3', 'Thang 4',
    'Thang 5', 'Thang 6', 'Thang 7', 'Thang 8',
    'Thang 9', 'Thang 10', 'Thang 11', 'Thang 12',
  ];

  return monthNames.map((name, idx) => {
    const found = data.find((d) => d._id === idx + 1);
    return {
      month: idx + 1,
      name,
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0,
    };
  });
};

/**
 * Get top selling menu items by quantity in a given period.
 * @param {number} limit
 * @param {string} period - 'week' | 'month' | 'year' | 'all'
 */
const getTopMenuItems = async (limit = 10, period = 'month') => {
  const now = new Date();
  let startDate;

  if (period === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(0);
  }

  const data = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: Number(limit) },
    {
      $project: {
        _id: 0,
        name: '$_id',
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);

  return data;
};

/**
 * Get peak hour data for the current month.
 */
const getPeakHours = async () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const data = await Invoice.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        label: {
          $concat: [
            { $toString: '$_id' },
            'h - ',
            { $toString: { $add: ['$_id', 1] } },
            'h',
          ],
        },
        count: 1,
        revenue: 1,
      },
    },
  ]);

  return data;
};

module.exports = {
  getStatistics,
  getDailyRevenue,
  getMonthlyRevenue,
  getTopMenuItems,
  getPeakHours,
};
