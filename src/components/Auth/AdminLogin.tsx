import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/Providers/AuthProvider';

const AdminLogin = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, userRole, logout } = useAuth();
  const navigate = useNavigate();

  // Add useEffect to handle navigation when userRole changes
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole && userRole !== 'admin') {
      setError('Access denied. Admin credentials required.');
      // Logout non-admin users who try to access admin page
      logout();
    }
  }, [userRole, navigate, logout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    const success = login(username, password);
    
    if (!success) {
      setError('Invalid credentials');
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <p className="text-gray-600 mb-4 text-center text-sm">
          Admin access only. Use: admin / password
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Login as Admin
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;