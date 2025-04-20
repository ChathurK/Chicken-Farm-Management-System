const Inventory = require('../models/Inventory');
const { validationResult } = require('express-validator');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getAllInventory = async (req, res) => {
  try {
    // Check if filters are provided
    const { category, status, expiringSoon, lowStock } = req.query;
    
    let inventory;
    if (category || status || expiringSoon || lowStock) {
      // Use filters
      inventory = await Inventory.findWithFilters({
        category,
        status,
        expiringSoon: expiringSoon === 'true',
        lowStock: lowStock === 'true'
      });
    } else {
      // Get all
      inventory = await Inventory.findAll();
    }
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get inventory by ID
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get inventory by category
// @route   GET /api/inventory/category/:category
// @access  Private
exports.getInventoryByCategory = async (req, res) => {
  try {
    const inventory = await Inventory.findByCategory(req.params.category);
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private
exports.createInventory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      category, 
      item_name, 
      quantity, 
      unit, 
      purchase_date, 
      expiration_date,
      cost_per_unit,
      status 
    } = req.body;

    // Create inventory item
    const inventory = await Inventory.create({
      category, 
      item_name, 
      quantity, 
      unit, 
      purchase_date, 
      expiration_date,
      cost_per_unit,
      status
    });

    res.status(201).json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if inventory item exists
    let inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    const { 
      category, 
      item_name, 
      quantity, 
      unit, 
      purchase_date, 
      expiration_date,
      cost_per_unit,
      status 
    } = req.body;

    // Update inventory
    inventory = await Inventory.update(req.params.id, {
      category, 
      item_name, 
      quantity, 
      unit, 
      purchase_date, 
      expiration_date,
      cost_per_unit,
      status
    });

    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update inventory status
// @route   PATCH /api/inventory/:id/status
// @access  Private
exports.updateInventoryStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if inventory item exists
    let inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    const { status } = req.body;

    // Update status
    inventory = await Inventory.updateStatus(req.params.id, status);

    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update inventory quantity
// @route   PATCH /api/inventory/:id/quantity
// @access  Private
exports.updateInventoryQuantity = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if inventory item exists
    let inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    const { quantity } = req.body;

    // Update quantity
    inventory = await Inventory.updateQuantity(req.params.id, quantity);

    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete inventory
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
exports.deleteInventory = async (req, res) => {
  try {
    // Check if inventory item exists
    let inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    // Delete inventory
    await Inventory.delete(req.params.id);

    res.json({ msg: 'Inventory item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};