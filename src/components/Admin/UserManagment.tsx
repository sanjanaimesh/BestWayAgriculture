import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar, User, AlertTriangle, Check, X, Shield, ShieldCheck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  username: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserStats {
  totalUsers: number;
  totalCustomers: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  todayRegistrations: number;
  thisWeekRegistrations: number;
  provinceDistribution: Array<{
    province: string;
    count: number;
  }>;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showRoleConfirm, setShowRoleConfirm] = useState<{ userId: number; newRole: 'admin' | 'user' } | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    province: '',
    username: '',
    password: '',
    role: 'user'
  });

  const sriLankanProvinces = [
    'Western Province',
    'Central Province',
    'Southern Province',
    'Northern Province',
    'Eastern Province',
    'North Western Province',
    'North Central Province',
    'Uva Province',
    'Sabaragamuwa Province'
  ];

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Load users from API
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(roleFilter && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      console.log('Loading users with params:', queryParams.toString());
      
      const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Users API response:', data);

      if (response.ok && data.success) {
        setUsers(data.data.users || []);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages || 1);
        }
      } else {
        setError(data.message || 'Failed to load users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Load users error:', error);
      setError('Network error. Please check if the server is running.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user statistics

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!formData.province) return 'Province is required';
    if (!formData.username.trim()) return 'Username is required';
    if (!editingUser && !formData.password.trim()) return 'Password is required for new users';
    if (!editingUser && formData.password.length < 6) return 'Password must be at least 6 characters';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Invalid email format';
    
    // Mobile validation 
    const mobileRegex = /^(\+94|0)?[7-9]\d{8}$/;
    if (!mobileRegex.test(formData.mobile)) return 'Invalid mobile number format';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let url, method, requestData;

      if (editingUser) {
        // Update existing user
        url = `${API_BASE_URL}/api/users/profile/${editingUser.id}`;
        method = 'PUT';
        requestData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          province: formData.province,
          username: formData.username.trim()
        };
      } else {
        // Create new user
        url = `${API_BASE_URL}/api/users/register`;
        method = 'POST';
        requestData = {
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          username: formData.username.trim(),
          password: formData.password.trim()
        };
      }

      console.log('Submitting to:', url, 'Method:', method, 'Data:', requestData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('Submit response:', data);

      if (response.ok && data.success) {
        setSuccess(editingUser ? 'User updated successfully!' : 'User created successfully!');
        setShowUserForm(false);
        setEditingUser(null);
        resetForm();
        loadUsers();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      province: '',
      username: '',
      password: '',
      role: 'user'
    });
  };

  const handleEdit = (user: User) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      province: user.province,
      username: user.username,
      password: '',
      role: user.role
    });
    setEditingUser(user);
    setShowUserForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError('');

    try {
      console.log('Deleting user with ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (response.ok && data.success) {
        setSuccess('User deleted successfully!');
        loadUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Function to handle role updates
  const handleRoleUpdate = async (userId: number, newRole: 'admin' | 'user') => {
    setLoading(true);
    setError('');

    try {
      console.log('Updating user role:', { userId, newRole });
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole
        }),
      });

      const data = await response.json();
      console.log('Role update response:', data);

      if (response.ok && data.success) {
        setSuccess(`User role updated to ${newRole} successfully!`);
        loadUsers();
      } else {
        setError(data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Role update error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setShowRoleConfirm(null);
    }
  };

  // Function to initiate role change with confirmation
  const initiateRoleChange = (userId: number, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setShowRoleConfirm({ userId, newRole });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const UserDetailsModal = ({ user, onClose }: { user: User | null; onClose: () => void }) => {
    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user.firstName} {user.lastName}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-500" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-green-500" />
                    <span className="text-sm text-gray-700">{user.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-red-500" />
                    <span className="text-sm text-gray-700">{user.province}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-purple-500" />
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Username:</span>
                      <span className="ml-2 text-gray-600">{user.username}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-orange-500" />
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Joined:</span>
                      <span className="ml-2 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-500" />
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(user.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">User ID:</span>
                    <span className="ml-2 text-gray-600">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users and roles,  </p>
          </div>
          <button
            onClick={() => {
              setShowUserForm(true);
              setEditingUser(null);
              resetForm();
              setError('');
              setSuccess('');
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <UserPlus size={20} />
            Add New User
          </button>
        </div>

        

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-red-400 mr-3" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center">
              <Check className="text-green-400 mr-3" size={20} />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users.."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Edit User Form Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="077XXXXXXX or +94771234567"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Province</option>
                    {sriLankanProvinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                      resetForm();
                      setError('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || roleFilter || statusFilter ? 'No users found matching your criteria.' : 'No users found. Add your first user!'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.mobile}</div>
                        <div className="text-sm text-gray-500">{user.province}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => initiateRoleChange(user.id, user.role)}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                          title={`Click to change to ${user.role === 'admin' ? 'User' : 'Admin'}`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </button>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition-colors"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => initiateRoleChange(user.id, user.role)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-100 transition-colors"
                            title={`Change to ${user.role === 'admin' ? 'User' : 'Admin'}`}
                          >
                            {user.role === 'admin' ? <Shield size={16} /> : <ShieldCheck size={16} />}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 bg-white p-4 rounded-lg shadow-md">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Deleting...' : 'Delete User'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Confirmation Modal */}
        {showRoleConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <Shield className="text-orange-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Confirm Role Change</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to change this user's role to <strong>{showRoleConfirm.newRole}</strong>? 
                This will affect their permissions and access level.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRoleUpdate(showRoleConfirm.userId, showRoleConfirm.newRole)}
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Role'}
                </button>
                <button
                  onClick={() => setShowRoleConfirm(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowUserDetails(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;