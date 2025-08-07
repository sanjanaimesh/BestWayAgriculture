import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/Providers/AuthProvider';

const UserLogin = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setSuccessMessage(`Login successful! Welcome ${userRole === 'admin' ? 'Admin' : 'User'}`);
      setError('');
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } else {
      setError('Invalid credentials');
      setSuccessMessage('');
    }
  };

  // If already authenticated, show status
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Already Logged In</h2>
          <p className="text-gray-700 mb-4">
            You are logged in as: <strong>{userRole}</strong>
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Go to Home
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
              >
                Go to Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">User Login</h2>
        <p className="text-gray-600 mb-4 text-center text-sm">
          Demo credentials: user / userpass or admin / password
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}
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
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;