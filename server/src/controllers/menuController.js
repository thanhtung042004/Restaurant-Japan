const MenuItem = require('../models/MenuItem');

const getMenuItems = async (req, res) => {
  try {
    const {
      category,
      isAvailable,
      isBestSeller,
      search,
      containsSeafood,
      isVegetarian,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isBestSeller !== undefined) filter.isBestSeller = isBestSeller === 'true';
    if (containsSeafood !== undefined) filter.containsSeafood = containsSeafood === 'true';
    if (isVegetarian !== undefined) filter.isVegetarian = isVegetarian === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await MenuItem.countDocuments(filter);
    const items = await MenuItem.find(filter)
      .populate('category', 'name')
      .sort({ isBestSeller: -1, name: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: items,
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

const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;

    // Parse ingredients if sent as comma-separated string
    if (typeof data.ingredients === 'string') {
      data.ingredients = data.ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse boolean strings from form-data
    if (data.isAvailable !== undefined) data.isAvailable = data.isAvailable !== 'false';
    if (data.isBestSeller !== undefined) data.isBestSeller = data.isBestSeller === 'true';
    if (data.containsSeafood !== undefined) data.containsSeafood = data.containsSeafood === 'true';
    if (data.isVegetarian !== undefined) data.isVegetarian = data.isVegetarian === 'true';

    const item = await MenuItem.create(data);
    const populated = await item.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = updateData.ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (updateData.isAvailable !== undefined)
      updateData.isAvailable = updateData.isAvailable !== 'false';
    if (updateData.isBestSeller !== undefined)
      updateData.isBestSeller = updateData.isBestSeller === 'true';
    if (updateData.containsSeafood !== undefined)
      updateData.containsSeafood = updateData.containsSeafood === 'true';
    if (updateData.isVegetarian !== undefined)
      updateData.isVegetarian = updateData.isVegetarian === 'true';

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    res.json({ success: true, message: 'Menu item updated.', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item is now ${item.isAvailable ? 'available' : 'unavailable'}.`,
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
