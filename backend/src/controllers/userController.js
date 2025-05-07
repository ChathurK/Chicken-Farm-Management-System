const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create user
    user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Self (for own profile)
exports.updateUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check permissions - users can only update their own profile, admins can update any
    const isSelfUpdate = req.user.id === parseInt(req.params.id);
    const isAdmin = req.user.role === 'Admin';
    
    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to update this user' });
    }

    const { first_name, last_name, email, role } = req.body;

    // For self-updates, don't allow role changes
    // For admin updates, allow role changes
    let updateData = {
      first_name,
      last_name,
      email
    };

    // Only include role for admin updates of other users
    if (isAdmin && !isSelfUpdate && role) {
      updateData.role = role;
    }

    // Update user
    user = await User.update(req.params.id, updateData);

    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    // Check for duplicate entry errors from MySQL
    if (err.message && err.message.includes('Duplicate entry') && err.message.includes('email')) {
      return res.status(400).json({ msg: 'Email address is already in use by another account' });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update password
// @route   PUT /api/users/:id/password
// @access  Private/Admin or Self
exports.updatePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Only admin or the user themselves can update password
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { new_password } = req.body;

    // Update password
    await User.updatePassword(req.params.id, new_password);

    res.json({ msg: 'Password updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Delete user
    await User.delete(req.params.id);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};