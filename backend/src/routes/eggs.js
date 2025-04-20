const express = require('express');
const { check } = require('express-validator');
const eggController = require('../controllers/eggController');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/eggs
// @desc    Get all eggs
// @access  Private
router.get('/', eggController.getAllEggs);

// @route   GET /api/eggs/:id
// @desc    Get egg by ID
// @access  Private
router.get('/:id', eggController.getEggById);

// @route   POST /api/eggs
// @desc    Create egg record
// @access  Private
router.post(
  '/',
  [
    check('laid_date', 'Valid laid date is required').isDate(),
    check('expiration_date', 'Valid expiration date is required').isDate(),
    check('quantity', 'Quantity is required').isInt({ min: 1 }),
    check('size', 'Size is required').isIn(['Small', 'Medium', 'Large', 'Extra Large']),
    check('color', 'Color is required').isIn(['White', 'Brown', 'Other'])
  ],
  eggController.createEgg
);

// @route   PUT /api/eggs/:id
// @desc    Update egg record
// @access  Private
router.put(
  '/:id',
  [
    check('laid_date', 'Valid laid date is required').optional().isDate(),
    check('expiration_date', 'Valid expiration date is required').optional().isDate(),
    check('quantity', 'Quantity must be a positive number').optional().isInt({ min: 1 }),
    check('size', 'Invalid size').optional().isIn(['Small', 'Medium', 'Large', 'Extra Large']),
    check('color', 'Invalid color').optional().isIn(['White', 'Brown', 'Other'])
  ],
  eggController.updateEgg
);

// @route   DELETE /api/eggs/:id
// @desc    Delete egg record
// @access  Private
router.delete('/:id', eggController.deleteEgg);

module.exports = router;