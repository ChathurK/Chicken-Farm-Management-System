const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllInventory, 
  getInventoryById, 
  getInventoryByCategory,
  createInventory, 
  updateInventory, 
  updateInventoryStatus,
  updateInventoryQuantity,
  deleteInventory 
} = require('../controllers/inventoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', getAllInventory);

// @route   GET /api/inventory/:id
// @desc    Get inventory item by ID
// @access  Private
router.get('/:id', getInventoryById);

// @route   GET /api/inventory/category/:category
// @desc    Get inventory items by category
// @access  Private
router.get('/category/:category', getInventoryByCategory);

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post(
  '/',
  [
    check('category', 'Category is required').not().isEmpty(),
    check('category', 'Category must be one of: Eggs, Chicks, Chickens, Feed, Medication, Supplies')
      .isIn(['Eggs', 'Chicks', 'Chickens', 'Feed', 'Medication', 'Supplies']),
    check('item_name', 'Item name is required').not().isEmpty(),
    check('batch_number', 'Batch number is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').isNumeric()
  ],
  createInventory
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put(
  '/:id',
  [
    check('category', 'Category must be one of: Eggs, Chicks, Chickens, Feed, Medication, Supplies')
      .isIn(['Eggs', 'Chicks', 'Chickens', 'Feed', 'Medication', 'Supplies']),
    check('item_name', 'Item name is required').not().isEmpty(),
    check('batch_number', 'Batch number is required').not().isEmpty(),
    check('quantity', 'Quantity must be a number').isNumeric()
  ],
  updateInventory
);

// @route   PATCH /api/inventory/:id/status
// @desc    Update inventory status
// @access  Private
router.patch(
  '/:id/status',
  [
    check('status', 'Status must be one of: Available, Expired, Damaged')
      .isIn(['Available', 'Expired', 'Damaged'])
  ],
  updateInventoryStatus
);

// @route   PATCH /api/inventory/:id/quantity
// @desc    Update inventory quantity
// @access  Private
router.patch(
  '/:id/quantity',
  [
    check('quantity', 'Quantity must be a number').isNumeric()
  ],
  updateInventoryQuantity
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private/Admin
router.delete('/:id', adminMiddleware, deleteInventory);

module.exports = router;