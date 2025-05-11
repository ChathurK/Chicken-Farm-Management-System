const express = require('express');
const { check } = require('express-validator');
const buyerController = require('../controllers/buyerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/buyers
// @desc    Get all buyers
// @access  Private
router.get('/', buyerController.getAllBuyers);

// @route   GET /api/buyers/:id
// @desc    Get buyer by ID
// @access  Private
router.get('/:id', buyerController.getBuyerById);

// @route   GET /api/buyers/:id/orders
// @desc    Get buyer's order history
// @access  Private
router.get('/:id/orders', buyerController.getBuyerOrderHistory);

// @route   POST /api/buyers
// @desc    Create new buyer
// @access  Private
router.post(
  '/',
  [
    check('first_name', 'First name is required').not().isEmpty().trim().escape(),
    check('last_name', 'Last name is required').not().isEmpty().trim().escape(),
    check('contact_number', 'Contact number is required')
      .not().isEmpty()
      .trim()
      .custom(value => {
        // Allow only numbers, spaces, +, and -
        if (!/^[0-9\s+\-()]+$/.test(value)) {
          throw new Error('Contact number must contain only digits, spaces, and the following characters: +, -, ()');
        }
        return true;
      }),
    check('email', 'Please include a valid email').isEmail().normalizeEmail()
  ],
  buyerController.createBuyer
);

// @route   PUT /api/buyers/:id
// @desc    Update buyer
// @access  Private
router.put(
  '/:id',
  [
    check('first_name', 'First name is required').not().isEmpty().trim().escape(),
    check('last_name', 'Last name is required').not().isEmpty().trim().escape(),
    check('contact_number', 'Contact number is required')
      .not().isEmpty()
      .trim()
      .custom(value => {
        // Allow only numbers, spaces, +, and -
        if (!/^[0-9\s+\-()]+$/.test(value)) {
          throw new Error('Contact number must contain only digits, spaces, and the following characters: +, -, ()');
        }
        return true;
      }),
    check('email', 'Please include a valid email').isEmail().normalizeEmail()
  ],
  buyerController.updateBuyer
);

// @route   DELETE /api/buyers/:id
// @desc    Delete buyer
// @access  Private/Admin
router.delete('/:id', adminMiddleware, buyerController.deleteBuyer);

module.exports = router;