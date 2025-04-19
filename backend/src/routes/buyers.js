const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllBuyers, 
  getBuyerById,
  getBuyerOrderHistory,
  createBuyer, 
  updateBuyer, 
  deleteBuyer 
} = require('../controllers/buyerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/buyers
// @desc    Get all buyers
// @access  Private
router.get('/', getAllBuyers);

// @route   GET /api/buyers/:id
// @desc    Get buyer by ID
// @access  Private
router.get('/:id', getBuyerById);

// @route   GET /api/buyers/:id/orders
// @desc    Get buyer's order history
// @access  Private
router.get('/:id/orders', getBuyerOrderHistory);

// @route   POST /api/buyers
// @desc    Create new buyer
// @access  Private
router.post(
  '/',
  [
    check('full_name', 'Name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  createBuyer
);

// @route   PUT /api/buyers/:id
// @desc    Update buyer
// @access  Private
router.put(
  '/:id',
  [
    check('full_name', 'Name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  updateBuyer
);

// @route   DELETE /api/buyers/:id
// @desc    Delete buyer
// @access  Private/Admin
router.delete('/:id', adminMiddleware, deleteBuyer);

module.exports = router;