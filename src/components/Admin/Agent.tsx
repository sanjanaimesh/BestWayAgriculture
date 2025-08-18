import React, { useState } from 'react';
import { Plus, Edit, Trash2, Star, Phone, Mail, Save, X, User } from 'lucide-react';

const Agent = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Vegetable Crops',
      experience: '15 years',
      rating: 4.9,
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@bestwayagriculture.com',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Specialized in organic vegetable farming with expertise in soil health and sustainable practices.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialty: 'Grain Production',
      experience: '12 years',
      rating: 4.8,
      phone: '+1 (555) 987-6543',
      email: 'michael.chen@bestwayagriculture.com',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Expert in large-scale grain production with focus on yield optimization and modern farming techniques.'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Crop Disease Management',
      experience: '18 years',
      rating: 4.9,
      phone: '+1 (555) 456-7890',
      email: 'emily.rodriguez@bestwayagriculture.com',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Plant pathologist specializing in integrated pest management and disease prevention strategies.'
    }
  ]);

  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    rating: 5.0,
    phone: '',
    email: '',
    image: '',
    bio: ''
  });

  const specialties = [
    'Vegetable Crops',
    'Grain Production',
    'Fruit Cultivation',
    'Crop Disease Management',
    'Soil Management',
    'Organic Farming',
    'Irrigation Systems',
    'Pest Control',
    'Plant Nutrition',
    'Greenhouse Management'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      bio: ''
    });
  };

  const handleAddAgent = () => {
    setIsAddingAgent(true);
    resetForm();
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent.id);
    setFormData(agent);
  };

  const handleSaveAgent = () => {
    if (editingAgent) {
      // Update existing agent
      setAgents(prev => prev.map(agent => 
        agent.id === editingAgent 
          ? { ...formData, id: editingAgent }
          : agent
      ));
      setEditingAgent(null);
    } else {
      // Add new agent
      const newAgent = {
        ...formData,
        id: Math.max(...agents.map(a => a.id)) + 1,
        rating: parseFloat(formData.rating)
      };
      setAgents(prev => [...prev, newAgent]);
      setIsAddingAgent(false);
    }
    resetForm();
  };

  const handleCancel = () => {
    setIsAddingAgent(false);
    setEditingAgent(null);
    resetForm();
  };

  const handleDeleteAgent = (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    }
  };

  const isFormValid = () => {
    return formData.name && formData.specialty && formData.experience && 
           formData.phone && formData.email && formData.bio;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
            <p className="text-gray-600 mt-2">Manage agricultural experts and consultants</p>
          </div>
          <button
            onClick={handleAddAgent}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Agent
          </button>
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
                  Full Name
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
                  Specialty
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                  Bio
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
            <div key={agent.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{agent.rating} • {agent.experience}</span>
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
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{agents.length}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(agents.map(a => a.specialty)).size}
              </div>
              <div className="text-sm text-gray-600">Specialties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {agents.filter(a => a.rating >= 4.5).length}
              </div>
              <div className="text-sm text-gray-600">Top Rated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;