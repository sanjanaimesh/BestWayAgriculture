import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/Providers/AuthProvider';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  province: string;
  username: string;
  password: string;
}

const UserLogin = (): JSX.Element => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Registration form state
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    province: '',
    username: '',
    password: ''
  });

  const { login, isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setSuccessMessage(`Login successful! Welcome ${userRole === 'admin' ? 'Admin' : 'User'}`);
      setError('');
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

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!registrationData.firstName.trim() || !registrationData.lastName.trim() || 
        !registrationData.email.trim() || !registrationData.mobile.trim() || 
        !registrationData.province || !registrationData.username.trim() || 
        !registrationData.password.trim()) {
      setError('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Mobile validation (basic Sri Lankan format)
    const mobileRegex = /^(\+94|0)?[7-9]\d{8}$/;
    if (!mobileRegex.test(registrationData.mobile)) {
      setError('Please enter a valid mobile number');
      return;
    }

    // Password validation
    if (registrationData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Here you would typically call a registration API
    // For now, we'll just show a success message
    setSuccessMessage('Registration successful! You can now login with your credentials.');
    setError('');
    
    // Reset form and switch to login mode
    setRegistrationData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      province: '',
      username: '',
      password: ''
    });
    
    setTimeout(() => {
      setIsLoginMode(true);
      setSuccessMessage('');
    }, 2000);
  };

  const handleRegistrationChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    logout();
    setSuccessMessage('');
    setError('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccessMessage('');
    // Reset forms
    setUsername('');
    setPassword('');
    setRegistrationData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      province: '',
      username: '',
      password: ''
    });
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
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Go to Home
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
              >
                Go to Admin Panel
              </button>
            )}
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-6 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 ${
              isLoginMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition duration-200 ${
              !isLoginMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'User Login' : 'User Registration'}
        </h2>

        {isLoginMode && (
          <p className="text-gray-600 mb-4 text-center text-sm">
            Demo credentials: user / userpass or admin / password
          </p>
        )}

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4 text-center">{successMessage}</p>}

        {isLoginMode ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit}>
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
              Login
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegistrationSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={registrationData.firstName}
                  onChange={(e) => handleRegistrationChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={registrationData.lastName}
                  onChange={(e) => handleRegistrationChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.email}
                onChange={(e) => handleRegistrationChange('email', e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                placeholder="077XXXXXXX or +94XXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.mobile}
                onChange={(e) => handleRegistrationChange('mobile', e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="province">Province</label>
              <select
                id="province"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.province}
                onChange={(e) => handleRegistrationChange('province', e.target.value)}
                required
              >
                <option value="">Select Province</option>
                {sriLankanProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="regUsername">Store Name</label>
              <input
                id="regUsername"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.username}
                onChange={(e) => handleRegistrationChange('username', e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="regPassword">Password</label>
              <input
                id="regPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.password}
                onChange={(e) => handleRegistrationChange('password', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
            >
              Register
            </button>
          </form>
        )}

        {isLoginMode && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Admin Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;