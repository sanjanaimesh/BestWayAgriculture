const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/OrderController');
const { validateOrder, validateOrderStatus, validateId, sanitizeInput } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandling');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Get all orders
router.get('/', asyncHandler(OrderController.getAllOrders));

// Get order statistics
router.get('/statistics', asyncHandler(OrderController.getOrderStatistics));

// Get orders by status
router.get('/status/:status', asyncHandler(OrderController.getOrdersByStatus));

// Get orders by customer email
router.get('/customer', asyncHandler(OrderController.getOrdersByCustomer));

// Generate order number
router.get('/generate-number', asyncHandler(OrderController.generateOrderNumber));

// Get order by order number
router.get('/number/:orderNumber', asyncHandler(OrderController.getOrderByNumber));

// Get order by ID
router.get('/:id', validateId, asyncHandler(OrderController.getOrderById));

// Create new order
router.post('/', validateOrder, asyncHandler(OrderController.createOrder));

// Update entire order - ADD THIS ROUTE
router.put('/:id', validateId, validateOrder, asyncHandler(OrderController.updateOrder));

// Update order status only
router.put('/:id/status', validateId, validateOrderStatus, asyncHandler(OrderController.updateOrderStatus));

// Delete order - ADD THIS ROUTE IF MISSING
router.delete('/:id', validateId, asyncHandler(OrderController.deleteOrder));

module.exports = router;