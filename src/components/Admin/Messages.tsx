import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Reply, Trash2, Mail, MailOpen, Clock, CheckCircle, AlertCircle, MessageSquare, User, Users, RefreshCw } from 'lucide-react';

// API service functions
const contactsAPI = {
  // Get all contacts with filtering
  async getContacts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.cropType) queryParams.append('cropType', params.cropType);
    if (params.agentId) queryParams.append('agentId', params.agentId);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.search) queryParams.append('search', params.search);
    
    const url = `http://localhost:4000/api/contacts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get single contact by ID
  async getContactById(id) {
    const response = await fetch(`http://localhost:4000/api/contacts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Update contact status
  async updateContactStatus(id, status) {
    const response = await fetch(`http://localhost:4000/api/contacts/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Delete contact
  async deleteContact(id) {
    const response = await fetch(`http://localhost:4000/api/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  // Get contact statistics
  async getContactStats() {
    const response = await fetch('http://localhost:4000/api/contacts/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    resolved: 0
  });

  // Map backend status to frontend status
  const mapBackendStatus = (backendStatus) => {
    const statusMap = {
      'pending': 'unread',
      'contacted': 'replied', 
      'resolved': 'resolved'
    };
    return statusMap[backendStatus] || 'read';
  };

  // Map frontend status to backend status
  const mapFrontendStatus = (frontendStatus) => {
    const statusMap = {
      'unread': 'pending',
      'read': 'pending',
      'replied': 'contacted',
      'resolved': 'resolved'
    };
    return statusMap[frontendStatus] || 'pending';
  };

  // Transform backend data to frontend format
  const transformContactToMessage = (contact) => {
    // Determine category based on selectedAgentId
    const category = contact.selectedAgentId ? 'agent inquiry' : 'general inquiry';
    
    // Assign priority based on crop type or other criteria
    let priority = 'medium';
    if (contact.message && contact.message.toLowerCase().includes('urgent')) {
      priority = 'urgent';
    } else if (contact.message && contact.message.toLowerCase().includes('help')) {
      priority = 'high';
    } else if (contact.cropType === 'vegetables') {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    return {
      id: contact.id,
      subject: contact.selectedAgentName 
        ? `Agent Consultation - ${contact.selectedAgentName}`
        : `General Inquiry - ${contact.name}`,
      sender: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      status: mapBackendStatus(contact.status),
      priority: priority,
      date: new Date(contact.createdAt).toISOString().split('T')[0],
      time: new Date(contact.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      category: category,
      selectedAgent: contact.selectedAgentName,
      agentSpecialty: contact.selectedAgentName ? 'Agricultural Expert' : null,
      cropType: contact.cropType,
      replies: [], 
      backendId: contact.id 
    };
  };

  const statuses = ['unread', 'read', 'replied', 'resolved'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const categories = ['agent inquiry', 'general inquiry', 'product inquiry', 'order issue', 'technical support', 'return request', 'payment issue'];

  const statusColors = {
    'unread': 'bg-blue-100 text-blue-800',
    'read': 'bg-yellow-100 text-yellow-800',
    'replied': 'bg-purple-100 text-purple-800',
    'resolved': 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };

  const categoryColors = {
    'agent inquiry': 'bg-green-100 text-green-800',
    'general inquiry': 'bg-blue-100 text-blue-800',
    'product inquiry': 'bg-purple-100 text-purple-800',
    'order issue': 'bg-red-100 text-red-800',
    'technical support': 'bg-orange-100 text-orange-800',
    'return request': 'bg-yellow-100 text-yellow-800',
    'payment issue': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'unread': Mail,
    'read': MailOpen,
    'replied': Reply,
    'resolved': CheckCircle
  };

  const priorityIcons = {
    'low': Clock,
    'medium': MessageSquare,
    'high': AlertCircle,
    'urgent': AlertCircle
  };

  // Load contacts from API
  const loadContacts = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 100,
        offset: 0,
        ...searchParams
      };

      const response = await contactsAPI.getContacts(params);
      
      if (response.success) {
        const transformedMessages = response.data.map(transformContactToMessage);
        setMessages(transformedMessages);
      } else {
        throw new Error(response.message || 'Failed to load contacts');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await contactsAPI.getContactStats();
      if (response.success) {
        setStats({
          total: response.data.total,
          pending: response.data.byStatus?.pending || 0,
          contacted: response.data.byStatus?.contacted || 0,
          resolved: response.data.byStatus?.resolved || 0
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchParams = {};
      
      if (searchTerm) {
        searchParams.search = searchTerm;
      }
      
      if (statusFilter) {
        searchParams.status = mapFrontendStatus(statusFilter);
      }

      loadContacts(searchParams);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const backendStatus = mapFrontendStatus(newStatus);
      const response = await contactsAPI.updateContactStatus(messageId, backendStatus);
      
      if (response.success) {
        // Update local state
        setMessages(messages.map(message => 
          message.id === messageId ? { ...message, status: newStatus } : message
        ));
        setSelectedMessage(prev => 
          prev && prev.id === messageId ? { ...prev, status: newStatus } : prev
        );
        
        // Reload stats
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await contactsAPI.deleteContact(messageId);
        
        if (response.success) {
          setMessages(messages.filter(message => message.id !== messageId));
          if (selectedMessage && selectedMessage.id === messageId) {
            setShowMessageDetails(false);
            setSelectedMessage(null);
          }
          loadStats();
        } else {
          throw new Error(response.message || 'Failed to delete message');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error deleting message:', err);
      }
    }
  };

  const handleReply = (messageId) => {
    if (!replyText.trim()) return;
    
    const message = messages.find(m => m.id === messageId);
    const senderName = message?.selectedAgent || 'Admin';
    
    const newReply = {
      id: Date.now(),
      sender: senderName,
      message: replyText,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Update local state (in a real app, you'd save this to the backend)
    setMessages(messages.map(message => 
      message.id === messageId 
        ? { 
            ...message, 
            status: 'replied',
            replies: [...message.replies, newReply]
          }
        : message
    ));

    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage({
        ...selectedMessage,
        status: 'replied',
        replies: [...selectedMessage.replies, newReply]
      });
    }

    // Also update the backend status
    updateMessageStatus(messageId, 'replied');

    setReplyText('');
    setShowReplyForm(false);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || (
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.selectedAgent && message.selectedAgent.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesStatus = !statusFilter || message.status === statusFilter;
    const matchesPriority = !priorityFilter || message.priority === priorityFilter;
    const matchesCategory = !categoryFilter || message.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getMessageStats = () => {
    return {
      total: messages.length,
      unread: messages.filter(m => m.status === 'unread').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      urgent: messages.filter(m => m.priority === 'urgent').length,
      agentInquiries: messages.filter(m => m.category === 'agent inquiry').length,
      generalInquiries: messages.filter(m => m.category === 'general inquiry').length
    };
  };

  const displayStats = getMessageStats();

  const MessageDetailsModal = ({ message, onClose }) => {
    if (!message) return null;

    const StatusIcon = statusIcons[message.status];
    const PriorityIcon = priorityIcons[message.priority];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{message.subject}</h2>
                <p className="text-gray-600 mt-1">From: {message.sender} ({message.email})</p>
                {message.phone && (
                  <p className="text-gray-600">Phone: {message.phone}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                <StatusIcon size={14} className="mr-1" />
                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[message.category]}`}>
                {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {message.date} at {message.time}
              </span>
            </div>

            {/* Agent Information for Agent Inquiries */}
            {message.category === 'agent inquiry' && message.selectedAgent && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-green-600" />
                  <span className="font-semibold text-green-800">Selected Agent</span>
                </div>
                <p className="text-green-700">
                  <strong>{message.selectedAgent}</strong> - {message.agentSpecialty}
                </p>
              </div>
            )}

            {/* Crop Type Information */}
            {message.cropType && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700">
                  <strong>Crop Type:</strong> {message.cropType.charAt(0).toUpperCase() + message.cropType.slice(1)}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Original Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">
                  {message.category === 'agent inquiry' ? 'Agent Consultation Request' : 'Message'}
                </h3>
                <div className="flex gap-2">
                  
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{message.message}</p>
            </div>

            {/* Replies */}
            {message.replies.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Replies</h3>
                <div className="space-y-3">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-800">{reply.sender}</span>
                        <span className="text-sm text-blue-600">{reply.date} at {reply.time}</span>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Messages Management</h1>
        <button
          onClick={() => {
            loadContacts();
            loadStats();
          }}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="font-medium flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            Loading messages...
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-blue-600" />
            <div>
              <div className="text-xs text-blue-600 font-medium">Total</div>
              <div className="text-xl font-bold text-blue-800">{displayStats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-yellow-600" />
            <div>
              <div className="text-xs text-yellow-600 font-medium">Unread</div>
              <div className="text-xl font-bold text-yellow-800">{displayStats.unread}</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Reply size={20} className="text-purple-600" />
            <div>
              <div className="text-xs text-purple-600 font-medium">Replied</div>
              <div className="text-xl font-bold text-purple-800">{displayStats.replied}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <div className="text-xs text-green-600 font-medium">Resolved</div>
              <div className="text-xl font-bold text-green-800">{displayStats.resolved}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <User size={20} className="text-green-600" />
            <div>
              <div className="text-xs text-green-600 font-medium">Agent Req.</div>
              <div className="text-xl font-bold text-green-800">{displayStats.agentInquiries}</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <div>
              <div className="text-xs text-blue-600 font-medium">General</div>
              <div className="text-xl font-bold text-blue-800">{displayStats.generalInquiries}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages by subject, sender, agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Priority</option>
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent/Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMessages.map((message) => {
                const StatusIcon = statusIcons[message.status];
                const PriorityIcon = priorityIcons[message.priority];
                
                return (
                  <tr key={message.id} className={`hover:bg-gray-50 ${message.status === 'unread' ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm ${message.status === 'unread' ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                          {message.subject}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {message.message.length > 60 ? `${message.message.substring(0, 60)}...` : message.message}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[message.category]}`}>
                          {message.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{message.sender}</div>
                        <div className="text-sm text-gray-500">{message.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {message.selectedAgent ? (
                          <div>
                            <div className="text-sm font-medium text-green-700">{message.selectedAgent}</div>
                            <div className="text-xs text-green-600">{message.agentSpecialty}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">General Inquiry</div>
                        )}
                        {message.cropType && (
                          <div className="text-xs text-blue-600 mt-1">
                            Crop: {message.cropType.charAt(0).toUpperCase() + message.cropType.slice(1)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{message.date}</div>
                      <div className="text-sm text-gray-500">{message.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                        <StatusIcon size={14} className="mr-1" />
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowMessageDetails(true);
                            if (message.status === 'unread') {
                              updateMessageStatus(message.id, 'read');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Message"
                        >
                          <Eye size={16} />
                        </button>
                        <select
                          value={message.status}
                          onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Message"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMessages.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter || priorityFilter || categoryFilter ? 'No messages found matching your search/filter.' : 'No messages found.'}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {showMessageDetails && (
        <MessageDetailsModal
          message={selectedMessage}
          onClose={() => {
            setShowMessageDetails(false);
            setSelectedMessage(null);
            setShowReplyForm(false);
            setReplyText('');
          }}
        />
      )}
    </div>
  );
};

export default Messages;