const User = require('../models/User');

// Basic authentication middleware (you can enhance this with JWT)
const authenticateUser = async (req, res, next) => {
  try {
    // For demo purposes, we'll use basic authentication
    // In production, you should implement JWT or session-based auth
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// User can only access their own data middleware
const requireOwnershipOrAdmin = (req, res, next) => {
  const requestedUserId = req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Allow if user is admin or accessing their own data
  if (req.user.role === 'admin' || req.user.id.toString() === requestedUserId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  }
};

module.exports = {
  authenticateUser,
  requireAdmin,
  requireOwnershipOrAdmin
};