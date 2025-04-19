const Order = require('../models/Order');
const Buyer = require('../models/Buyer');
const Inventory = require('../models/Inventory');
const { validationResult } = require('express-validator');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
  try {
    // Check if filters are provided
    const { status, startDate, endDate, buyer_id } = req.query;
    
    let orders;
    if (status || startDate || endDate || buyer_id) {
      // Use filters
      orders = await Order.findWithFilters({
        status,
        startDate,
        endDate,
        buyer_id
      });
    } else {
      // Get all
      orders = await Order.findAll();
    }
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get order items
// @route   GET /api/orders/:id/items
// @access  Private
exports.getOrderItems = async (req, res) => {
  try {
    // Check if order exists
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    const orderItems = await Order.getOrderItems(req.params.id);
    res.json(orderItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { buyer_id, deadline_date, status } = req.body;

    // Check if buyer exists
    const buyer = await Buyer.findById(buyer_id);
    if (!buyer) {
      return res.status(404).json({ msg: 'Buyer not found' });
    }

    // Create order
    const order = await Order.create({
      buyer_id,
      deadline_date,
      status: status || 'Ongoing'
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if order exists
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const { buyer_id, deadline_date, status } = req.body;

    // Check if buyer exists
    if (buyer_id) {
      const buyer = await Buyer.findById(buyer_id);
      if (!buyer) {
        return res.status(404).json({ msg: 'Buyer not found' });
      }
    }

    // Update order
    order = await Order.update(req.params.id, {
      buyer_id,
      deadline_date,
      status
    });

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if order exists
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const { status } = req.body;

    // Update status
    order = await Order.updateStatus(req.params.id, status);

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add item to order
// @route   POST /api/orders/:id/items
// @access  Private
exports.addOrderItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if order exists
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const { inventory_id, quantity, unit_price } = req.body;

    // Check if inventory item exists
    const inventory = await Inventory.findById(inventory_id);
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory item not found' });
    }

    // Check if enough quantity is available
    if (inventory.quantity < quantity) {
      return res.status(400).json({ msg: 'Not enough quantity in stock' });
    }

    // Add order item
    const orderItem = await Order.addOrderItem({
      order_id: req.params.id,
      inventory_id,
      quantity,
      unit_price,
      total_price: quantity * unit_price
    });

    // Update inventory quantity
    await Inventory.updateQuantity(inventory_id, inventory.quantity - quantity);

    res.status(201).json(orderItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order item
// @route   PUT /api/orders/:orderId/items/:itemId
// @access  Private
exports.updateOrderItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, unit_price } = req.body;
    const { orderId, itemId } = req.params;

    // TODO: Add logic to check current quantity vs. new quantity
    // and update inventory accordingly

    // Update order item
    const orderItem = await Order.updateOrderItem(itemId, {
      quantity,
      unit_price,
      total_price: quantity * unit_price
    });

    res.json(orderItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Remove item from order
// @route   DELETE /api/orders/:orderId/items/:itemId
// @access  Private
exports.removeOrderItem = async (req, res) => {
  try {
    // TODO: Add logic to restore inventory quantity

    // Remove order item
    await Order.removeOrderItem(req.params.itemId);

    res.json({ msg: 'Order item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    // Check if order exists
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // TODO: Add logic to restore inventory quantities for all items

    // Delete order (this will also delete order items due to cascade delete)
    await Order.delete(req.params.id);

    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};