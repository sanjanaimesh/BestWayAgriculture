const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Middleware for request validation and logging
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - Users API: ${req.method} ${req.path}`);
  next();
};

// Apply request logging to all routes
router.use(requestLogger);

// Public routes (no authentication required)
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/check-username/:username', UserController.checkUsername);
router.get('/check-email/:email', UserController.checkEmail);

// User profile routes
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/:id', UserController.updateProfile);
router.put('/password/:id', UserController.updatePassword);

// Admin routes (in a real application, these would require admin authentication middleware)
router.get('/', UserController.getAllUsers);
router.get('/stats', UserController.getUserStats);
router.delete('/:id', UserController.deactivateUser);
router.put('/restore/:id', UserController.restoreUser);

// Route to initialize database table
router.post('/initialize', async (req, res) => {
  try {
    const User = require('../models/User');
    await User.createTable();
    
    res.json({
      success: true,
      message: 'Users table initialized successfully'
    });
  } catch (error) {
    console.error('Table initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize users table',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Users API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /api/users/register',
      login: 'POST /api/users/login',
      profile: 'GET /api/users/profile/:id',
      updateProfile: 'PUT /api/users/profile/:id',
      updatePassword: 'PUT /api/users/password/:id',
      getAllUsers: 'GET /api/users',
      getUserStats: 'GET /api/users/stats',
      checkUsername: 'GET /api/users/check-username/:username',
      checkEmail: 'GET /api/users/check-email/:email',
      deactivateUser: 'DELETE /api/users/:id',
      restoreUser: 'PUT /api/users/restore/:id',
      initialize: 'POST /api/users/initialize'
    }
  });
});

module.exports = router;