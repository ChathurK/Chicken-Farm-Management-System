const Chicken = require('../models/Chicken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// @desc    Get all chickens
// @route   GET /api/chickens
// @access  Private
exports.getAllChickens = async (req, res) => {
  try {
    const query = 'SELECT * FROM Chicken_Records';
    const [chickens] = await db.execute(query);
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
    
    // Update the chicken record
    await Chicken.update(req.params.id, {
      type,
      breed,
      quantity,
      age_weeks,
      acquisition_date,
      notes
    });
    
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