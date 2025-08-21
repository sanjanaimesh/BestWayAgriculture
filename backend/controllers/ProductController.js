const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      return successResponse(res, "Products retrieved successfully", products);
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return errorResponse(res, "Error fetching products", error.message, 500);
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return errorResponse(res, "Invalid product ID", null, 400);
      }

      const product = await Product.findById(productId);

      if (!product) {
        return errorResponse(res, "Product not found", null, 404);
      }

      return successResponse(res, "Product retrieved successfully", product);
    } catch (error) {
      console.error('Error in getProductById:', error);
      return errorResponse(res, "Error fetching product", error.message, 500);
    }
  }


  static async getAndUpdateStock(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { newStock } = req.body;

    // Validate input
    if (isNaN(productId)) {
      return errorResponse(res, "Invalid product ID", null, 400);
    }

    if (newStock === undefined || newStock < 0) {
      return errorResponse(res, "Valid stock value is required", null, 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, "Product not found", null, 404);
    }

    // Update stock using the static method
    const updatedProduct = await Product.updateStock(productId, parseInt(newStock));
    
    if (!updatedProduct) {
      return errorResponse(res, "Failed to update stock", null, 500);
    }

    return successResponse(res, "Stock updated successfully", updatedProduct);

  } catch (error) {
    console.error("Error in getAndUpdateStock:", error);
    return errorResponse(res, "Error updating stock", error.message, 500);
  }
}

  // Get product by name
  static async getProductByName(req, res) {
    try {
      const productName = req.params.name;
      
      if (!productName || productName.trim() === '') {
        return errorResponse(res, "Product name is required", null, 400);
      }

      const product = await Product.findByName(productName);

      if (!product) {
        return errorResponse(res, "Product not found", null, 404);
      }

      return successResponse(res, "Product retrieved successfully", product);
    } catch (error) {
      console.error('Error in getProductByName:', error);
      return errorResponse(res, "Error fetching product", error.message, 500);
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      const { name, price, image, category, description, stock = 0 } = req.body;

      const productData = {
        name: name?.trim(),
        price: parseFloat(price),
        image: image || null,
        category: category?.trim(),
        description: description?.trim() || "",
        stock: parseInt(stock) || 0
      };

      const product = new Product(productData);
      
      // Validate product data
      const validationErrors = product.validate();
      if (validationErrors.length > 0) {
        return errorResponse(res, "Validation failed", validationErrors, 400);
      }

      const savedProduct = await product.save();
      return successResponse(res, "Product added successfully", savedProduct, 201);

    } catch (error) {
      console.error('Error in createProduct:', error);
      return errorResponse(res, "Error adding product", error.message, 500);
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return errorResponse(res, "Invalid product ID", null, 400);
      }

      const product = await Product.findById(productId);
      if (!product) {
        return errorResponse(res, "Product not found", null, 404);
      }

      // Update product properties
      const { name, price, image, category, description, stock } = req.body;
      
      if (name !== undefined) product.name = name.trim();
      if (price !== undefined) product.price = parseFloat(price);
      if (image !== undefined) product.image = image;
      if (category !== undefined) product.category = category.trim();
      if (description !== undefined) product.description = description.trim();
      if (stock !== undefined) product.stock = parseInt(stock);

      // Validate updated data
      const validationErrors = product.validate();
      if (validationErrors.length > 0) {
        return errorResponse(res, "Validation failed", validationErrors, 400);
      }

      const updatedProduct = await product.update();
      return successResponse(res, "Product updated successfully", updatedProduct);

    } catch (error) {
      console.error('Error in updateProduct:', error);
      return errorResponse(res, "Error updating product", error.message, 500);
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return errorResponse(res, "Invalid product ID", null, 400);
      }

      const deletedProduct = await Product.deleteById(productId);

      if (!deletedProduct) {
        return errorResponse(res, "Product not found", null, 404);
      }

      return successResponse(res, "Product deleted successfully", deletedProduct);

    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return errorResponse(res, "Error deleting product", error.message, 500);
    }
  }

  // Get products by category
  static async getProductsByCategory(req, res) {
    try {
      const category = req.params.category;
      
      if (!category || category.trim() === '') {
        return errorResponse(res, "Category is required", null, 400);
      }

      const products = await Product.findByCategory(category);
      return successResponse(res, `Products in ${category} category retrieved successfully`, products);

    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return errorResponse(res, "Error fetching products by category", error.message, 500);
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim() === '') {
        return errorResponse(res, "Search query is required", null, 400);
      }

      const products = await Product.search(q.trim());
      return successResponse(res, "Search results retrieved successfully", products);

    } catch (error) {
      console.error('Error in searchProducts:', error);
      return errorResponse(res, "Error searching products", error.message, 500);
    }
  }

  // Get all categories
  static async getCategories(req, res) {
    try {
      const categories = await Product.getCategories();
      return successResponse(res, "Categories retrieved successfully", categories);

    } catch (error) {
      console.error('Error in getCategories:', error);
      return errorResponse(res, "Error fetching categories", error.message, 500);
    }
  }
}

module.exports = ProductController;