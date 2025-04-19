// src/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate user with JWT
exports.authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is an admin
exports.adminMiddleware = (req, res, next) => {
  // First verify that user is authenticated
  exports.authMiddleware(req, res, () => {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required' });
    }
    next();
  });
};