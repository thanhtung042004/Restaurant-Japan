const SystemSettings = require('../models/SystemSettings');

// Default settings to seed if collection is empty
const DEFAULT_SETTINGS = [
  { key: 'app_name', value: 'Sakura Restaurant System', label: 'Tên ứng dụng', description: 'Tên hiển thị của hệ thống' },
  { key: 'timezone', value: 'Asia/Ho_Chi_Minh', label: 'Múi giờ', description: 'Múi giờ hệ thống' },
  { key: 'language', value: 'vi', label: 'Ngôn ngữ', description: 'Ngôn ngữ mặc định' },
  { key: 'allow_registration', value: true, label: 'Cho phép đăng ký', description: 'Cho phép đăng ký tài khoản mới' },
  { key: 'allow_booking', value: true, label: 'Cho phép đặt bàn', description: 'Cho phép đặt bàn online' },
  { key: 'send_email_confirmation', value: false, label: 'Gửi email xác nhận', description: 'Gửi email xác nhận đặt bàn' },
  { key: 'show_ai_chat_customer', value: true, label: 'AI Chat cho khách', description: 'Hiển thị AI chat với khách hàng' },
  { key: 'maintenance_mode', value: false, label: 'Chế độ bảo trì', description: 'Chặn tất cả người dùng trừ Admin' },
  { key: 'smtp_host', value: '', label: 'SMTP Host', description: 'Máy chủ email SMTP' },
  { key: 'smtp_port', value: 587, label: 'SMTP Port', description: 'Cổng SMTP' },
  { key: 'smtp_from', value: '', label: 'From Email', description: 'Địa chỉ email gửi đi' },
  { key: 'backup_schedule', value: '0 2 * * *', label: 'Lịch sao lưu', description: 'Cron expression cho sao lưu tự động' },
  { key: 'backup_keep', value: 30, label: 'Số bản sao lưu giữ lại', description: 'Số bản sao lưu tối đa' },
  { key: 'password_min_length', value: 6, label: 'Độ dài mật khẩu tối thiểu', description: 'Số ký tự tối thiểu' },
  { key: 'password_expire_days', value: 0, label: 'Hết hạn mật khẩu (ngày)', description: '0 = không hết hạn' },
  { key: 'max_login_attempts', value: 5, label: 'Số lần đăng nhập sai tối đa', description: 'Tự động khóa sau N lần sai' },
];

const seedSettings = async () => {
  for (const s of DEFAULT_SETTINGS) {
    await SystemSettings.updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });
  }
};

/**
 * GET /api/settings
 */
const getSettings = async (req, res) => {
  try {
    await seedSettings();
    const settings = await SystemSettings.find().sort({ key: 1 }).lean();
    // Convert to object map for easier frontend consumption
    const map = {};
    settings.forEach((s) => { map[s.key] = s; });
    res.json({ success: true, data: map });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/settings/:key
 */
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ success: false, message: 'Value is required.' });
    }
    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, message: 'Setting updated.', data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/settings  (batch update)
 */
const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value, updatedBy: req.user._id } },
        upsert: true,
      },
    }));
    await SystemSettings.bulkWrite(ops);
    res.json({ success: true, message: 'Settings updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSetting, updateSettings };
