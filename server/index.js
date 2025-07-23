const database = require('../server/dbconnector/dbconnector.js');
const mysql = require('mysql2/promise');

const express = require('express');
const cors = require('cors');


const app = express();
const PORT = 4000;

// Create MySQL connection pool
const pool = mysql.createPool(database);

// Database initialization
const initDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: database.host,
      user: database.user,
      password: database.password
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${database.database}`);
    await connection.end();

    // Create products table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        description TEXT,
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if table is empty
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      const sampleProducts = [
        ['Hybrid Tomato Seeds', 25.99, 'https://images.pexels.com/photos/533346/pexels-photo-533346.jpeg?auto=compress&cs=tinysrgb&w=400', 'vegetables', 'High-yield hybrid tomato variety with excellent disease resistance', 50],
        ['Organic Carrot Seeds', 17.99, 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400', 'vegetables', 'Premium organic carrot seeds for sweet, crisp carrots', 75],
        ['Sunflower Seeds', 31.99, 'https://images.pexels.com/photos/36729/sunflower-yellow-flower-macro.jpg?auto=compress&cs=tinysrgb&w=400', 'flowers', 'Giant sunflower variety that grows up to 12 feet tall', 30],
        ['Wheat Seeds', 51.99, 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400', 'grains', 'High-protein winter wheat variety for commercial farming', 100],
        ['Bell Pepper Seeds', 21.99, 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400', 'vegetables', 'Mixed color bell pepper seeds for colorful harvests', 45],
        ['Corn Seeds', 37.99, 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400', 'grains', 'Sweet corn variety perfect for home gardens', 60]
      ];

      for (const product of sampleProducts) {
        await pool.execute(
          'INSERT INTO products (name, price, image, category, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
          product
        );
      }
      console.log('Sample products inserted successfully!');
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Enable CORS for all origins
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Hello, World! - MySQL Connected API');
});

// Test route
app.get('/addcart', (req, res) => {
  res.send('MySQL Database Connected Successfully!');
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json({
      success: true,
      message: "Products retrieved successfully",
      data: rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// Get a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product retrieved successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// Get a single product by Name
app.get('/products2/:name', async (req, res) => {
  try {
    const productName = req.params.name;
    const [rows] = await pool.execute('SELECT * FROM products WHERE name = ?', [productName]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product retrieved successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// Add a new product
app.post('/products', async (req, res) => {
  try {
    const { name, price, image, category, description, stock = 0 } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required"
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, price, image, category, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, parseFloat(price), image || null, category, description || "", stock]
    );

    // Get the inserted product
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message
    });
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, price, image, category, description, stock } = req.body;

    // Check if product exists
    const [existingRows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (price) {
      updates.push('price = ?');
      values.push(parseFloat(price));
    }
    if (image !== undefined) {
      updates.push('image = ?');
      values.push(image);
    }
    if (category) {
      updates.push('category = ?');
      values.push(category);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (stock !== undefined) {
      updates.push('stock = ?');
      values.push(stock);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(productId);
    await pool.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated product
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Get product before deleting
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const deletedProduct = rows[0];
    await pool.execute('DELETE FROM products WHERE id = ?', [productId]);

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
});

// Get products by category
app.get('/products/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY created_at DESC',
      [category]
    );

    res.json({
      success: true,
      message: `Products in ${category} category retrieved successfully`,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by category",
      error: error.message
    });
  }
});

// Search products
app.get('/search/products', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?',
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({
      success: true,
      message: "Search results retrieved successfully",
      data: rows
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message
    });
  }
});

// Get categories
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category, COUNT(*) as product_count FROM products GROUP BY category'
    );

    res.json({
      success: true,
      message: "Categories retrieved successfully",
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
});

// Initialize database and start server
const startServer = async () => {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log('MySQL Database connected successfully!');
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();