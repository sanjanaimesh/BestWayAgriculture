import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Star, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const AgentContact = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    cropType: ''
  });

  const API_BASE_URL = 'http://localhost:4000';

  const agents = [
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
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      // Prepare data for API
      const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;
      
      const submitData = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone || null,
        cropType: contactForm.cropType || null,
        message: contactForm.message,
        selectedAgentId: selectedAgentData?.id || null,
        selectedAgentName: selectedAgentData?.name || null
      };

      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: '',
          cropType: ''
        });
        setSelectedAgent(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        setSubmitStatus('error');
        console.error('API Error:', result.message);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Connect with Agricultural Experts
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Get personalized guidance from certified agricultural specialists to maximize your crop success
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-semibold">Request Submitted Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  Thank you for contacting us. An expert will reach out to you within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Submission Failed</h3>
                <p className="text-red-700 text-sm mt-1">
                  Sorry, there was an error submitting your request. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-green-600 font-medium text-sm sm:text-base">{agent.specialty}</p>
                {/* <div className="flex items-center justify-center mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{agent.rating} • {agent.experience}</span>
                </div> */}
              </div>
              <p className="text-gray-600 text-sm mb-4">{agent.bio}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {agent.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {agent.email}
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full mt-4 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-base ${
                  selectedAgent === agent.id
                    ? 'bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {selectedAgent === agent.id ? 'Selected' : 'Contact Expert'}
              </button>
            </div>
          ))}
        </div>

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">
                Contacting: {agents.find(a => a.id === selectedAgent)?.name}
              </h3>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Expert
              </button>
            </div>
            <p className="text-blue-700 text-sm">
              Specialty: {agents.find(a => a.id === selectedAgent)?.specialty}
            </p>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {selectedAgent ? 'Contact Your Selected Expert' : 'Get Expert Consultation'}
            </h3>
            {!selectedAgent && (
              <p className="text-gray-600 text-sm">
                Fill out the form below and we'll match you with the right expert
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <select
                  name="cropType"
                  value={contactForm.cropType}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select crop type</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="grains">Grains</option>
                  <option value="fruits">Fruits</option>
                  <option value="flowers">Flowers</option>
                  <option value="herbs">Herbs</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                rows={4}
                required
                disabled={loading}
                placeholder={selectedAgent 
                  ? `Tell ${agents.find(a => a.id === selectedAgent)?.name} about your farming needs, challenges, or questions...`
                  : "Tell us about your farming needs, challenges, or questions..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  {selectedAgent ? 'Contact Selected Expert' : 'Request Consultation'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AgentContact;