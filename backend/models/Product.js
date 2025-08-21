const { pool } = require('../config/database');

class Product {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.image = data.image;
    this.category = data.category;
    this.description = data.description;
    this.stock = data.stock || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all products
  static async findAll(orderBy = 'created_at DESC') {
    try {
      const [rows] = await pool.execute(`SELECT * FROM products ORDER BY ${orderBy}`);
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
      return rows.length > 0 ? new Product(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching product by ID: ${error.message}`);
    }
  }

  // Get product by name
  static async findByName(name) {
    try {
      const [rows] = await pool.execute('SELECT * FROM products WHERE name = ?', [name]);
      return rows.length > 0 ? new Product(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error fetching product by name: ${error.message}`);
    }
  }

  //select product
  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  }
//stock update
  static async updateStock(id, newStock) {
    await pool.query(
      "UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?",
      [newStock, id]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  }
  // Get products by category
  static async findByCategory(category) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY created_at DESC',
        [category]
      );
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  // Search products
  static async search(query) {
    try {
      const searchTerm = `%${query}%`;
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?',
        [searchTerm, searchTerm, searchTerm]
      );
      return rows.map(row => new Product(row));
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get all categories with product count
  static async getCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category, COUNT(*) as product_count FROM products GROUP BY category'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  // Create new product
  async save() {
    try {
      if (this.id) {
        // Update existing product
        return await this.update();
      } else {
        // Create new product
        const [result] = await pool.execute(
          'INSERT INTO products (name, price, image, category, description, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [this.name, this.price, this.image, this.category, this.description, this.stock]
        );

        this.id = result.insertId;

        // Fetch the complete product data
        const savedProduct = await Product.findById(this.id);
        Object.assign(this, savedProduct);

        return this;
      }
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }

  // Update product
  async update() {
    try {
      if (!this.id) {
        throw new Error('Cannot update product without ID');
      }

      const updates = [];
      const values = [];

      if (this.name) {
        updates.push('name = ?');
        values.push(this.name);
      }
      if (this.price !== undefined) {
        updates.push('price = ?');
        values.push(this.price);
      }
      if (this.image !== undefined) {
        updates.push('image = ?');
        values.push(this.image);
      }
      if (this.category) {
        updates.push('category = ?');
        values.push(this.category);
      }
      if (this.description !== undefined) {
        updates.push('description = ?');
        values.push(this.description);
      }
      if (this.stock !== undefined) {
        updates.push('stock = ?');
        values.push(this.stock);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(this.id);

      await pool.execute(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Fetch updated product data
      const updatedProduct = await Product.findById(this.id);
      Object.assign(this, updatedProduct);

      return this;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product
  async delete() {
    try {
      if (!this.id) {
        throw new Error('Cannot delete product without ID');
      }

      await pool.execute('DELETE FROM products WHERE id = ?', [this.id]);
      return this;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Static method to delete by ID
  static async deleteById(id) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return null;
      }

      await pool.execute('DELETE FROM products WHERE id = ?', [id]);
      return product;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Update stock
  async updateStock(quantity) {
    try {
      if (!this.id) {
        throw new Error('Cannot update stock without product ID');
      }

      await pool.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [quantity, this.id, quantity]
      );

      // Refresh product data
      const updatedProduct = await Product.findById(this.id);
      Object.assign(this, updatedProduct);

      return this;
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  }

  // Validate product data
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (!this.price || this.price <= 0) {
      errors.push('Valid price is required');
    }

    if (!this.category || this.category.trim() === '') {
      errors.push('Category is required');
    }

    if (this.stock < 0) {
      errors.push('Stock cannot be negative');
    }

    return errors;
  }

  // Convert to JSON representation
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      image: this.image,
      category: this.category,
      description: this.description,
      stock: this.stock,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Product;