const SystemLog = require('../models/SystemLog');

// In-memory store for blocked IPs (production: use Redis or DB)
const blockedIPs = new Map(); // ip -> { reason, blockedAt }

/**
 * GET /api/security/sessions
 * Returns recent login sessions from audit logs as a proxy.
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await SystemLog.find({ action: 'LOGIN_SUCCESS' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/security/alerts
 * Returns security alerts: failed logins, suspicious IPs, etc.
 */
const getAlerts = async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Failed logins grouped by IP
    const failedByIP = await SystemLog.aggregate([
      { $match: { action: 'LOGIN_FAILED', createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$ip', count: { $sum: 1 }, lastAttempt: { $max: '$createdAt' } } },
      { $match: { count: { $gte: 3 } } },
      { $sort: { count: -1 } },
    ]);

    const alerts = failedByIP.map((item) => ({
      type: 'FAILED_LOGIN',
      severity: item.count >= 5 ? 'error' : 'warning',
      message: `${item.count} lần đăng nhập thất bại từ IP ${item._id}`,
      ip: item._id,
      count: item.count,
      lastAttempt: item.lastAttempt,
    }));

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/security/blocked-ips
 */
const getBlockedIPs = async (req, res) => {
  const list = Array.from(blockedIPs.entries()).map(([ip, info]) => ({ ip, ...info }));
  res.json({ success: true, data: list });
};

/**
 * POST /api/security/blocked-ips
 * Body: { ip, reason }
 */
const blockIP = async (req, res) => {
  try {
    const { ip, reason = 'Chặn thủ công' } = req.body;
    if (!ip) return res.status(400).json({ success: false, message: 'IP is required.' });
    blockedIPs.set(ip, { reason, blockedAt: new Date().toISOString() });
    res.json({ success: true, message: `Đã chặn IP ${ip}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/security/blocked-ips/:ip
 */
const unblockIP = async (req, res) => {
  try {
    const ip = decodeURIComponent(req.params.ip);
    blockedIPs.delete(ip);
    res.json({ success: true, message: `Đã gỡ chặn IP ${ip}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSessions, getAlerts, getBlockedIPs, blockIP, unblockIP };
