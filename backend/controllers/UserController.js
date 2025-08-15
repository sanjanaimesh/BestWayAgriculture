const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class UserController {
  // Generate JWT token
  static generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Register new user
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        firstName,
        lastName,
        email,
        mobile,
        province,
        username,
        password
      } = req.body;

      // Create new user
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        province,
        username,
        password
      });

      // Generate token
      const token = this.generateToken(newUser.id, newUser.role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser.toJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific errors
      if (error.message === 'Username already exists' || error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      // Find user by username (include inactive to check if account exists)
      const user = await User.findByUsername(username, true);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is active
      if (!user.isAccountActive()) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = this.generateToken(user.id, user.role);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await user.update(req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.updatePassword(newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        province = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        province,
        sortBy,
        sortOrder
      };

      const result = await User.findAll(options);

      res.json({
        success: true,
        data: result,
        meta: {
          filters: {
            search,
            role,
            province,
            sortBy,
            sortOrder
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update user role (Admin only)
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate inputs
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be "user" or "admin"'
        });
      }

      // Prevent admin from changing their own role
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own role'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.updateRole(role);

      res.json({
        success: true,
        message: `User role updated to ${role} successfully`,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Toggle user active status (Admin only)
  static async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own account status'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.toggleActive();
      const action = user.isActive ? 'activated' : 'deactivated';

      res.json({
        success: true,
        message: `User ${action} successfully`,
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Perform soft or hard delete based on query parameter
      if (permanent === 'true') {
        await user.delete();
        res.json({
          success: true,
          message: 'User permanently deleted successfully'
        });
      } else {
        await user.softDelete();
        res.json({
          success: true,
          message: 'User deactivated successfully'
        });
      }

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats(req, res) {
    try {
      const stats = await User.getStats();

      res.json({
        success: true,
        data: {
          stats,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify token (for frontend to check if token is valid)
  static async verifyToken(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user || !user.isAccountActive()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or inactive user'
        });
      }

      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: user.toJSON()
        }
      });

    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UserController;