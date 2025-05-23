const Chick = require('../models/Chick');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// @desc    Get all chicks
// @route   GET /api/chicks
// @access  Private
exports.getAllChicks = async (req, res) => {
  try {
    // Check if we have parent_breed filter
    const { parent_breed } = req.query;
    
    if (parent_breed) {
      // Use the new method to filter by parent_breed
      const chicks = await Chick.findByParentBreed(parent_breed);
      return res.json(chicks);
    }
    
    // If no filters, get all chicks
    const chicks = await Chick.findAll();
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

    // Convert hatched_date safely
    const localHatchedDate = hatched_date
      ? new Date(hatched_date).toLocaleDateString("en-CA")
      : null;

    // First get the chick record
    const chick = await Chick.findById(req.params.id);
    if (!chick) {
      return res.status(404).json({ msg: "Chick record not found" });
    }

    // Update the chick record (replace undefined with existing values or null)
    const updateData = {
      parent_breed: parent_breed ?? chick.parent_breed,
      hatched_date: localHatchedDate ?? chick.hatched_date,
      quantity: quantity ?? chick.quantity,
      notes: notes ?? chick.notes,
    };

    await Chick.update(req.params.id, updateData);

    res.json({ msg: "Chick record updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
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