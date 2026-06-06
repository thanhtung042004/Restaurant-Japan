const aiService = require('../services/aiService');
const statsService = require('../services/statsService');
const MenuItem = require('../models/MenuItem');
const AIChatLog = require('../models/AIChatLog');

/**
 * POST /api/ai/food-suggestion
 * Customer sends preference text, AI returns recommended menu items.
 */
const foodSuggestion = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Fetch available menu items with their dietary details
    const menuItems = await MenuItem.find({ isAvailable: true })
      .populate('category', 'name')
      .select(
        'name description price category ingredients spicyLevel containsSeafood isVegetarian isBestSeller'
      );

    if (menuItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No menu items available.' });
    }

    const answer = await aiService.suggestFood(message, menuItems);

    // Persist chat log
    await AIChatLog.create({
      user: req.user ? req.user._id : null,
      question: message,
      answer,
      type: 'food_suggestion',
    });

    res.json({ success: true, data: { answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/ai/business-analysis
 * Admin asks a question; AI analyzes aggregated business data and responds.
 */
const businessAnalysis = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    // Collect business data from multiple sources in parallel
    const [dailyRevenue, monthlyRevenue, topItems, peakHours, currentStats] =
      await Promise.all([
        statsService.getDailyRevenue(),
        statsService.getMonthlyRevenue(),
        statsService.getTopMenuItems(5, 'month'),
        statsService.getPeakHours(),
        statsService.getStatistics('month'),
      ]);

    const businessData = {
      dailyRevenue: dailyRevenue.slice(-7), // last 7 days of this month
      monthlyRevenue,
      topItems,
      peakHours,
      currentStats,
    };

    const answer = await aiService.analyzeBusinessData(question, businessData);

    await AIChatLog.create({
      user: req.user._id,
      question,
      answer,
      type: 'business_analysis',
      context: {
        topItems: businessData.topItems,
        currentStats: businessData.currentStats,
        peakHours: businessData.peakHours,
      },
    });

    res.json({ success: true, data: { answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/ai/history
 * Get AI chat history for the current user.
 */
const getChatHistory = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type) filter.type = req.query.type;

    const logs = await AIChatLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-context');

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { foodSuggestion, businessAnalysis, getChatHistory };
