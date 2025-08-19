const User = require('../models/User');

class UserController {
  // Register new user
  static async register(req, res) {
    try {
      const { firstName, lastName, email, mobile, province, username, password, role } = req.body;

      const userData = {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim().toLowerCase(),
        mobile: mobile?.trim(),
        province: province?.trim(),
        username: username?.trim(),
        password: password?.trim(),
        role: role || 'user'
      };

      console.log('Creating user with data:', { ...userData, password: '***' });

      const newUser = await User.create(userData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser.toJSON()
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { username, identifier, password } = req.body;
      
      const loginIdentifier = username || identifier;

      if (!loginIdentifier?.trim() || !password?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      console.log('Login attempt for:', loginIdentifier.trim());

      const user = await User.authenticate(loginIdentifier.trim(), password.trim());

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user,
          token: null 
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      console.log('Getting profile for user ID:', userId);

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role;
      const province = req.query.province;
      const search = req.query.search;

      console.log('Getting all users with filters:', { page, limit, role, province, search });

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      const filters = {};
      if (role) filters.role = role;
      if (province) filters.province = province;
      if (search) filters.search = search;

      const result = await User.findAll(page, limit, filters);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: result.users.map(user => user.toJSON()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.params.id;
      const updateData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      console.log('Updating user profile:', userId, updateData);

      delete updateData.password;

      
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'string') {
          updateData[key] = updateData[key].trim();
        }
      });

      const updatedUser = await User.update(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Update password
  static async updatePassword(req, res) {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'All password fields are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New passwords do not match'
        });
      }

      console.log('Updating password for user:', userId);

      await User.updatePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update password'
      });
    }
  }

  // Deactivate user 
  static async deactivateUser(req, res) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      console.log('Deleting user:', userId);

      const result = await User.softDelete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  }

  // Restore user 
  static async restoreUser(req, res) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      console.log('Restoring user:', userId);

      await User.restore(userId);

      res.json({
        success: true,
        message: 'User restored successfully'
      });
    } catch (error) {
      console.error('Restore user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to restore user'
      });
    }
  }

  // Get user statistics 
  static async getUserStats(req, res) {
    try {
      console.log('Getting user statistics...');
      
      const { pool } = require('../config/database');

      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as totalUsers,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as totalCustomers,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as totalAdmins,
          COUNT(CASE WHEN isActive = true THEN 1 END) as activeUsers,
          COUNT(CASE WHEN isActive = false THEN 1 END) as inactiveUsers,
          COUNT(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 END) as todayRegistrations,
          COUNT(CASE WHEN WEEK(createdAt) = WEEK(NOW()) AND YEAR(createdAt) = YEAR(NOW()) THEN 1 END) as thisWeekRegistrations
        FROM users
      `);

      const [provinceStats] = await pool.execute(`
        SELECT province, COUNT(*) as count 
        FROM users 
        WHERE isActive = true 
        GROUP BY province 
        ORDER BY count DESC
      `);

      console.log('User stats:', stats[0]);

      res.json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          overview: stats[0],
          provinceDistribution: provinceStats
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Check username availability
  static async checkUsername(req, res) {
    try {
      const { username } = req.params;

      if (!username?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Username is required'
        });
      }

      const existingUser = await User.findByUsername(username.trim());

      res.json({
        success: true,
        data: {
          available: !existingUser,
          username: username.trim()
        }
      });
    } catch (error) {
      console.error('Check username error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check username availability'
      });
    }
  }

  // Check email availability
  static async checkEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      if (!User.validateEmail(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const existingUser = await User.findByEmail(email.trim().toLowerCase());

      res.json({
        success: true,
        data: {
          available: !existingUser,
          email: email.trim().toLowerCase()
        }
      });
    } catch (error) {
      console.error('Check email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check email availability'
      });
    }
  }
}

module.exports = UserController;