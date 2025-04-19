const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getAllTransactions = async (req, res) => {
  try {
    // Check if filters are provided
    const { 
      transaction_type, 
      buyer_id, 
      seller_id, 
      inventory_id, 
      startDate, 
      endDate,
      minAmount,
      maxAmount,
      limit
    } = req.query;
    
    let transactions;
    if (transaction_type || buyer_id || seller_id || inventory_id || startDate || endDate || minAmount || maxAmount || limit) {
      // Use filters
      transactions = await Transaction.findWithFilters({
        transaction_type,
        buyer_id,
        seller_id,
        inventory_id,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        limit
      });
    } else {
      // Get all
      transactions = await Transaction.findAll();
    }
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get financial summary
// @route   GET /api/transactions/summary
// @access  Private/Admin
exports.getFinancialSummary = async (req, res) => {
  try {
    const { period } = req.query;
    const summary = await Transaction.getFinancialSummary(period);
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      transaction_type, 
      inventory_id, 
      buyer_id, 
      seller_id, 
      amount, 
      description 
    } = req.body;

    // Create transaction
    const transaction = await Transaction.create({
      transaction_type, 
      inventory_id, 
      buyer_id, 
      seller_id, 
      amount, 
      description
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if transaction exists
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    const { 
      transaction_type, 
      inventory_id, 
      buyer_id, 
      seller_id, 
      amount, 
      description 
    } = req.body;

    // Update transaction
    transaction = await Transaction.update(req.params.id, {
      transaction_type, 
      inventory_id, 
      buyer_id, 
      seller_id, 
      amount, 
      description
    });

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
exports.deleteTransaction = async (req, res) => {
  try {
    // Check if transaction exists
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Delete transaction
    await Transaction.delete(req.params.id);

    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};