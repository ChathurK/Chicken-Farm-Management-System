const Egg = require('../models/Egg');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// @desc    Get all eggs
// @route   GET /api/eggs
// @access  Private
exports.getAllEggs = async (req, res) => {
  try {
    // Check if we have size and color filters
    const { size, color } = req.query;
    
    if (size || color) {
      // Use the new method to filter by size and color
      const eggs = await Egg.findBySizeAndColor(size, color);
      return res.json(eggs);
    }
    
    // If no filters, get all eggs
    const eggs = await Egg.findAll();
    res.json(eggs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get egg by ID
// @route   GET /api/eggs/:id
// @access  Private
exports.getEggById = async (req, res) => {
  try {
    const egg = await Egg.findById(req.params.id);
    if (!egg) {
      return res.status(404).json({ msg: 'Egg record not found' });
    }
    res.json(egg);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create egg record
// @route   POST /api/eggs
// @access  Private
exports.createEgg = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { laid_date, expiration_date, quantity, size, color, notes } = req.body;
    
    // Create the egg record
    const eggId = await Egg.create({ 
      laid_date, 
      expiration_date, 
      quantity, 
      size,
      color,
      notes 
    });
    
    res.status(201).json({ 
      egg_record_id: eggId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update egg record
// @route   PUT /api/eggs/:id
// @access  Private
exports.updateEgg = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { laid_date, expiration_date, quantity, size, color, notes } = req.body;
    
    // First get the egg record
    const egg = await Egg.findById(req.params.id);
    if (!egg) {
      return res.status(404).json({ msg: 'Egg record not found' });
    }
      // Update the egg record
    await Egg.update(req.params.id, {
      laid_date,
      expiration_date,
      quantity,
      size,
      color,
      notes
    });
    
    res.json({ msg: 'Egg record updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete egg record
// @route   DELETE /api/eggs/:id
// @access  Private
exports.deleteEgg = async (req, res) => {
  try {
    // First get the egg record
    const egg = await Egg.findById(req.params.id);
    if (!egg) {
      return res.status(404).json({ msg: 'Egg record not found' });
    }
    
    // Delete the egg record
    await Egg.delete(req.params.id);
    
    res.json({ msg: 'Egg record deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};