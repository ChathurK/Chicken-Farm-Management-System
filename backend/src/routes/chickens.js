const express = require('express');
const { check } = require('express-validator');
const chickenController = require('../controllers/chickenController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/chickens
// @desc    Get all chickens
// @access  Private
router.get('/', chickenController.getAllChickens);

// @route   GET /api/chickens/:id
// @desc    Get chicken by ID
// @access  Private
router.get('/:id', chickenController.getChickenById);

// @route   POST /api/chickens
// @desc    Create chicken record
// @access  Private
router.post(
  '/',
  [
    check('type', 'Type is required').not().isEmpty(),
    check('breed', 'Breed is required').not().isEmpty(),
    check('quantity', 'Quantity is required').isInt({ min: 1 }),
    // check('acquisition_date', 'Valid acquisition date is required').isDate()
  ],
  chickenController.createChicken
);

// @route   PUT /api/chickens/:id
// @desc    Update chicken record
// @access  Private
router.put(
  "/:id",
  [
    check("type", "Type is required").optional(),
    check("breed", "Breed is required").optional(),
    check("quantity", "Quantity must be a positive number")
      .optional()
      .isInt({ min: 1 }),
    // Use custom validation for the date
    check("acquisition_date", "Valid acquisition date is required")
      .optional()
      .custom((value) => {
        // Accept ISO date strings and convert them
        const date = new Date(value);
        return !isNaN(date.getTime()); // Return true if it's a valid date
      }),
  ],
  chickenController.updateChicken
);

// @route   DELETE /api/chickens/:id
// @desc    Delete chicken record
// @access  Private
router.delete('/:id', chickenController.deleteChicken);

module.exports = router;