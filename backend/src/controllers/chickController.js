const Chick = require('../models/Chick');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// @desc    Get all chicks
// @route   GET /api/chicks
// @access  Private
exports.getAllChicks = async (req, res) => {
  try {
    const query = 'SELECT * FROM Chick_Records';
    const [chicks] = await db.execute(query);
    res.json(chicks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get chick by ID
// @route   GET /api/chicks/:id
// @access  Private
exports.getChickById = async (req, res) => {
  try {
    const chick = await Chick.findById(req.params.id);
    if (!chick) {
      return res.status(404).json({ msg: 'Chick record not found' });
    }
    res.json(chick);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create chick record
// @route   POST /api/chicks
// @access  Private
exports.createChick = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { parent_breed, hatched_date, quantity, notes } = req.body;
    
    // Create the chick record
    const chickId = await Chick.create({ 
      parent_breed, 
      hatched_date, 
      quantity, 
      notes 
    });
    
    res.status(201).json({ 
      chick_record_id: chickId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update chick record
// @route   PUT /api/chicks/:id
// @access  Private
exports.updateChick = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { parent_breed, hatched_date, quantity, notes } = req.body;
    
    // First get the chick record
    const chick = await Chick.findById(req.params.id);
    if (!chick) {
      return res.status(404).json({ msg: 'Chick record not found' });
    }
    
    // Update the chick record
    await Chick.update(req.params.id, {
      parent_breed,
      hatched_date,
      quantity,
      notes
    });
    
    res.json({ msg: 'Chick record updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete chick record
// @route   DELETE /api/chicks/:id
// @access  Private
exports.deleteChick = async (req, res) => {
  try {
    // First get the chick record
    const chick = await Chick.findById(req.params.id);
    if (!chick) {
      return res.status(404).json({ msg: 'Chick record not found' });
    }
    
    // Delete the chick record
    await Chick.delete(req.params.id);
    
    res.json({ msg: 'Chick record deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};