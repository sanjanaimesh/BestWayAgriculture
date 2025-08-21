import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../components/Auth/Providers/AuthProvider'; 

const Profile = () => {
  // Core state
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { login, isAuthenticated, userRole, user, logout } = useAuth();
  
  // Password change state
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const sriLankanProvinces = [
    'Western Province', 'Central Province', 'Southern Province', 'Northern Province', 'Eastern Province',
    'North Western Province', 'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
  ];

  // Validation functions (matching your backend User model)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^(\+94|0)?[7-9]\d{8}$/;
    return mobileRegex.test(mobile);
  };

  // Get user ID from multiple sources with proper fallback
  const getUserId = () => {
    // Priority: user object from auth context
    if (user?.id) return user.id;
    
    // Fallback: localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) return storedUserId;
    
    // Last resort: parse user object from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id;
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
    }
    
    return null;
  };

  
  const fetchUserProfile = async () => {
    const userId = getUserId();
    
    if (!isAuthenticated || !userId) {
      setMessage({ type: 'error', text: 'Please log in to view your profile' });
      setInitialLoading(false);
      return;
    }
    
    try {
      setInitialLoading(true);
      console.log('Fetching user profile for ID:', userId);
      
      
      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        credentials: 'include' 
      });

      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found in database');
        } else if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API response is not JSON:', contentType);
        // Use auth context data as fallback
        if (user) {
          setEditedUser(user);
          setMessage({ type: 'info', text: 'Using cached user data. API endpoint may not be properly configured.' });
        }
        return;
      }

      const responseData = await response.json();
      console.log('Fetched fresh user data from API:', responseData);
      
      
      if (responseData.success && responseData.data) {
        setEditedUser(responseData.data);
        setMessage({ type: 'success', text: 'Profile loaded successfully!' });
      } else {
        throw new Error(responseData.message || 'Invalid response format');
      }
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Fallback to auth context data
      if (user) {
        console.log('Using auth context data as fallback:', user);
        setEditedUser(user);
        
        // Determine appropriate message based on error type
        if (error.message.includes('User not found')) {
          setMessage({ type: 'error', text: 'User profile not found in database. Using cached data.' });
        } else if (error.message.includes('Session expired')) {
          setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        } else {
          setMessage({ 
            type: 'info', 
            text: 'Using cached user data. Could not connect to server.'
          });
        }
      } else {
        setMessage({ type: 'error', text: 'No user data available. Please log in again.' });
      }
    } finally {
      setInitialLoading(false);
    }
  };

  // Load user profile on component mount
  useEffect(() => {
    if (user || localStorage.getItem('userId')) {
      fetchUserProfile();
    } else {
      setInitialLoading(false);
    }
  }, [user, isAuthenticated]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleEdit = () => {
    // Use current displayed user data for editing
    const displayUser = Object.keys(editedUser).length > 0 ? editedUser : user;
    setEditedUser({...displayUser});
    setEditMode(true);
    setPasswordMode(false);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    const displayUser = Object.keys(editedUser).length > 0 ? editedUser : user;
    setEditedUser({...displayUser});
    setEditMode(false);
    setPasswordMode(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateProfileForm = () => {
    const { firstName, lastName, email, mobile, province, username } = editedUser;

    if (!firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName?.trim()) {
      throw new Error('Last name is required');
    }
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    if (!mobile?.trim()) {
      throw new Error('Mobile number is required');
    }
    if (!province?.trim()) {
      throw new Error('Province is required');
    }
    if (!username?.trim()) {
      throw new Error('Username is required');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validateMobile(mobile)) {
      throw new Error('Invalid Sri Lankan mobile number format. Use format: +94xxxxxxxx or 0xxxxxxxx');
    }

    return true;
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) {
      throw new Error('Current password is required');
    }
    if (!newPassword) {
      throw new Error('New password is required');
    }
    if (!confirmPassword) {
      throw new Error('Password confirmation is required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New passwords do not match');
    }

    return true;
  };

  //  user profile with API endpoint and error handling
  const handleSave = async () => {
    const userId = getUserId();
    
    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found. Please log in again.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      validateProfileForm();

      // Prepare update data (only allowed fields from your User model)
      const updateData = {
        firstName: editedUser.firstName.trim(),
        lastName: editedUser.lastName.trim(),
        email: editedUser.email.trim(),
        mobile: editedUser.mobile.trim(),
        province: editedUser.province,
        username: editedUser.username.trim()
      };

      console.log('Updating user profile with data:', updateData);
      console.log('User ID:', userId);

      
      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        credentials: 'include',
        body: JSON.stringify(updateData) 
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        // Handle different error responses
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          
          if (response.status === 400) {
            throw new Error(errorData.message || 'Invalid data provided');
          } else if (response.status === 409) {
            throw new Error('Email or username already exists');
          } else if (response.status === 401) {
            throw new Error('Unauthorized access. Please log in again.');
          } else if (response.status === 404) {
            throw new Error(`User not found. User ID: ${userId}`);
          } else {
            throw new Error(errorData.message || 'Failed to update profile');
          }
        } else {
          // HTML error page or non-JSON response
          const errorText = await response.text();
          console.log('Non-JSON error response:', errorText);
          throw new Error(`Server error: ${response.status}. API endpoint may not be configured properly.`);
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response for update');
      }

      const responseData = await response.json();
      console.log('Profile updated successfully:', responseData);

     
      if (responseData.success && responseData.data) {
        setEditedUser(responseData.data);
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        // Update localStorage if user data is stored there
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(responseData.data));
        }
      } else {
        throw new Error(responseData.message || 'Update failed');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  
  const handlePasswordUpdate = async () => {
    const userId = getUserId();
    
    if (!userId) {
      setMessage({ type: 'error', text: 'User ID not found. Please log in again.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      validatePasswordForm();

      console.log('Updating user password for ID:', userId);

      
      const response = await fetch(`http://localhost:4000/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          
          if (response.status === 400) {
            throw new Error(errorData.message || 'Invalid password data');
          } else if (response.status === 401) {
            throw new Error(errorData.message || 'Current password is incorrect');
          } else if (response.status === 404) {
            throw new Error(`User not found. User ID: ${userId}`);
          } else {
            throw new Error(errorData.message || 'Failed to update password');
          }
        } else {
          throw new Error(`Server error: ${response.status}. Password API endpoint may not be configured.`);
        }
      }

      const responseData = await response.json();
      console.log('Password updated successfully:', responseData);

      if (responseData.success) {
        setPasswordMode(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ current: false, new: false, confirm: false });
        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        throw new Error(responseData.message || 'Password update failed');
      }

    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Not available';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user not found or not authenticated
  if (!isAuthenticated && !getUserId()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Available</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Use editedUser if available (from API), otherwise fallback to user from auth context
  const displayUser = Object.keys(editedUser).length > 0 ? editedUser : user || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account information and security settings</p>
          {/* Debug info - remove in production */}
          <p className="text-xs text-gray-400 mt-2">
            User ID: {getUserId()} | Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.type === 'info'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editMode ? 
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={editedUser.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-lg font-semibold w-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={editedUser.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-lg font-semibold w-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Last Name"
                          />
                        </div>
                        : `${displayUser.firstName || ''} ${displayUser.lastName || ''}`
                      }
                    </h2>
                    <p className="text-gray-600 capitalize">
                      {displayUser.role || userRole || 'user'} • {displayUser.isActive !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                {!editMode && !passwordMode && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Profile Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{displayUser.email || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Mobile Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editedUser.mobile || ''}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter mobile number (+94xxxxxxxxx or 0xxxxxxxxx)"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{displayUser.mobile || 'Not provided'}</p>
                    )}
                    {editMode && (
                      <p className="text-xs text-gray-500 mt-1">Format: +94771234567 or 0771234567</p>
                    )}
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Province
                    </label>
                    {editMode ? (
                      <select
                        value={editedUser.province || ''}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Province</option>
                        {sriLankanProvinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{displayUser.province || 'Not selected'}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Username
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedUser.username || ''}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{displayUser.username || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Profile Edit */}
                {editMode && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">Member Since</p>
                  <p className="text-gray-800 font-medium">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(displayUser.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="text-gray-800 font-medium">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(displayUser.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">User ID</p>
                  <p className="text-gray-800 font-medium">#{displayUser.id || getUserId()}</p>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h3>
              
              {!passwordMode ? (
                <button
                  onClick={() => {
                    setPasswordMode(true);
                    setEditMode(false);
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={editMode}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password (minimum 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Security Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Security Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>Use a strong password with at least 6 characters</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-orange-500" />
                  <p>Don't share your password with anyone</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                  <p>Update your password regularly for better security</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchUserProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Profile</span>
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  logout();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;