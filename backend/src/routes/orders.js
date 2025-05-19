const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', orderController.getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', orderController.getOrderById);

// @route   GET /api/orders/:id/items
// @desc    Get order items
// @access  Private
router.get('/:id/items', orderController.getOrderItems);

// @route   GET /api/orders/:id/items/:itemId
// @desc    Get order item by ID
// @access  Private
router.get('/:id/items/:itemId', orderController.getOrderItemById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post(
  '/',
  [
    check('buyer_id', 'Buyer ID is required').not().isEmpty().isNumeric(),
    check('deadline_date', 'Valid deadline date is required').optional().isDate()
  ],
  orderController.createOrder
);

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private
router.put(
  '/:id',
  [
    check('buyer_id', 'Buyer ID must be a number').optional().isNumeric(),
    check('deadline_date', 'Valid deadline date is required').optional().isDate(),
    check('status', 'Status must be one of: Ongoing, Completed, Cancelled')
      .optional().isIn(['Ongoing', 'Completed', 'Cancelled'])
  ],
  orderController.updateOrder
);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch(
  '/:id/status',
  [
    check('status', 'Status must be one of: Ongoing, Completed, Cancelled')
      .isIn(['Ongoing', 'Completed', 'Cancelled'])
  ],
  orderController.updateOrderStatus
);

// @route   POST /api/orders/:id/items
// @desc    Add item to order
// @access  Private
router.post(
  '/:id/items',
  [
    check('product_type', 'Product type is required').not().isEmpty().isIn(['Chicken', 'Chick', 'Egg']),
    check('quantity', 'Quantity must be a positive number').isNumeric().toFloat().custom(value => value > 0),
    check('unit_price', 'Unit price must be a positive number').isNumeric().toFloat().custom(value => value > 0),
    check('total_price', 'Total price must be a positive number').isNumeric().toFloat().custom(value => value > 0),
    check('notes', 'Notes must be a string').optional().isString(),
    check('chicken_record_id', 'Chicken record ID must be a number').optional().isNumeric(),
    check('chick_record_id', 'Chick record ID must be a number').optional().isNumeric(),
    check('egg_record_id', 'Egg record ID must be a number').optional().isNumeric()
  ],
  orderController.addOrderItem
);

// @route   PUT /api/orders/:orderId/items/:itemId
// @desc    Update order item
// @access  Private
router.put(
  '/:orderId/items/:itemId',
  [
    check('quantity', 'Quantity must be a positive number').isNumeric().toFloat().custom(value => value > 0),
    check('unit_price', 'Unit price must be a positive number').isNumeric().toFloat().custom(value => value > 0),
    check('notes', 'Notes must be a string').optional().isString()
  ],
  orderController.updateOrderItem
);

// @route   DELETE /api/orders/:orderId/items/:itemId
// @desc    Remove item from order
// @access  Private
router.delete('/:orderId/items/:itemId', orderController.removeOrderItem);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', adminMiddleware, orderController.deleteOrder);

module.exports = router;