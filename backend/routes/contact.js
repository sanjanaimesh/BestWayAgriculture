const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Input validation middleware
const validateContactInput = (req, res, next) => {
  const { name, email, message } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be a valid string'
    });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Email is required and must be a valid string'
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message is required and must be a valid string'
    });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.message = message.trim();
  
  if (req.body.phone) {
    req.body.phone = req.body.phone.trim();
  }

  next();
};

// Rate limiting middleware (simple in-memory implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max requests per window

const rateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = rateLimitMap.get(clientIP);
  
  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many contact requests. Please try again in 15 minutes.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
};

// Routes
// POST /api/contacts - Create new contact
router.post('/', rateLimiter, validateContactInput, contactController.createContact);

// GET /api/contacts - Get all contacts (admin endpoint)
router.get('/', contactController.getAllContacts);

// GET /api/contacts/stats - Get contact statistics
router.get('/stats', contactController.getContactStats);

// GET /api/contacts/:id - Get single contact by ID
router.get('/:id', contactController.getContactById);

// PUT /api/contacts/:id/status - Update contact status
router.put('/:id/status', contactController.updateContactStatus);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', contactController.deleteContact);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Contact route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in contact routes',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;