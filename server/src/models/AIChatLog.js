const mongoose = require('mongoose');

const aiChatLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['food_suggestion', 'business_analysis'],
      required: true,
    },
    // Store business data snapshot for business_analysis logs
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIChatLog', aiChatLogSchema);
