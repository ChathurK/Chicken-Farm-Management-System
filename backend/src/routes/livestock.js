const express = require('express');
const { check } = require('express-validator');
const livestockController = require('../controllers/livestockController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/livestock
// @desc    Get all livestock
// @access  Private
router.get('/', livestockController.getAllLivestock);

// @route   GET /api/livestock/:id
// @desc    Get livestock by ID
// @access  Private
router.get('/:id', livestockController.getLivestockById);

// @route   POST /api/livestock
// @desc    Create livestock
// @access  Private
router.post(
  '/',
  [
    check('type', 'Type is required').not().isEmpty(),
    check('total_quantity', 'Total quantity is required').isInt({ min: 1 }),
    check('status', 'Status is required').not().isEmpty()
  ],
  livestockController.createLivestock
);

// @route   PUT /api/livestock/:id
// @desc    Update livestock
// @access  Private
router.put(
  '/:id',
  [
    check('type', 'Type is required').not().isEmpty(),
    check('total_quantity', 'Total quantity is required').isInt({ min: 1 }),
    check('status', 'Status is required').not().isEmpty()
  ],
  livestockController.updateLivestock
);

// @route   DELETE /api/livestock/:id
// @desc    Delete livestock
// @access  Private
router.delete('/:id', livestockController.deleteLivestock);

module.exports = router;