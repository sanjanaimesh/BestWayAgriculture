const express = require('express');
const router = express.Router();

const productRoutes = require('./products');
const orderRoutes = require('./orders');
const userRoutes = require('./users'); 
const contactRoutes = require('./contact'); 

// API routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes); 
router.use('/contacts', contactRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info route
router.get('/info', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      contacts: '/api/contacts', // Add this line
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Legacy routes for backward compatibility
router.get('/addcart', (req, res) => {
  res.json({
    success: true,
    message: 'MySQL Database Connected Successfully!',
    note: 'This endpoint is deprecated. Use /api/health for health checks.'
  });
});

module.exports = router;