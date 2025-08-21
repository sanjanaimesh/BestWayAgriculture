const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandling');

// Middleware for request validation and logging
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - Users API: ${req.method} ${req.path}`);
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  next();
};

// Apply request logging to all routes
router.use(requestLogger);

// Public routes (no authentication required)
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/check-username/:username', UserController.checkUsername);
router.get('/check-email/:email', UserController.checkEmail);

// User profile routes - FIXED: Correct order and paths
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/:id', UserController.updateProfile);

// Alternative route format that matches frontend expectation
router.get('/:id', UserController.getProfile);
router.put('/:id', UserController.updateProfile);

// Password update route - FIXED: Consistent with profile routes
router.put('/:id/password', UserController.updatePassword);
router.put('/password/:id', UserController.updatePassword); // Keep both for compatibility

// Admin routes (in a real application, these would require admin authentication middleware)
router.get('/', UserController.getAllUsers);
router.get('/stats', UserController.getUserStats);
router.delete('/:id', UserController.deactivateUser);
router.put('/restore/:id', UserController.restoreUser);

router.put("/:id/role",asyncHandler(UserController.updateUserRole));


// Route to initialize database table
router.post('/initialize', async (req, res) => {
  try {
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
      profile: 'GET /api/users/:id',
      updateProfile: 'PUT /api/users/:id',
      updatePassword: 'PUT /api/users/:id/password',
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