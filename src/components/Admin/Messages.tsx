import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Reply, Trash2, Mail, MailOpen, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const statuses = ['unread', 'read', 'replied', 'resolved'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

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

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        subject: 'Product Inquiry - Wireless Headphones',
        sender: 'John Doe',
        email: 'john@example.com',
        phone: '+1-234-567-8900',
        message: 'Hi, I am interested in the wireless headphones you have listed. Could you provide more information about the battery life and warranty coverage? Also, do you offer any bulk discounts for purchasing multiple units?',
        status: 'unread',
        priority: 'medium',
        date: '2025-08-12',
        time: '10:30 AM',
        category: 'product inquiry',
        replies: []
      },
      {
        id: 2,
        subject: 'Order Issue - Missing Item',
        sender: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1-234-567-8901',
        message: 'I recently placed an order (ORD-002) and received the package today, but one item is missing. The order included a USB cable and power bank, but only the power bank was delivered. Please help resolve this issue.',
        status: 'replied',
        priority: 'high',
        date: '2025-08-11',
        time: '2:15 PM',
        category: 'order issue',
        replies: [
          {
            id: 1,
            sender: 'Support Team',
            message: 'We apologize for the inconvenience. We have located the missing USB cable and will ship it to you immediately with expedited shipping at no cost. You should receive tracking information within 24 hours.',
            date: '2025-08-11',
            time: '3:45 PM'
          }
        ]
      },
      {
        id: 3,
        subject: 'Technical Support - Login Issues',
        sender: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1-234-567-8902',
        message: 'I am unable to log into my account. I keep getting an error message saying "Invalid credentials" even though I am sure my password is correct. I have tried resetting my password but did not receive the reset email.',
        status: 'read',
        priority: 'high',
        date: '2025-08-10',
        time: '4:22 PM',
        category: 'technical support',
        replies: []
      },
      {
        id: 4,
        subject: 'Return Request - Smart Watch',
        sender: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1-234-567-8903',
        message: 'I purchased a smart watch last week but it is not compatible with my phone model as expected. I would like to return it and get a refund. The item is in perfect condition with all original packaging.',
        status: 'resolved',
        priority: 'low',
        date: '2025-08-09',
        time: '11:45 AM',
        category: 'return request',
        replies: [
          {
            id: 1,
            sender: 'Support Team',
            message: 'We have processed your return request. Please package the item securely and use the prepaid return label we are sending to your email. Once we receive the item, the refund will be processed within 3-5 business days.',
            date: '2025-08-09',
            time: '1:20 PM'
          }
        ]
      },
      {
        id: 5,
        subject: 'Urgent: Payment Issue',
        sender: 'David Brown',
        email: 'david@example.com',
        phone: '+1-234-567-8904',
        message: 'My payment was declined multiple times during checkout, but I can see charges on my credit card statement. This is very concerning as I may have been charged multiple times without receiving confirmation. Please investigate this immediately.',
        status: 'unread',
        priority: 'urgent',
        date: '2025-08-12',
        time: '9:15 AM',
        category: 'payment issue',
        replies: []
      }
    ];
    setMessages(mockMessages);
  }, []);

  const updateMessageStatus = (messageId, newStatus) => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, status: newStatus } : message
    ));
    setSelectedMessage(prev => prev && prev.id === messageId ? { ...prev, status: newStatus } : prev);
  };

  const deleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(message => message.id !== messageId));
      if (selectedMessage && selectedMessage.id === messageId) {
        setShowMessageDetails(false);
        setSelectedMessage(null);
      }
    }
  };

  const handleReply = (messageId) => {
    if (!replyText.trim()) return;
    
    const newReply = {
      id: Date.now(),
      sender: 'Admin',
      message: replyText,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

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

    setReplyText('');
    setShowReplyForm(false);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || message.status === statusFilter;
    const matchesPriority = !priorityFilter || message.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getMessageStats = () => {
    const stats = {
      total: messages.length,
      unread: messages.filter(m => m.status === 'unread').length,
      read: messages.filter(m => m.status === 'read').length,
      replied: messages.filter(m => m.status === 'replied').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      urgent: messages.filter(m => m.priority === 'urgent').length
    };
    return stats;
  };

  const stats = getMessageStats();

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
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                <StatusIcon size={14} className="mr-1" />
                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[message.priority]}`}>
                <PriorityIcon size={14} className="mr-1" />
                {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)} Priority
              </span>
              <span className="text-sm text-gray-500">
                {message.date} at {message.time}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Original Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Original Message</h3>
                <div className="flex gap-2">
                  <select
                    value={message.status}
                    onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{message.message}</p>
              {message.phone && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Phone:</strong> {message.phone}
                </div>
              )}
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

            {/* Reply Form */}
            {showReplyForm ? (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Write Reply</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleReply(message.id)}
                    disabled={!replyText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Reply size={16} />
                  Reply to Message
                </button>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-blue-600" />
            <div>
              <div className="text-sm text-blue-600 font-medium">Total Messages</div>
              <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-yellow-600" />
            <div>
              <div className="text-sm text-yellow-600 font-medium">Unread</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.unread}</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Reply size={24} className="text-purple-600" />
            <div>
              <div className="text-sm text-purple-600 font-medium">Replied</div>
              <div className="text-2xl font-bold text-purple-800">{stats.replied}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <div className="text-sm text-green-600 font-medium">Resolved</div>
              <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <div className="text-sm text-red-600 font-medium">Urgent</div>
              <div className="text-2xl font-bold text-red-800">{stats.urgent}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages by subject, sender, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
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
                          {message.message.length > 80 ? `${message.message.substring(0, 80)}...` : message.message}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{message.sender}</div>
                        <div className="text-sm text-gray-500">{message.email}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[message.priority]}`}>
                        <PriorityIcon size={14} className="mr-1" />
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
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
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowMessageDetails(true);
                            setShowReplyForm(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Reply to Message"
                        >
                          <Reply size={16} />
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
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter || priorityFilter ? 'No messages found matching your search/filter.' : 'No messages found.'}
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