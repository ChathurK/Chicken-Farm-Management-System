const Chicken = require('../models/Chicken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// @desc    Get all chickens
// @route   GET /api/chickens
// @access  Private
exports.getAllChickens = async (req, res) => {
  try {
    // Check if we have type and breed filters
    const { type, breed } = req.query;
    
    if (type || breed) {
      // Use the new method to filter by type and breed
      const chickens = await Chicken.findByTypeAndBreed(type, breed);
      return res.json(chickens);
    }
    
    // If no filters, get all chickens
    const chickens = await Chicken.findAll();
    res.json(chickens);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get chicken by ID
// @route   GET /api/chickens/:id
// @access  Private
exports.getChickenById = async (req, res) => {
  try {
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return res.status(404).json({ msg: 'Chicken record not found' });
    }
    res.json(chicken);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create chicken record
// @route   POST /api/chickens
// @access  Private
exports.createChicken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, breed, quantity, age_weeks, acquisition_date, notes } = req.body;
    
    // Create the chicken record
    const chickenId = await Chicken.create({ 
      type, 
      breed, 
      quantity, 
      age_weeks, 
      acquisition_date, 
      notes 
    });
    
    res.status(201).json({ 
      chicken_record_id: chickenId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update chicken record
// @route   PUT /api/chickens/:id
// @access  Private
exports.updateChicken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, breed, quantity, age_weeks, acquisition_date, notes } = req.body;
    
    // First get the chicken record
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return res.status(404).json({ msg: 'Chicken record not found' });
    }
    
    // Create update object with proper date handling
    const updateData = {};
    if (type) updateData.type = type;
    if (breed) updateData.breed = breed;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (age_weeks !== undefined) updateData.age_weeks = age_weeks;
    if (notes !== undefined) updateData.notes = notes;

    // Handle acquisition_date specifically
    if (acquisition_date !== undefined) {
      // If it's a valid date string, use it
      const date = new Date(acquisition_date);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD for MySQL
        updateData.acquisition_date = date.toLocaleDateString('en-CA');
      } else if (acquisition_date === null) {
        // If explicitly null, use null
        updateData.acquisition_date = null;
      }
      // Otherwise, don't include it (keep existing value)
    }
    // Update the chicken record in the database
    await Chicken.update(req.params.id, updateData);

    res.json({ msg: 'Chicken record updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete chicken record
// @route   DELETE /api/chickens/:id
// @access  Private
exports.deleteChicken = async (req, res) => {
  try {
    // First get the chicken record
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return res.status(404).json({ msg: 'Chicken record not found' });
    }
    
    // Delete the chicken record
    await Chicken.delete(req.params.id);
    
    res.json({ msg: 'Chicken record deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};