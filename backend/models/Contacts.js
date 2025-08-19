const { pool } = require('../config/database'); 

const Contact = {
  // Create new contact
  async create(contactData) {
    try {
      const {
        name,
        email,
        phone,
        cropType,
        message,
        selectedAgentId,
        selectedAgentName
      } = contactData;

      const query = `
        INSERT INTO contacts 
        (name, email, phone, crop_type, message, selected_agent_id, selected_agent_name, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `;

      const values = [
        name,
        email,
        phone,
        cropType,
        message,
        selectedAgentId,
        selectedAgentName
      ];

      const [result] = await pool.execute(query, values);
      
      // Get the created contact
      const [rows] = await pool.execute(
        'SELECT * FROM contacts WHERE id = ?',
        [result.insertId]
      );

      return rows[0];

    } catch (error) {
      console.error('Database error in Contact.create:', error);
      throw new Error('Failed to create contact');
    }
  },

  // Find all contacts with optional filtering
  async findAll(options = {}) {
    try {
      let query = 'SELECT * FROM contacts WHERE 1=1';
      const values = [];

      if (options.status) {
        query += ' AND status = ?';
        values.push(options.status);
      }

      if (options.cropType) {
        query += ' AND crop_type = ?';
        values.push(options.cropType);
      }

      if (options.agentId) {
        query += ' AND selected_agent_id = ?';
        values.push(options.agentId);
      }

      query += ' ORDER BY created_at DESC';

      if (options.limit) {
        query += ' LIMIT ?';
        values.push(options.limit);
      }

      if (options.offset) {
        query += ' OFFSET ?';
        values.push(options.offset);
      }

      const [rows] = await pool.execute(query, values);
      return rows;

    } catch (error) {
      console.error('Database error in Contact.findAll:', error);
      throw new Error('Failed to retrieve contacts');
    }
  },

  // Find contact by ID
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM contacts WHERE id = ?',
        [id]
      );

      return rows[0] || null;

    } catch (error) {
      console.error('Database error in Contact.findById:', error);
      throw new Error('Failed to retrieve contact');
    }
  },

  // Update contact status
  async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE contacts SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      // Get the updated contact
      const [rows] = await pool.execute(
        'SELECT * FROM contacts WHERE id = ?',
        [id]
      );

      return rows[0];

    } catch (error) {
      console.error('Database error in Contact.updateStatus:', error);
      throw new Error('Failed to update contact status');
    }
  },

  // Delete contact
  async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM contacts WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;

    } catch (error) {
      console.error('Database error in Contact.delete:', error);
      throw new Error('Failed to delete contact');
    }
  },

  // Search contacts
  async search(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const query = `
        SELECT * FROM contacts 
        WHERE name LIKE ? 
        OR email LIKE ? 
        OR message LIKE ? 
        OR crop_type LIKE ?
        ORDER BY created_at DESC
      `;

      const [rows] = await pool.execute(query, [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      ]);

      return rows;

    } catch (error) {
      console.error('Database error in Contact.search:', error);
      throw new Error('Failed to search contacts');
    }
  },

  // Get contact statistics
  async getStats() {
    try {
      const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM contacts');
      const [statusResult] = await pool.execute(`
        SELECT status, COUNT(*) as count 
        FROM contacts 
        GROUP BY status
      `);
      const [cropResult] = await pool.execute(`
        SELECT crop_type, COUNT(*) as count 
        FROM contacts 
        WHERE crop_type IS NOT NULL 
        GROUP BY crop_type 
        ORDER BY count DESC
      `);

      // Format status stats
      const statusStats = {
        pending: 0,
        contacted: 0,
        resolved: 0
      };

      statusResult.forEach(row => {
        statusStats[row.status] = row.count;
      });

      return {
        total: totalResult[0].total,
        byStatus: statusStats,
        byCropType: cropResult
      };

    } catch (error) {
      console.error('Database error in Contact.getStats:', error);
      throw new Error('Failed to retrieve contact statistics');
    }
  }
};

module.exports = Contact;