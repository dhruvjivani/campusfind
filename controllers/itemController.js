const Item = require('../models/Item');
const path = require('path');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { category, campus, status, search, limit = 20, page = 1 } = req.query;
    
    const filters = {
      category,
      campus,
      status,
      search,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const items = await Item.findAll(filters);
    
    // Get total count for pagination
    const countFilters = { category, campus, status, search };
    const allItems = await Item.findAll(countFilters);
    
    res.json({
      success: true,
      count: items.length,
      total: allItems.length,
      page: parseInt(page),
      pages: Math.ceil(allItems.length / parseInt(limit)),
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report found item
// @route   POST /api/items/found
// @access  Private
const reportFoundItem = async (req, res) => {
  try {
    const { title, category, description, location_found, campus, status } = req.body;
    
    // Get image URL if file uploaded
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const itemData = {
      title,
      category,
      description,
      location_found,
      campus,
      status,
      image_url,
      user_id: req.user.id
    };

    const item = await Item.create(itemData);
    
    res.status(201).json({
      message: 'Item reported successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report lost item
// @route   POST /api/items/lost
// @access  Private
const reportLostItem = async (req, res) => {
  try {
    const { title, category, description, location_lost, campus } = req.body;
    
    const itemData = {
      title,
      category,
      description,
      location_found: location_lost,
      campus,
      status: 'lost',
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      user_id: req.user.id
    };

    const item = await Item.create(itemData);
    
    res.status(201).json({
      message: 'Lost item reported successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item details
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { title, category, description, location_found, campus } = req.body;
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check authorization - user must be owner or staff
    if (item.user_id !== req.user.id && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    const updatedItem = await Item.update(req.params.id, {
      title: title || item.title,
      category: category || item.category,
      description: description || item.description,
      location_found: location_found || item.location_found,
      campus: campus || item.campus
    });
    
    res.json({
      message: 'Item updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update item status
// @route   PUT /api/items/:id/status
// @access  Private
const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const item = await Item.updateStatus(req.params.id, status);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({
      message: 'Item status updated successfully',
      item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const deleted = await Item.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getItems,
  getItem,
  reportFoundItem,
  reportLostItem,
  updateItem,
  updateItemStatus,
  deleteItem
};