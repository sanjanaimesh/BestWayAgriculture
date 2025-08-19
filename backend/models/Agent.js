// Updated database config import - use the pool directly
const { pool } = require('../config/database');

class Agent {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.specialty = data.specialty;
    this.experience = data.experience;
    this.rating = data.rating || 0.0;
    this.phone = data.phone;
    this.email = data.email;
    this.image_url = data.image_url || data.image;
    this.bio = data.bio;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all agents with optional filters
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM agents WHERE 1=1';
      const params = [];

      // Apply filters
      if (filters.is_active !== undefined) {
        query += ' AND is_active = ?';
        params.push(filters.is_active);
      }

      if (filters.specialty) {
        query += ' AND specialty = ?';
        params.push(filters.specialty);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR specialty LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Default ordering
      query += ' ORDER BY created_at DESC';

      // Apply pagination if provided
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }

      const [rows] = await pool.execute(query, params);
      return rows.map(row => new Agent(row));
    } catch (error) {
      console.error('Error in Agent.findAll:', error);
      throw new Error(`Error fetching agents: ${error.message}`);
    }
  }

  // Get agent by ID
  static async findById(id) {
    try {
      if (!id) {
        return null;
      }

      const query = 'SELECT * FROM agents WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Agent(rows[0]);
    } catch (error) {
      console.error('Error in Agent.findById:', error);
      throw new Error(`Error fetching agent: ${error.message}`);
    }
  }

  // Get agent by email
  static async findByEmail(email) {
    try {
      if (!email) {
        return null;
      }

      const query = 'SELECT * FROM agents WHERE email = ?';
      const [rows] = await pool.execute(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Agent(rows[0]);
    } catch (error) {
      console.error('Error in Agent.findByEmail:', error);
      throw new Error(`Error fetching agent by email: ${error.message}`);
    }
  }

  // Create new agent or update existing
  async save() {
    try {
      // Validate data before saving
      const validationErrors = this.validateData();
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if email already exists
      if (this.email) {
        const existingAgent = await Agent.findByEmail(this.email);
        if (existingAgent && existingAgent.id !== this.id) {
          throw new Error('Agent with this email already exists');
        }
      }

      if (this.id) {
        // Update existing agent
        const query = `
          UPDATE agents 
          SET name = ?, specialty = ?, experience = ?, rating = ?, 
              phone = ?, email = ?, image_url = ?, bio = ?, is_active = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.name, this.specialty, this.experience, this.rating,
          this.phone, this.email, this.image_url, this.bio, this.is_active,
          this.id
        ];
        
        const [result] = await pool.execute(query, params);
        
        if (result.affectedRows === 0) {
          throw new Error('Agent not found');
        }
        
        return this;
      } else {
        // Create new agent
        const query = `
          INSERT INTO agents (name, specialty, experience, rating, phone, email, image_url, bio, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.name, this.specialty, this.experience, this.rating,
          this.phone, this.email, this.image_url, this.bio, this.is_active
        ];
        
        const [result] = await pool.execute(query, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error('Error in Agent.save:', error);
      throw new Error(`Error saving agent: ${error.message}`);
    }
  }

  // Delete agent 
  static async softDelete(id) {
    try {
      if (!id) {
        throw new Error('Agent ID is required');
      }

      const query = 'UPDATE agents SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Agent not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error in Agent.softDelete:', error);
      throw new Error(`Error deleting agent: ${error.message}`);
    }
  }

  // Hard delete agent 
  static async hardDelete(id) {
    try {
      console.log('Attempting to delete agent with ID:', id);
      
      if (!id) {
        throw new Error('Agent ID is required');
      }

      // First check if agent exists
      const checkQuery = 'SELECT id FROM agents WHERE id = ?';
      const [checkResult] = await pool.execute(checkQuery, [id]);
      console.log('Agent exists check:', checkResult.length > 0 ? 'Found' : 'Not found');
      
      if (checkResult.length === 0) {
        throw new Error('Agent not found in database');
      }

      // Proceed with deletion
      const query = 'DELETE FROM agents WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      
      console.log('Delete result:', {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        serverStatus: result.serverStatus
      });
      
      if (result.affectedRows === 0) {
        throw new Error('Agent not found or could not be deleted');
      }
      
      console.log(`Agent ${id} successfully deleted from database`);
      return {
        success: true,
        message: `Agent ${id} permanently deleted`,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('Error in Agent.hardDelete:', error);
      throw new Error(`Error permanently deleting agent: ${error.message}`);
    }
  }

  // Get agent statistics
  static async getStatistics() {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM agents WHERE is_active = TRUE',
        'SELECT COUNT(DISTINCT specialty) as specialties FROM agents WHERE is_active = TRUE',
        'SELECT AVG(rating) as avg_rating FROM agents WHERE is_active = TRUE AND rating > 0',
        'SELECT COUNT(*) as top_rated FROM agents WHERE is_active = TRUE AND rating >= 4.5'
      ];

      const results = await Promise.all(
        queries.map(query => pool.execute(query))
      );

      return {
        total: results[0][0][0].total || 0,
        specialties: results[1][0][0].specialties || 0,
        avg_rating: parseFloat(results[2][0][0].avg_rating || 0).toFixed(1),
        top_rated: results[3][0][0].top_rated || 0
      };
    } catch (error) {
      console.error('Error in Agent.getStatistics:', error);
      throw new Error(`Error fetching agent statistics: ${error.message}`);
    }
  }

  // Get all unique specialties
  static async getSpecialties() {
    try {
      const query = 'SELECT DISTINCT specialty FROM agents WHERE is_active = TRUE AND specialty IS NOT NULL ORDER BY specialty';
      const [rows] = await pool.execute(query);
      return rows.map(row => row.specialty).filter(specialty => specialty && specialty.trim());
    } catch (error) {
      console.error('Error in Agent.getSpecialties:', error);
      throw new Error(`Error fetching specialties: ${error.message}`);
    }
  }

  // Validate agent data
  validateData() {
    const errors = [];

    if (!this.name || typeof this.name !== 'string' || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!this.specialty || typeof this.specialty !== 'string' || this.specialty.trim().length < 2) {
      errors.push('Specialty is required and must be at least 2 characters long');
    }

    if (!this.experience || typeof this.experience !== 'string' || this.experience.trim().length < 1) {
      errors.push('Experience is required');
    }

    if (!this.email || typeof this.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      errors.push('Valid email is required');
    }

    if (this.rating !== null && this.rating !== undefined && this.rating !== '') {
      const rating = parseFloat(this.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push('Rating must be between 0 and 5');
      }
    }

    if (!this.bio || typeof this.bio !== 'string' || this.bio.trim().length < 10) {
      errors.push('Bio must be at least 10 characters long');
    }

    if (this.phone && typeof this.phone === 'string' && this.phone.trim()) {
      // Basic phone validation
      if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(this.phone.trim())) {
        errors.push('Please provide a valid phone number');
      }
    }

    return errors;
  }

  // Convert to JSON 
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      specialty: this.specialty,
      experience: this.experience,
      rating: parseFloat(this.rating || 0),
      phone: this.phone,
      email: this.email,
      image: this.image_url,
      bio: this.bio,
      is_active: Boolean(this.is_active),
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Agent;