const express = require('express');
const { check } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', transactionController.getAllTransactions);

// @route   GET /api/transactions/summary
// @desc    Get financial summary
// @access  Private/Admin
router.get('/summary', adminMiddleware, transactionController.getFinancialSummary);

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', transactionController.getTransactionById);

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
  transactionController.createTransaction
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
  transactionController.updateTransaction
);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private/Admin
router.delete('/:id', adminMiddleware, transactionController.deleteTransaction);

module.exports = router;