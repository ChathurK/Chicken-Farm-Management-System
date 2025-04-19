const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllTransactions, 
  getTransactionById,
  getFinancialSummary,
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', getAllTransactions);

// @route   GET /api/transactions/summary
// @desc    Get financial summary
// @access  Private/Admin
router.get('/summary', adminMiddleware, getFinancialSummary);

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', getTransactionById);

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post(
  '/',
  [
    check('transaction_type', 'Transaction type is required').not().isEmpty(),
    check('transaction_type', 'Transaction type must be either Income or Expense').isIn(['Income', 'Expense']),
    check('amount', 'Amount must be a positive number').isNumeric().toFloat().custom(value => value > 0)
  ],
  createTransaction
);

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private/Admin
router.put(
  '/:id',
  [
    adminMiddleware,
    check('transaction_type', 'Transaction type must be either Income or Expense').optional().isIn(['Income', 'Expense']),
    check('amount', 'Amount must be a positive number').optional().isNumeric().toFloat().custom(value => value > 0)
  ],
  updateTransaction
);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private/Admin
router.delete('/:id', adminMiddleware, deleteTransaction);

module.exports = router;