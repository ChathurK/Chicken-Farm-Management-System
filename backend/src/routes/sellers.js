const express = require('express');
const { check } = require('express-validator');
const sellerController = require('../controllers/sellerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/sellers
// @desc    Get all sellers
// @access  Private
router.get('/', sellerController.getAllSellers);

// @route   GET /api/sellers/:id
// @desc    Get seller by ID
// @access  Private
router.get('/:id', sellerController.getSellerById);

// @route   GET /api/sellers/:id/transactions
// @desc    Get seller's transaction history
// @access  Private
router.get('/:id/transactions', sellerController.getSellerTransactionHistory);

// @route   POST /api/sellers
// @desc    Create new seller
// @access  Private
router.post(
  '/',
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  sellerController.createSeller
);

// @route   PUT /api/sellers/:id
// @desc    Update seller
// @access  Private
router.put(
  '/:id',
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  sellerController.updateSeller
);

// @route   DELETE /api/sellers/:id
// @desc    Delete seller
// @access  Private/Admin
router.delete('/:id', adminMiddleware, sellerController.deleteSeller);

module.exports = router;