const database = require('../server/dbconnector/dbconnector.js');
const mysql = require('mysql2/promise');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Create MySQL connection pool
const pool = mysql.createPool(database);

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

// ==================== PRODUCTS ROUTES ====================

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

// ==================== ORDERS ROUTES ====================

// Create a new order
app.post('/orders', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      orderNumber,
      customerInfo,
      items,
      subtotal,
      shipping,
      total,
      status = 'pending'
    } = req.body;

    // Validate required fields
    if (!orderNumber || !customerInfo || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order number, customer info, and items are required"
      });
    }

    // Insert main order record
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        order_number, 
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_province,
        subtotal,
        shipping_cost,
        total,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      customerInfo.firstName,
      customerInfo.lastName,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.address,
      customerInfo.city,
      customerInfo.postalCode,
      customerInfo.province,
      subtotal,
      shipping,
      total,
      status
    ]);

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await connection.execute(`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          price,
          total_price
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity
      ]);

      // Optional: Update product stock
      await connection.execute(`
        UPDATE products 
        SET stock = stock - ? 
        WHERE id = ? AND stock >= ?
      `, [item.quantity, item.id, item.quantity]);
    }

    await connection.commit();

    // Get the complete order with items
    const [orderRows] = await connection.execute(`
      SELECT o.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'product_id', oi.product_id,
                 'product_name', oi.product_name,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'total_price', oi.total_price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [orderId]);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        ...orderRows[0],
        items: orderRows[0].items ? JSON.parse(`[${orderRows[0].items}]`) : []
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, 
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      message: "Orders retrieved successfully",
      data: rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
});

// Get a specific order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const [orderRows] = await pool.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const [itemRows] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderId]);

    res.json({
      success: true,
      message: "Order retrieved successfully",
      data: {
        ...orderRows[0],
        items: itemRows
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
});

// Get order by order number
app.get('/orders/number/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;

    const [orderRows] = await pool.execute(`
      SELECT * FROM orders WHERE order_number = ?
    `, [orderNumber]);

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const [itemRows] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderRows[0].id]);

    res.json({
      success: true,
      message: "Order retrieved successfully",
      data: {
        ...orderRows[0],
        items: itemRows
      }
    });
  } catch (error) {
    console.error('Error fetching order by number:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
});

// Update order status
app.put('/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const [result] = await pool.execute(`
      UPDATE orders SET status = ? WHERE id = ?
    `, [status, orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const [orderRows] = await pool.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: orderRows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
});

// Initialize database and start server
const startServer = async () => {
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