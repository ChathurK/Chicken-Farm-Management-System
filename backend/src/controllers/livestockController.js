const Livestock = require('../models/Livestock');
const { validationResult } = require('express-validator');

// @desc    Get all livestock
// @route   GET /api/livestock
// @access  Private
exports.getAllLivestock = async (req, res) => {
  try {
    const livestock = await Livestock.findAll();
    res.json(livestock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get livestock by ID
// @route   GET /api/livestock/:id
// @access  Private
exports.getLivestockById = async (req, res) => {
  try {
    const livestock = await Livestock.findById(req.params.id);
    if (!livestock) {
      return res.status(404).json({ msg: 'Livestock not found' });
    }
    res.json(livestock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create livestock
// @route   POST /api/livestock
// @access  Private
exports.createLivestock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, total_quantity, status } = req.body;
    const livestockId = await Livestock.create({ type, total_quantity, status });
    res.status(201).json({ id: livestockId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update livestock
// @route   PUT /api/livestock/:id
// @access  Private
exports.updateLivestock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, total_quantity, status } = req.body;
    await Livestock.update(req.params.id, { type, total_quantity, status });
    res.json({ msg: 'Livestock updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete livestock
// @route   DELETE /api/livestock/:id
// @access  Private
exports.deleteLivestock = async (req, res) => {
  try {
    await Livestock.delete(req.params.id);
    res.json({ msg: 'Livestock deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};