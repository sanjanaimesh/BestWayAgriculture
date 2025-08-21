const express = require('express');
const router = express.Router();
const AgentController = require('../controllers/agentController');

// Validation middleware for agent data
const validateAgentData = (req, res, next) => {
  const { name, specialty, experience, email, bio } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!specialty || specialty.trim().length < 2) {
    errors.push('Specialty is required');
  }

  if (!experience || experience.trim().length < 1) {
    errors.push('Experience is required');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!bio || bio.trim().length < 10) {
    errors.push('Bio must be at least 10 characters long');
  }

  if (req.body.rating !== undefined && req.body.rating !== null) {
    const rating = parseFloat(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Middleware to validate agent ID parameter
const validateAgentId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid agent ID is required'
    });
  }
  
  req.params.id = parseInt(id);
  next();
};

// Middleware for request logging
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - Agent API: ${req.method} ${req.originalUrl}`);
  next();
};

// Apply logging middleware to all routes
router.use(logRequest);


// GET /api/agents/statistics - Get agent statistics 
router.get('/statistics', AgentController.getStatistics);

// Get all unique specialties
router.get('/specialties', AgentController.getSpecialties);

//  Get all agents with optional filters
router.get('/', AgentController.getAllAgents);

// Get single agent by ID
router.get('/:id', validateAgentId, AgentController.getAgentById);

// Create new agent
router.post('/', validateAgentData, AgentController.createAgent);

// Update existing agent
router.put('/:id', validateAgentId, validateAgentData, AgentController.updateAgent);

//  Partial update of agent 
router.patch('/:id', validateAgentId, (req, res, next) => {
  
  const errors = [];

  if (req.body.name !== undefined && (!req.body.name || req.body.name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters long');
  }

  if (req.body.email !== undefined && (!req.body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email))) {
    errors.push('Valid email is required');
  }

  if (req.body.rating !== undefined && req.body.rating !== null) {
    const rating = parseFloat(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
}, AgentController.updateAgent);

// PATCH /api/agents/:id/toggle - Toggle agent active status
router.patch('/:id/toggle', validateAgentId, AgentController.toggleAgentStatus);

// Restore soft deleted agent
router.post('/:id/restore', validateAgentId, AgentController.restoreAgent);

// Delete agent 
router.delete('/:id', validateAgentId, AgentController.deleteAgent);

// Health check route specific to agents
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    message: 'Agent API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /api/agents': 'Get all agents',
      'GET /api/agents/:id': 'Get agent by ID',
      'POST /api/agents': 'Create new agent',
      'PUT /api/agents/:id': 'Update agent',
      'PATCH /api/agents/:id': 'Partial update agent',
      'PATCH /api/agents/:id/toggle': 'Toggle agent status',
      'DELETE /api/agents/:id': 'Delete agent',
      'POST /api/agents/:id/restore': 'Restore agent',
      'GET /api/agents/statistics': 'Get statistics',
      'GET /api/agents/specialties': 'Get specialties'
    }
  });
});

// Error handling middleware specific to agent routes
router.use((error, req, res, next) => {
  console.error('Agent Route Error:', error);
  
  // Handle specific database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry: An agent with this email already exists',
      error: 'EMAIL_ALREADY_EXISTS'
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
      error: 'INVALID_REFERENCE'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred in agent management',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

module.exports = router;