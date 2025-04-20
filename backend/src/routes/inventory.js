const express = require('express');
const { check } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', inventoryController.getAllInventory);

// @route   GET /api/inventory/:id
// @desc    Get inventory item by ID
// @access  Private
router.get('/:id', inventoryController.getInventoryById);

// @route   GET /api/inventory/category/:category
// @desc    Get inventory items by category
// @access  Private
router.get('/category/:category', inventoryController.getInventoryByCategory);

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post(
  '/',
  [
    check('category', 'Category is required').not().isEmpty(),
    check('category', 'Category must be one of: Feed, Medication, Supplies, Other')
      .isIn(['Feed', 'Medication', 'Supplies', 'Other']),
    check('item_name', 'Item name is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').isNumeric(),
    check('unit', 'Unit is required').not().isEmpty()
  ],
  inventoryController.createInventory
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put(
  '/:id',
  [
    check('category', 'Category must be one of: Feed, Medication, Supplies, Other')
      .optional()
      .isIn(['Feed', 'Medication', 'Supplies', 'Other']),
    check('quantity', 'Quantity must be a number')
      .optional()
      .isNumeric()
  ],
  inventoryController.updateInventory
);

// @route   PATCH /api/inventory/:id/status
// @desc    Update inventory status
// @access  Private
router.patch(
  '/:id/status',
  [
    check('status', 'Status must be one of: Available, Low, Finished, Expired')
      .isIn(['Available', 'Low', 'Finished', 'Expired'])
  ],
  inventoryController.updateInventoryStatus
);

// @route   PATCH /api/inventory/:id/quantity
// @desc    Update inventory quantity
// @access  Private
router.patch(
  '/:id/quantity',
  [
    check('quantity', 'Quantity must be a number').isNumeric()
  ],
  inventoryController.updateInventoryQuantity
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private/Admin
router.delete('/:id', adminMiddleware, inventoryController.deleteInventory);

module.exports = router;