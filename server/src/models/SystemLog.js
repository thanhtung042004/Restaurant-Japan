const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'system' },
    },
    action: {
      type: String,
      required: true,
      // e.g. USER_CREATED, ROLE_CHANGED, LOGIN_SUCCESS, LOGIN_FAILED,
      //      PASSWORD_RESET, USER_DELETED, SETTING_UPDATED, BACKUP_CREATED
    },
    category: {
      type: String,
      enum: ['USER', 'SYSTEM', 'SECURITY', 'CONFIG', 'BACKUP'],
      default: 'SYSTEM',
    },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    ip: { type: String, default: '' },
    device: { type: String, default: '' },
    description: { type: String, default: '' },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// TTL index: keep logs for 90 days
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
systemLogSchema.index({ category: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
