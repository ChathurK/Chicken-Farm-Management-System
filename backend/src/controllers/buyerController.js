const Buyer = require("../models/Buyer");
const { validationResult } = require("express-validator");

// @desc    Get all buyers
// @route   GET /api/buyers
// @access  Private
exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.findAll();
    res.json(buyers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get buyer by ID
// @route   GET /api/buyers/:id
// @access  Private
exports.getBuyerById = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ msg: 'Buyer not found' });
    }
    res.json(buyer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get buyer order history
// @route   GET /api/buyers/:id/orders
// @access  Private
exports.getBuyerOrderHistory = async (req, res) => {
  try {
    // Check if buyer exists
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ msg: 'Buyer not found' });
    }

    const orderHistory = await Buyer.getOrderHistory(req.params.id);
    res.json(orderHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create buyer
// @route   POST /api/buyers
// @access  Private
exports.createBuyer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, contact_number, email, address } = req.body;

    // Check if email already exists
    if (email) {
      const existingBuyer = await Buyer.findByEmail(email);
      if (existingBuyer) {
        return res.status(400).json({ msg: 'Buyer with this email already exists' });
      }
    }

    // Create buyer
    const buyer = await Buyer.create({
      first_name,
      last_name,
      contact_number,
      email,
      address,
    });

    res.status(201).json({
      success: true,
      data: buyer,
      msg: "Buyer created successfully",
    });
  } catch (err) {
    console.error(err.message);

    // Handle specific errors
    if (err.message === "Contact number already exists") {
      return res.status(400).json({ msg: err.message });
    }

    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: err.message,
    });
  }
};

// @desc    Update buyer
// @route   PUT /api/buyers/:id
// @access  Private
exports.updateBuyer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if buyer exists
    let buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        msg: "Buyer not found",
      });
    }

    const { first_name, last_name, contact_number, email, address } = req.body;

    // Check if email already exists and is different from current buyer's email
    if (email && email !== buyer.email) {
      const existingBuyer = await Buyer.findByEmail(email);
      if (existingBuyer) {
        return res.status(400).json({
          success: false,
          msg: "Buyer with this email already exists",
        });
      }
    }

    // Update buyer
    buyer = await Buyer.update(req.params.id, {
      first_name,
      last_name,
      contact_number,
      email,
      address,
    });

    res.json({
      success: true,
      data: buyer,
      msg: "Buyer updated successfully",
    });
  } catch (err) {
    console.error(err.message);

    // Handle specific errors
    if (err.message === "Contact number already exists") {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: err.message,
    });
  }
};

// @desc    Delete buyer
// @route   DELETE /api/buyers/:id
// @access  Private/Admin
exports.deleteBuyer = async (req, res) => {
  try {
    // Check if buyer exists
    let buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        msg: "Buyer not found",
      });
    }

    // Delete buyer
    await Buyer.delete(req.params.id);

    res.json({
      success: true,
      msg: "Buyer removed successfully",
    });
  } catch (err) {
    console.error(err.message);

    // Handle specific errors
    if (err.message.includes("Cannot delete buyer because")) {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: err.message,
    });
  }
};
