const { pool } = require('../config/database');

class Order {
  constructor(data = {}) {
    this.id = data.id;
    this.order_number = data.order_number;
    this.customer_first_name = data.customer_first_name;
    this.customer_last_name = data.customer_last_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    this.shipping_address = data.shipping_address;
    this.shipping_city = data.shipping_city;
    this.shipping_postal_code = data.shipping_postal_code;
    this.shipping_province = data.shipping_province;
    this.subtotal = parseFloat(data.subtotal) || 0;
    this.shipping_cost = parseFloat(data.shipping_cost) || 0;
    this.total = parseFloat(data.total) || 0;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.items = Array.isArray(data.items) ? data.items : [];
    
    // Auto-calculate totals if items are provided but totals are 0
    if (this.items.length > 0 && this.subtotal === 0) {
      const calculated = this.calculateTotals();
      this.subtotal = calculated.subtotal;
      this.total = calculated.total;
    }
  }

  // Get all orders with item count
  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT o.*, 
               COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
      return rows.map(row => new Order(row));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }

  // Get order by ID with items
  static async findById(id) {
    try {
      // Validate ID
      if (!id || (typeof id === 'string' && isNaN(parseInt(id)))) {
        return null;
      }

      const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
      
      if (orderRows.length === 0) {
        return null;
      }

      const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
      
      const orderData = { ...orderRows[0], items: itemRows };
      return new Order(orderData);
    } catch (error) {
      console.error('Error in findById:', error);
      throw new Error(`Error fetching order by ID: ${error.message}`);
    }
  }

  // Get order by order number with items
  static async findByOrderNumber(orderNumber) {
    try {
      if (!orderNumber || orderNumber.trim() === '') {
        return null;
      }

      const [orderRows] = await pool.execute('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
      
      if (orderRows.length === 0) {
        return null;
      }

      const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [orderRows[0].id]);
      
      const orderData = { ...orderRows[0], items: itemRows };
      return new Order(orderData);
    } catch (error) {
      console.error('Error in findByOrderNumber:', error);
      throw new Error(`Error fetching order by number: ${error.message}`);
    }
  }

  // Create new order with transaction
  async save() {
    const connection = await pool.getConnection();
    
    try {
      // Generate order number if not provided
      if (!this.order_number) {
        this.order_number = Order.generateOrderNumber();
      }

      // Validate before saving
      const validationErrors = this.validate();
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      await connection.beginTransaction();

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
        this.order_number,
        this.customer_first_name,
        this.customer_last_name,
        this.customer_email,
        this.customer_phone || '',
        this.shipping_address,
        this.shipping_city || '',
        this.shipping_postal_code || '',
        this.shipping_province || '',
        this.subtotal,
        this.shipping_cost,
        this.total,
        this.status
      ]);

      this.id = orderResult.insertId;

      // Insert order items
      for (const item of this.items) {
        const productId = item.id || item.product_id;
        const productName = item.name || item.product_name;
        const quantity = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price) || 0;

        if (!productId || !productName || quantity <= 0 || price <= 0) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }

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
          this.id,
          productId,
          productName,
          quantity,
          price,
          price * quantity
        ]);

        // Update product stock (with stock check)
        const [stockResult] = await connection.execute(`
          UPDATE products 
          SET stock = stock - ? 
          WHERE id = ? AND stock >= ?
        `, [quantity, productId, quantity]);

        if (stockResult.affectedRows === 0) {
          // Check if product exists or insufficient stock
          const [productCheck] = await connection.execute('SELECT stock FROM products WHERE id = ?', [productId]);
          if (productCheck.length === 0) {
            throw new Error(`Product with ID ${productId} not found`);
          } else {
            throw new Error(`Insufficient stock for product ID ${productId}. Available: ${productCheck[0].stock}, Required: ${quantity}`);
          }
        }
      }

      await connection.commit();

      // Fetch the complete order with items
      const savedOrder = await Order.findById(this.id);
      if (savedOrder) {
        Object.assign(this, savedOrder);
      }

      return this;

    } catch (error) {
      await connection.rollback();
      console.error('Error in save:', error);
      throw new Error(`Error creating order: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update existing order with transaction
  async update() {
    const connection = await pool.getConnection();
    
    try {
      if (!this.id) {
        throw new Error('Cannot update order without ID');
      }

      // Validate before updating
      const validationErrors = this.validate();
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      await connection.beginTransaction();

      // Check if order exists
      const [existingOrder] = await connection.execute('SELECT id FROM orders WHERE id = ?', [this.id]);
      if (existingOrder.length === 0) {
        throw new Error('Order not found');
      }

      // Update main order record
      const [orderResult] = await connection.execute(`
        UPDATE orders SET
          order_number = ?,
          customer_first_name = ?, 
          customer_last_name = ?, 
          customer_email = ?, 
          customer_phone = ?,
          shipping_address = ?,
          shipping_city = ?,
          shipping_postal_code = ?,
          shipping_province = ?,
          subtotal = ?,
          shipping_cost = ?,
          total = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        this.order_number,
        this.customer_first_name,
        this.customer_last_name,
        this.customer_email,
        this.customer_phone || '',
        this.shipping_address,
        this.shipping_city || '',
        this.shipping_postal_code || '',
        this.shipping_province || '',
        this.subtotal,
        this.shipping_cost,
        this.total,
        this.status,
        this.id
      ]);

      // Delete existing order items
      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [this.id]);

      // Insert updated order items
      for (const item of this.items) {
        const productId = item.id || item.product_id;
        const productName = item.name || item.product_name;
        const quantity = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price) || 0;

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
          this.id,
          productId,
          productName,
          quantity,
          price,
          price * quantity
        ]);
      }

      await connection.commit();

      // Fetch the complete updated order with items
      const updatedOrder = await Order.findById(this.id);
      if (updatedOrder) {
        Object.assign(this, updatedOrder);
      }

      return this;

    } catch (error) {
      await connection.rollback();
      console.error('Error in update:', error);
      throw new Error(`Error updating order: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete order with transaction (instance method)
  async delete() {
    const connection = await pool.getConnection();
    
    try {
      if (!this.id) {
        throw new Error('Cannot delete order without ID');
      }

      await connection.beginTransaction();

      // First, restore product stock for each item
      const [itemRows] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?', 
        [this.id]
      );

      for (const item of itemRows) {
        if (item.product_id) {
          await connection.execute(`
            UPDATE products 
            SET stock = stock + ? 
            WHERE id = ?
          `, [item.quantity, item.product_id]);
        }
      }

      // Delete order items first (foreign key constraint)
      await connection.execute('DELETE FROM order_items WHERE order_id = ?', [this.id]);

      // Delete the main order record
      const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [this.id]);

      if (result.affectedRows === 0) {
        throw new Error('Order not found or already deleted');
      }

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      console.error('Error in delete:', error);
      throw new Error(`Error deleting order: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete order by ID (static method)
  static async deleteById(id) {
    try {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      
      return await order.delete();
    } catch (error) {
      console.error('Error in deleteById:', error);
      throw new Error(`Error deleting order by ID: ${error.message}`);
    }
  }

  // Update order status
  async updateStatus(newStatus) {
    try {
      if (!this.id) {
        throw new Error('Cannot update status without order ID');
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const [result] = await pool.execute(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, this.id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Order not found');
      }

      this.status = newStatus;
      return this;

    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Get orders by customer email
  static async findByCustomerEmail(email) {
    try {
      if (!email || email.trim() === '') {
        return [];
      }

      const [rows] = await pool.execute(
        'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
        [email]
      );
      return rows.map(row => new Order(row));
    } catch (error) {
      console.error('Error in findByCustomerEmail:', error);
      throw new Error(`Error fetching orders by customer email: ${error.message}`);
    }
  }

  // Get orders by status
  static async findByStatus(status) {
    try {
      if (!status || status.trim() === '') {
        return [];
      }

      const [rows] = await pool.execute(
        'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC',
        [status]
      );
      return rows.map(row => new Order(row));
    } catch (error) {
      console.error('Error in findByStatus:', error);
      throw new Error(`Error fetching orders by status: ${error.message}`);
    }
  }

  // Calculate totals
  calculateTotals() {
    if (!this.items || this.items.length === 0) {
      return { subtotal: 0, total: 0 };
    }

    const subtotal = this.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    const total = subtotal + (this.shipping_cost || 0);

    return { subtotal: parseFloat(subtotal.toFixed(2)), total: parseFloat(total.toFixed(2)) };
  }

  // Enhanced validation with detailed error messages
  validate() {
    const errors = [];

    // Order number validation
    if (!this.order_number || typeof this.order_number !== 'string' || this.order_number.trim() === '') {
      errors.push('Order number is required');
    }

    // Customer information validation
    if (!this.customer_first_name || typeof this.customer_first_name !== 'string' || this.customer_first_name.trim() === '') {
      errors.push('Customer first name is required');
    }

    if (!this.customer_last_name || typeof this.customer_last_name !== 'string' || this.customer_last_name.trim() === '') {
      errors.push('Customer last name is required');
    }

    if (!this.customer_email || typeof this.customer_email !== 'string' || this.customer_email.trim() === '') {
      errors.push('Customer email is required');
    } else if (!this.isValidEmail(this.customer_email)) {
      errors.push('Valid customer email is required');
    }

    // Shipping address validation
    if (!this.shipping_address || typeof this.shipping_address !== 'string' || this.shipping_address.trim() === '') {
      errors.push('Shipping address is required');
    }

    // Items validation
    if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
      errors.push('Order must contain at least one item');
    } else {
      // Validate each item
      this.items.forEach((item, index) => {
        const productId = item.id || item.product_id;
        const productName = item.name || item.product_name;
        const quantity = parseInt(item.quantity);
        const price = parseFloat(item.price);

        if (!productId) {
          errors.push(`Item ${index + 1}: Product ID is required`);
        }
        if (!productName || productName.trim() === '') {
          errors.push(`Item ${index + 1}: Product name is required`);
        }
        if (isNaN(quantity) || quantity <= 0) {
          errors.push(`Item ${index + 1}: Valid quantity is required (must be greater than 0)`);
        }
        if (isNaN(price) || price <= 0) {
          errors.push(`Item ${index + 1}: Valid price is required (must be greater than 0)`);
        }
      });
    }

    // Total validation
    const calculatedTotals = this.calculateTotals();
    if (calculatedTotals.total <= 0) {
      errors.push('Order total must be greater than 0');
    }

    // Status validation
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return errors;
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Generate order number
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // Get order statistics
  static async getStatistics() {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(total), 0) as average_order_value,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Error in getStatistics:', error);
      throw new Error(`Error fetching order statistics: ${error.message}`);
    }
  }

  // Convert to JSON representation
  toJSON() {
    return {
      id: this.id,
      order_number: this.order_number,
      customer_first_name: this.customer_first_name,
      customer_last_name: this.customer_last_name,
      customer_email: this.customer_email,
      customer_phone: this.customer_phone,
      shipping_address: this.shipping_address,
      shipping_city: this.shipping_city,
      shipping_postal_code: this.shipping_postal_code,
      shipping_province: this.shipping_province,
      subtotal: this.subtotal,
      shipping_cost: this.shipping_cost,
      total: this.total,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      items: this.items
    };
  }
}

module.exports = Order;