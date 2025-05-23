const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', adminMiddleware, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', adminMiddleware, userController.getUserById);

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post(
  '/',
  [
    adminMiddleware,
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role must be either Admin or Employee').isIn(['Admin', 'Employee'])
  ],
  userController.createUser
);

// @route   PUT /api/users/:id
// @desc    Update user - Used by both admins and self-updates
// @access  Private/Admin or Self
router.put(
  '/:id',
  [
    check('first_name', 'First name is required').not().isEmpty(),
    check('last_name', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    // Role validation only applies when provided (for admin updates of other users)
    check('role', 'Role must be either Admin or Employee')
      .optional()
      .isIn(['Admin', 'Employee'])
  ],
  userController.updateUser
);

// @route   PUT /api/users/:id/password
// @desc    Update password
// @access  Private/Admin or Self
router.put(
  '/:id/password',
  [
    check('new_password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  userController.updatePassword
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', adminMiddleware, userController.deleteUser);

module.exports = router;