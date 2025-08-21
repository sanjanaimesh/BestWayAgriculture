import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Phone, Mail, Save, X, User, RefreshCw, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from 'lucide-react';

const Agent = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    is_active: true
  });
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    rating: 5.0,
    phone: '',
    email: '',
    image: '',
    bio: '',
    is_active: true
  });

  const API_BASE_URL = 'http://localhost:4000/api';

  // Default specialties fallback
  const defaultSpecialties = [
    'Crop Management',
    'Soil Science',
    'Pest Control',
    'Organic Farming',
    'Livestock Management',
    'Agricultural Technology',
    'Irrigation Systems',
    'Plant Pathology',
    'Agricultural Economics',
    'Sustainable Agriculture'
  ];

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.specialty) queryParams.append('specialty', filters.specialty);
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);

      const response = await fetch(`${API_BASE_URL}/agents?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setAgents(result.data);
      } else {
        showNotification('Failed to fetch agents', 'error');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/statistics`);
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/specialties`);
      const result = await response.json();
      if (result.success) {
        // Combine API specialties with default ones and remove duplicates
        const combinedSpecialties = [...new Set([...result.data, ...defaultSpecialties])];
        setSpecialties(combinedSpecialties.sort());
      } else {
        setSpecialties(defaultSpecialties);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      setSpecialties(defaultSpecialties);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchStatistics();
    fetchSpecialties();
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (name === 'is_active' ? value === 'true' : value)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      experience: '',
      rating: 5.0,
      phone: '',
      email: '',
      image: '',
      bio: '',
      is_active: true
    });
  };

  const handleAddAgent = () => {
    setIsAddingAgent(true);
    setEditingAgent(null);
    resetForm();
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent.id);
    setIsAddingAgent(false);
    setFormData({
      name: agent.name,
      specialty: agent.specialty,
      experience: agent.experience,
      rating: agent.rating,
      phone: agent.phone || '',
      email: agent.email,
      image: agent.image || '',
      bio: agent.bio,
      is_active: agent.is_active
    });
  };

  const handleSaveAgent = async () => {
    try {
      const url = editingAgent 
        ? `${API_BASE_URL}/agents/${editingAgent}`
        : `${API_BASE_URL}/agents`;
      
      const method = editingAgent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        showNotification(
          editingAgent ? 'Agent updated successfully' : 'Agent created successfully'
        );
        await fetchAgents();
        await fetchStatistics();
        await fetchSpecialties(); 
        handleCancel();
      } else {
        showNotification(result.message || 'Failed to save agent', 'error');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      showNotification('Error saving agent', 'error');
    }
  };

  const handleCancel = () => {
    setIsAddingAgent(false);
    setEditingAgent(null);
    resetForm();
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (window.confirm(`Are you sure you want to delete ${agentName}?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          showNotification('Agent deleted successfully');
          await fetchAgents();
          await fetchStatistics();
        } else {
          showNotification(result.message || 'Failed to delete agent', 'error');
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        showNotification('Error deleting agent', 'error');
      }
    }
  };

  const handleToggleStatus = async (agentId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/toggle`, {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        showNotification(result.message);
        await fetchAgents();
        await fetchStatistics();
      } else {
        showNotification(result.message || 'Failed to toggle agent status', 'error');
      }
    } catch (error) {
      console.error('Error toggling agent status:', error);
      showNotification('Error toggling agent status', 'error');
    }
  };

  // Add new specialty
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      const updatedSpecialties = [...specialties, newSpecialty.trim()].sort();
      setSpecialties(updatedSpecialties);
      setFormData(prev => ({ ...prev, specialty: newSpecialty.trim() }));
      setNewSpecialty('');
      setIsAddingSpecialty(false);
      showNotification('New specialty added successfully');
    } else if (specialties.includes(newSpecialty.trim())) {
      showNotification('Specialty already exists', 'error');
    } else {
      showNotification('Please enter a valid specialty name', 'error');
    }
  };

  const handleCancelAddSpecialty = () => {
    setNewSpecialty('');
    setIsAddingSpecialty(false);
  };

  const isFormValid = () => {
    return formData.name && formData.specialty && formData.experience && 
           formData.phone && formData.email && formData.bio;
  };

  if (loading && agents.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading agents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? 
              <CheckCircle className="h-5 w-5 mr-2" /> : 
              <AlertCircle className="h-5 w-5 mr-2" />
            }
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="text-gray-600 mt-2">Manage agricultural experts and consultants</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchAgents}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddAgent}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add New Agent
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, email, or specialty..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                name="specialty"
                value={filters.specialty}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="is_active"
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingAgent || editingAgent) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAgent ? 'Edit Agent' : 'Add New Agent'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty *
                </label>
                <div className="flex gap-2">
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingSpecialty(true)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Add new specialty"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Add specialty inline form */}
                {isAddingSpecialty && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      New Specialty Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Enter new specialty..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddSpecialty}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience *
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="15 years"
                />
              </div>

              { <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0771234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="john.smith@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief description of expertise and experience..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Agent</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAgent}
                disabled={!isFormValid()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingAgent ? 'Update Agent' : 'Add Agent'}
              </button>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
              !agent.is_active ? 'opacity-60 bg-gray-50' : ''
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
                    <p className="text-green-600 font-medium text-sm">{agent.specialty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAgent(agent)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id, agent.name)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{agent.rating} {agent.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{agent.email}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">{agent.bio}</p>
              
              {!agent.is_active && (
                <div className="mt-3 text-xs text-red-600 font-medium">
                  INACTIVE
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {agents.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              {filters.search || filters.specialty ? 'Try adjusting your filters' : 'Get started by adding your first agent'}
            </p>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Agent;