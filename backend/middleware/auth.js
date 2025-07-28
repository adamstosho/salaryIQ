const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized to access this route',
      error: 'No token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        error: 'Invalid token'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'User account is deactivated',
        error: 'Account inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Not authorized to access this route',
      error: 'Invalid token'
    });
  }
};

// Authorize by role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated',
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route`,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user can access their own resource or is admin
const authorizeOwnResource = (resourceIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated',
        error: 'Authentication required'
      });
    }

    const resourceId = req.params[resourceIdField] || req.body[resourceIdField];
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Employee can only access their own resource
    if (req.user._id.toString() === resourceId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Not authorized to access this resource',
      error: 'Insufficient permissions'
    });
  };
};

module.exports = {
  protect,
  authorize,
  authorizeOwnResource
}; 