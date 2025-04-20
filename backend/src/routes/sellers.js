const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllSellers, 
  getSellerById,
  getSellerTransactionHistory,
  createSeller, 
  updateSeller, 
  deleteSeller 
} = require('../controllers/sellerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/sellers
// @desc    Get all sellers
// @access  Private
router.get('/', getAllSellers);

// @route   GET /api/sellers/:id
// @desc    Get seller by ID
// @access  Private
router.get('/:id', getSellerById);

// @route   GET /api/sellers/:id/transactions
// @desc    Get seller's transaction history
// @access  Private
router.get('/:id/transactions', getSellerTransactionHistory);

// @route   POST /api/sellers
// @desc    Create new seller
// @access  Private
router.post(
  '/',
  [
    check('full_name', 'Name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  createSeller
);

// @route   PUT /api/sellers/:id
// @desc    Update seller
// @access  Private
router.put(
  '/:id',
  [
    check('full_name', 'Name is required').not().isEmpty(),
    check('contact_number', 'Contact number is required').not().isEmpty()
  ],
  updateSeller
);

// @route   DELETE /api/sellers/:id
// @desc    Delete seller
// @access  Private/Admin
router.delete('/:id', adminMiddleware, deleteSeller);

module.exports = router;