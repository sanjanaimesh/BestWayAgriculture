const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/ProductController');
const { validateProduct, validateProductUpdate, validateId, validateSearchQuery, sanitizeInput } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandling');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Get all products
router.get('/', asyncHandler(ProductController.getAllProducts));

// Get all categories
router.get('/categories', asyncHandler(ProductController.getCategories));

// Search products (must be before /:id route)
router.get('/search', validateSearchQuery, asyncHandler(ProductController.searchProducts));

// Get products by category (must be before /:id route)
router.get('/category/:category', asyncHandler(ProductController.getProductsByCategory));

// Get product by ID
router.get('/:id', validateId, asyncHandler(ProductController.getProductById));

// Get product by name (alternative endpoint)
router.get('/name/:name', asyncHandler(ProductController.getProductByName));

// Create new product
router.post('/', validateProduct, asyncHandler(ProductController.createProduct));

// Update product
router.put('/:id', validateId, validateProductUpdate, asyncHandler(ProductController.updateProduct));

// Delete product
router.delete('/:id', validateId, asyncHandler(ProductController.deleteProduct));

router.put('/:id/stock',asyncHandler(ProductController.getAndUpdateStock));

module.exports = router;