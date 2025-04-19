const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  updatePassword, 
  deleteUser 
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', adminMiddleware, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', adminMiddleware, getUserById);

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post(
  '/',
  [
    adminMiddleware,
    check('full_name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either Admin or Employee').isIn(['Admin', 'Employee'])
  ],
  createUser
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put(
  '/:id',
  [
    adminMiddleware,
    check('full_name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('role', 'Role must be either Admin or Employee').isIn(['Admin', 'Employee'])
  ],
  updateUser
);

// @route   PUT /api/users/:id/password
// @desc    Update password
// @access  Private/Admin or Self
router.put(
  '/:id/password',
  [
    check('new_password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  updatePassword
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', adminMiddleware, deleteUser);

module.exports = router;