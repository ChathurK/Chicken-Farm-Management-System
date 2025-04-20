const express = require('express');
const { check } = require('express-validator');
const chickController = require('../controllers/chickController');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/chicks
// @desc    Get all chicks
// @access  Private
router.get('/', chickController.getAllChicks);

// @route   GET /api/chicks/:id
// @desc    Get chick by ID
// @access  Private
router.get('/:id', chickController.getChickById);

// @route   POST /api/chicks
// @desc    Create chick record
// @access  Private
router.post(
  '/',
  [
    check('parent_breed', 'Parent breed is required').not().isEmpty(),
    check('hatched_date', 'Valid hatched date is required').isDate(),
    check('quantity', 'Quantity is required').isInt({ min: 1 })
  ],
  chickController.createChick
);

// @route   PUT /api/chicks/:id
// @desc    Update chick record
// @access  Private
router.put(
  '/:id',
  [
    check('parent_breed', 'Parent breed is required').optional(),
    check('hatched_date', 'Valid hatched date is required').optional().isDate(),
    check('quantity', 'Quantity must be a positive number').optional().isInt({ min: 1 })
  ],
  chickController.updateChick
);

// @route   DELETE /api/chicks/:id
// @desc    Delete chick record
// @access  Private
router.delete('/:id', chickController.deleteChick);

module.exports = router;