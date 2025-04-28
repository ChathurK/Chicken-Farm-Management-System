const Seller = require('../models/Seller');
const { validationResult } = require('express-validator');

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.findAll();
    res.json(sellers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get seller by ID
// @route   GET /api/sellers/:id
// @access  Private
exports.getSellerById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }
    res.json(seller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get seller transaction history
// @route   GET /api/sellers/:id/transactions
// @access  Private
exports.getSellerTransactionHistory = async (req, res) => {
  try {
    // Check if seller exists
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }
    
    const transactions = await Seller.getTransactionHistory(req.params.id);
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create seller
// @route   POST /api/sellers
// @access  Private
exports.createSeller = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, contact_number, email, address } = req.body;

    // Check if email already exists
    if (email) {
      const existingSeller = await Seller.findByEmail(email);
      if (existingSeller) {
        return res.status(400).json({ msg: 'Seller with this email already exists' });
      }
    }

    // Create seller
    const seller = await Seller.create({
      first_name,
      last_name,
      contact_number,
      email,
      address
    });

    res.status(201).json(seller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update seller
// @route   PUT /api/sellers/:id
// @access  Private
exports.updateSeller = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if seller exists
    let seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    const { first_name, last_name, contact_number, email, address } = req.body;

    // Check if email already exists and is different from current seller's email
    if (email && email !== seller.email) {
      const existingSeller = await Seller.findByEmail(email);
      if (existingSeller) {
        return res.status(400).json({ msg: 'Seller with this email already exists' });
      }
    }

    // Update seller
    seller = await Seller.update(req.params.id, {
      first_name,
      last_name,
      contact_number,
      email,
      address
    });

    res.json(seller);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete seller
// @route   DELETE /api/sellers/:id
// @access  Private/Admin
exports.deleteSeller = async (req, res) => {
  try {
    // Check if seller exists
    let seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    // Delete seller
    await Seller.delete(req.params.id);

    res.json({ msg: 'Seller removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};