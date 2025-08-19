const Contact = require('../models/Contacts');

const contactController = {
  // Create new contact
  async createContact(req, res) {
    try {
      const {
        name,
        email,
        phone,
        cropType,
        message,
        selectedAgentId,
        selectedAgentName
      } = req.body;

      
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required fields',
          required_fields: ['name', 'email', 'message']
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Phone validation
      if (phone && phone.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be at least 10 digits'
        });
      }

      const contactData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        cropType: cropType || null,
        message: message.trim(),
        selectedAgentId: selectedAgentId || null,
        selectedAgentName: selectedAgentName || null
      };

      const newContact = await Contact.create(contactData);

      res.status(201).json({
        success: true,
        message: 'Contact request submitted successfully! An expert will contact you within 24 hours.',
        data: {
          id: newContact.id,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          cropType: newContact.crop_type,
          message: newContact.message,
          selectedAgentId: newContact.selected_agent_id,
          selectedAgentName: newContact.selected_agent_name,
          status: newContact.status,
          createdAt: newContact.created_at
        }
      });

    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact request. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all contacts (for admin)
  async getAllContacts(req, res) {
    try {
      const {
        status,
        cropType,
        agentId,
        limit = 50,
        offset = 0,
        search
      } = req.query;

      let contacts;

      if (search) {
        contacts = await Contact.search(search);
      } else {
        const options = {
          status,
          cropType,
          agentId,
          limit: parseInt(limit),
          offset: parseInt(offset)
        };

        contacts = await Contact.findAll(options);
      }

      // Get statistics
      const stats = await Contact.getStats();

      res.status(200).json({
        success: true,
        data: contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          cropType: contact.crop_type,
          message: contact.message,
          selectedAgentId: contact.selected_agent_id,
          selectedAgentName: contact.selected_agent_name,
          status: contact.status,
          createdAt: contact.created_at,
          updatedAt: contact.updated_at
        })),
        stats,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: contacts.length
        }
      });

    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve contacts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get single contact by ID
  async getContactById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID provided'
        });
      }

      const contact = await Contact.findById(parseInt(id));

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          cropType: contact.crop_type,
          message: contact.message,
          selectedAgentId: contact.selected_agent_id,
          selectedAgentName: contact.selected_agent_name,
          status: contact.status,
          createdAt: contact.created_at,
          updatedAt: contact.updated_at
        }
      });

    } catch (error) {
      console.error('Error getting contact by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update contact status
  async updateContactStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID provided'
        });
      }

      const validStatuses = ['pending', 'contacted', 'resolved'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const updatedContact = await Contact.updateStatus(parseInt(id), status);

      if (!updatedContact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: `Contact status updated to ${status}`,
        data: {
          id: updatedContact.id,
          name: updatedContact.name,
          email: updatedContact.email,
          status: updatedContact.status,
          updatedAt: updatedContact.updated_at
        }
      });

    } catch (error) {
      console.error('Error updating contact status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update contact status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete contact
  async deleteContact(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact ID provided'
        });
      }

      const deleted = await Contact.delete(parseInt(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get contact statistics
  async getContactStats(req, res) {
    try {
      const stats = await Contact.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error getting contact stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve contact statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = contactController;