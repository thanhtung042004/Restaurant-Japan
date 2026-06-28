const SystemLog = require('../models/SystemLog');

/**
 * Lightweight helper to write an audit log entry.
 * Call from controllers: await writeLog(req, { action, category, severity, description, before, after })
 */
const writeLog = async (req, { action, category = 'SYSTEM', severity = 'info', description = '', before = null, after = null }) => {
  try {
    const user = req?.user
      ? { id: req.user._id, name: req.user.name, role: req.user.role }
      : { id: null, name: 'System', role: 'system' };

    const ip =
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      '';

    const ua = req?.headers?.['user-agent'] || '';
    const device = parseDevice(ua);

    await SystemLog.create({ user, action, category, severity, ip, device, description, before, after });
  } catch (_) {
    // Logging must never break the main flow
  }
};

function parseDevice(ua) {
  if (!ua) return 'Unknown';
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua);
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown';
  return `${browser}/${mobile ? 'Mobile' : os}`;
}

module.exports = { writeLog };
