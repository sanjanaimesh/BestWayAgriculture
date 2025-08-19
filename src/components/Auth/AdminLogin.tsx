import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/Providers/AuthProvider';

const AdminLogin = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, userRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Add useEffect to handle navigation when userRole changes
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole && userRole !== 'admin') {
      setError('Access denied. Admin credentials required.');
      logout();
    }
  }, [userRole, navigate, logout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    const success = login(username, password);
    
    if (!success) {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    logout();
    setError('');
  };

  // If already authenticated as admin, show status
  if (isAuthenticated && userRole === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Admin Already Logged In</h2>
          <p className="text-gray-700 mb-4">
            You are logged in as: <strong>Admin</strong>
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
            >
              Go to Admin Panel
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Go to Home
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <p className="text-gray-600 mb-4 text-center text-sm">
          Admin access only. Use: admin / password
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
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
          <div className="mb-4">
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
          <div className="mb-6 flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="text-gray-700 text-sm">
              Keep me logged in
            </label>
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