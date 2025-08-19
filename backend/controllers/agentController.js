const Agent = require('../models/Agent');

class AgentController {
  // GET /api/agents 
  static async getAllAgents(req, res) {
    try {
      const filters = {};
      
      // Extract query parameters
      if (req.query.is_active !== undefined) {
        filters.is_active = req.query.is_active === 'true';
      }
      
      if (req.query.specialty) {
        filters.specialty = req.query.specialty;
      }
      
      if (req.query.search) {
        filters.search = req.query.search;
      }

      // Pagination
      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit);
      }
      
      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset);
      }

      const agents = await Agent.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'Agents retrieved successfully',
        data: agents.map(agent => agent.toJSON()),
        count: agents.length
      });
    } catch (error) {
      console.error('Error in getAllAgents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve agents',
        error: error.message
      });
    }
  }

  // GET /api/agents/:id 
  static async getAgentById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid agent ID is required'
        });
      }

      const agent = await Agent.findById(parseInt(id));
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Agent retrieved successfully',
        data: agent.toJSON()
      });
    } catch (error) {
      console.error('Error in getAgentById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve agent',
        error: error.message
      });
    }
  }

  // POST /api/agents - Create new agent
static async createAgent(req, res) {
  try {
    
    const agentData = {
      name: req.body.name,
      specialty: req.body.specialty,
      experience: req.body.experience,
      
      phone: req.body.phone,
      email: req.body.email,
      image_url: req.body.image || req.body.image_url || null,
      bio: req.body.bio,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    };

    
    const agent = new Agent(agentData);

    
    const validationErrors = agent.validateData();
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    
    const savedAgent = await agent.save();

    return res.status(201).json({
      success: true,
      message: "Agent created successfully",
      data: savedAgent.toJSON(),
    });

  } catch (error) {
    console.error("Error in createAgent:", error);

    // Handle duplicate email conflict
    if (error.message && error.message.includes("email already exists")) {
      return res.status(409).json({
        success: false,
        message: "An agent with this email already exists",
        error: error.message,
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Failed to create agent",
      error: error.message || "Unknown error",
    });
  }
}



  // PUT /api/agents/:id
  static async updateAgent(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid agent ID is required'
        });
      }

      
      const existingAgent = await Agent.findById(parseInt(id));
      if (!existingAgent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Update agent data
      const agentData = {
        id: parseInt(id),
        name: req.body.name || existingAgent.name,
        specialty: req.body.specialty || existingAgent.specialty,
        experience: req.body.experience || existingAgent.experience,
        rating: req.body.rating !== undefined ? req.body.rating : existingAgent.rating,
        phone: req.body.phone !== undefined ? req.body.phone : existingAgent.phone,
        email: req.body.email || existingAgent.email,
        image_url: req.body.image || req.body.image_url || existingAgent.image_url,
        bio: req.body.bio || existingAgent.bio,
        is_active: req.body.is_active !== undefined ? req.body.is_active : existingAgent.is_active
      };

      const agent = new Agent(agentData);
      
      // Validate data
      const validationErrors = agent.validateData();
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Save updated agent
      const updatedAgent = await agent.save();

      res.status(200).json({
        success: true,
        message: 'Agent updated successfully',
        data: updatedAgent.toJSON()
      });
    } catch (error) {
      console.error('Error in updateAgent:', error);
      
      
      if (error.message.includes('email already exists')) {
        return res.status(409).json({
          success: false,
          message: 'An agent with this email already exists',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update agent',
        error: error.message
      });
    }
  }

  // DELETE /api/agents/:id 
  static async deleteAgent(req, res) {
    try {
      const { id } = req.params;
      const { permanent } = req.query; 
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid agent ID is required'
        });
      }

      const agentId = parseInt(id);
      
      // Check if agent exists
      const existingAgent = await Agent.findById(agentId);
      if (!existingAgent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      if (permanent === 'true') {
        
        await Agent.hardDelete(agentId);
        res.status(200).json({
          success: true,
          message: 'Agent permanently deleted'
        });
      } else {
        
        await Agent.softDelete(agentId);
        res.status(200).json({
          success: true,
          message: 'Agent deactivated successfully'
        });
      }
    } catch (error) {
      console.error('Error in deleteAgent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete agent',
        error: error.message
      });
    }
  }

  // POST /api/agents/:id/restore
  static async restoreAgent(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid agent ID is required'
        });
      }

      const agentId = parseInt(id);
      
      await Agent.restore(agentId);
      
      res.status(200).json({
        success: true,
        message: 'Agent restored successfully'
      });
    } catch (error) {
      console.error('Error in restoreAgent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore agent',
        error: error.message
      });
    }
  }

  // GET /api/agents/statistics
  static async getStatistics(req, res) {
    try {
      const statistics = await Agent.getStatistics();
      
      res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error in getStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
        error: error.message
      });
    }
  }

  // GET /api/agents/specialties
  static async getSpecialties(req, res) {
    try {
      const specialties = await Agent.getSpecialties();
      
      res.status(200).json({
        success: true,
        message: 'Specialties retrieved successfully',
        data: specialties
      });
    } catch (error) {
      console.error('Error in getSpecialties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve specialties',
        error: error.message
      });
    }
  }

  // PATCH /api/agents/:id/toggle
  static async toggleAgentStatus(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid agent ID is required'
        });
      }

      const agentId = parseInt(id);
      
      // Get current agent
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Toggle status
      agent.is_active = !agent.is_active;
      const updatedAgent = await agent.save();

      res.status(200).json({
        success: true,
        message: `Agent ${agent.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedAgent.toJSON()
      });
    } catch (error) {
      console.error('Error in toggleAgentStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle agent status',
        error: error.message
      });
    }
  }
}

module.exports = AgentController;