const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.email = userData.email;
    this.mobile = userData.mobile;
    this.province = userData.province;
    this.username = userData.username;
    this.password = userData.password;
    this.role = userData.role || 'user';
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }

  // Create users table if not exists
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        province VARCHAR(50) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      )
    `;

    try {
      await pool.execute(createTableQuery);
      console.log('✓ Users table ready');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  // Hash password
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate Sri Lankan mobile number
  static validateMobile(mobile) {
    const mobileRegex = /^(\+94|0)?[7-9]\d{8}$/;
    return mobileRegex.test(mobile);
  }

  // Create new user
  static async create(userData) {
    const { firstName, lastName, email, mobile, province, username, password, role = 'user' } = userData;

    // Validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || 
        !mobile?.trim() || !province?.trim() || !username?.trim() || !password?.trim()) {
      throw new Error('All fields are required');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!this.validateMobile(mobile)) {
      throw new Error('Invalid mobile number format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    try {
      // Check if email or username already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUsers.length > 0) {
        throw new Error('Email or username already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Insert new user
      const [result] = await pool.execute(
        `INSERT INTO users (firstName, lastName, email, mobile, province, username, password, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, mobile, province, username, hashedPassword, role]
      );

      // Get the created user
      const [newUser] = await pool.execute(
        'SELECT id, firstName, lastName, email, mobile, province, username, role, isActive, createdAt FROM users WHERE id = ?',
        [result.insertId]
      );

      return new User(newUser[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email or username already exists');
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND isActive = true',
        [id]
      );

      if (users.length === 0) {
        return null;
      }

      return new User(users[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND isActive = true',
        [email]
      );

      if (users.length === 0) {
        return null;
      }

      return new User(users[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE username = ? AND isActive = true',
        [username]
      );

      if (users.length === 0) {
        return null;
      }

      return new User(users[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by username or email for login
  static async findByUsernameOrEmail(identifier) {
    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND isActive = true',
        [identifier, identifier]
      );

      if (users.length === 0) {
        return null;
      }

      return new User(users[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE isActive = true';
    let queryParams = [];

    // Add filters
    if (filters.role) {
      whereClause += ' AND role = ?';
      queryParams.push(filters.role);
    }

    if (filters.province) {
      whereClause += ' AND province = ?';
      queryParams.push(filters.province);
    }

    if (filters.search) {
      whereClause += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    try {
      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM users ${whereClause}`,
        queryParams
      );

      // Get users
      const [users] = await pool.execute(
        `SELECT id, firstName, lastName, email, mobile, province, username, role, isActive, createdAt, updatedAt 
         FROM users ${whereClause} 
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      const totalUsers = countResult[0].total;
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        users: users.map(user => new User(user)),
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = ['firstName', 'lastName', 'email', 'mobile', 'province', 'username'];
    const updateFields = [];
    const updateValues = [];

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'email' && !this.validateEmail(value)) {
          throw new Error('Invalid email format');
        }
        if (key === 'mobile' && !this.validateMobile(value)) {
          throw new Error('Invalid mobile number format');
        }
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND isActive = true`,
        updateValues
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return await this.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email or username already exists');
      }
      throw error;
    }
  }

  // Update password
  static async updatePassword(id, currentPassword, newPassword) {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    try {
      // Get user with password
      const [users] = await pool.execute(
        'SELECT password FROM users WHERE id = ? AND isActive = true',
        [id]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, users[0].password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await pool.execute(
        'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, id]
      );

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Soft delete user
  static async softDelete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return { success: true, message: 'User deactivated successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Restore user
  static async restore(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE users SET isActive = true, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return { success: true, message: 'User restored successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(identifier, password) {
    try {
      const user = await this.findByUsernameOrEmail(identifier);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await this.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: userPassword, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Get user profile (without password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;