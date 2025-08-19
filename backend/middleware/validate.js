const { validationErrorResponse } = require('../utils/response');

/**
 * Validate product data
 */
const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push('Valid price is required');
  }

  if (!category || category.trim() === '') {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return validationErrorResponse(res, errors);
  }

  next();
};

/**
 * Validate order data
 */
const validateOrder = (req, res, next) => {
  const { orderNumber, customerInfo, items, total } = req.body;
  const errors = [];

  if (!orderNumber || orderNumber.trim() === '') {
    errors.push('Order number is required');
  }

  if (!customerInfo) {
    errors.push('Customer information is required');
  } else {
    if (!customerInfo.firstName || customerInfo.firstName.trim() === '') {
      errors.push('Customer first name is required');
    }

    if (!customerInfo.lastName || customerInfo.lastName.trim() === '') {
      errors.push('Customer last name is required');
    }

    if (!customerInfo.email || customerInfo.email.trim() === '') {
      errors.push('Customer email is required');
    } else if (!isValidEmail(customerInfo.email)) {
      errors.push('Valid customer email is required');
    }

    if (!customerInfo.address || customerInfo.address.trim() === '') {
      errors.push('Shipping address is required');
    }
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    items.forEach((item, index) => {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        errors.push(`Item ${index + 1} is missing required fields (id, name, price, quantity)`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1} quantity must be greater than 0`);
      }
      if (item.price <= 0) {
        errors.push(`Item ${index + 1} price must be greater than 0`);
      }
    });
  }

  if (!total || isNaN(total) || parseFloat(total) <= 0) {
    errors.push('Valid order total is required');
  }

  if (errors.length > 0) {
    return validationErrorResponse(res, errors);
  }

  next();
};

/**
 * Validate update product data (partial validation)
 */
const validateProductUpdate = (req, res, next) => {
  const { name, price, category, stock } = req.body;
  const errors = [];

  if (name !== undefined && (name.trim() === '')) {
    errors.push('Product name cannot be empty');
  }

  if (price !== undefined && (isNaN(price) || parseFloat(price) <= 0)) {
    errors.push('Valid price is required');
  }

  if (category !== undefined && (category.trim() === '')) {
    errors.push('Category cannot be empty');
  }

  if (stock !== undefined && (isNaN(stock) || parseInt(stock) < 0)) {
    errors.push('Stock cannot be negative');
  }

  if (errors.length > 0) {
    return validationErrorResponse(res, errors);
  }

  next();
};

/**
 * Validate order status update
 */
const validateOrderStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!status || status.trim() === '') {
    errors.push('Status is required');
  } else if (!validStatuses.includes(status.toLowerCase())) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return validationErrorResponse(res, errors);
  }

  next();
};

/**
 * Validate request parameters
 */
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return validationErrorResponse(res, ['Invalid ID parameter']);
  }

  next();
};

/**
 * Validate search query
 */
const validateSearchQuery = (req, res, next) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return validationErrorResponse(res, ['Search query is required']);
  }

  if (q.length < 2) {
    return validationErrorResponse(res, ['Search query must be at least 2 characters long']);
  }

  next();
};

/**
 * Email validation helper
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitize(req.body);
  }

  if (req.query) {
    sanitize(req.query);
  }

  next();
};

module.exports = {
  validateProduct,
  validateOrder,
  validateProductUpdate,
  validateOrderStatus,
  validateId,
  validateSearchQuery,
  sanitizeInput,
  isValidEmail
};