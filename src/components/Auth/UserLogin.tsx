import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/Auth/Providers/AuthProvider';

const API_BASE_URL = 'http://localhost:4000';

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
  const [loading, setLoading] = useState(false);
  
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

  const { login, isAuthenticated, userRole, user, logout } = useAuth();
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

  // Debug: Check what's stored in localStorage
  useEffect(() => {
    console.log('Current user in localStorage:', localStorage.getItem('user'));
    console.log('Current token in localStorage:', localStorage.getItem('token'));
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Add input validation
    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    console.log('Attempting login with:', { username, password: '***' }); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(), 
          password: password
        }),
      });

      console.log('Login response status:', response.status); 
      const data = await response.json();
      console.log('Login response data:', data); 

      if (response.ok && data.success) {
        
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
        }
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        console.log('Calling AuthProvider login with:', {
          username: username.trim(),
          userRole: data.data?.user?.role || 'user',
          userData: data.data?.user
        });
        
        // Call the login method from AuthProvider with proper parameters
        const authSuccess = login(
          username.trim(), 
          password, 
          (data.data?.user?.role as 'admin' | 'user') || 'user',
          data.data?.user 
        );
        
        console.log('AuthProvider login result:', authSuccess);
        
        if (authSuccess !== false) {
          setSuccessMessage(`Login successful! Welcome ${data.data?.user?.firstName || 'User'}`);
          setTimeout(() => {
            if (data.data?.user?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setError('Authentication failed. Please check your credentials.');
        }
      } else {
        // Handle different types of errors
        if (response.status === 401) {
          setError('Invalid username or password');
        } else if (response.status === 400) {
          setError(data.message || 'Invalid request');
        } else if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Basic validation with trimming
    const trimmedData = {
      firstName: registrationData.firstName.trim(),
      lastName: registrationData.lastName.trim(),
      email: registrationData.email.trim().toLowerCase(),
      mobile: registrationData.mobile.trim(),
      province: registrationData.province,
      username: registrationData.username.trim(),
      password: registrationData.password
    };

    if (!trimmedData.firstName || !trimmedData.lastName || 
        !trimmedData.email || !trimmedData.mobile || 
        !trimmedData.province || !trimmedData.username || 
        !trimmedData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Mobile validation (basic Sri Lankan format)
    const mobileRegex = /^(\+94|0)?[7-9]\d{8}$/;
    if (!mobileRegex.test(trimmedData.mobile)) {
      setError('Please enter a valid mobile number');
      setLoading(false);
      return;
    }

    // Password validation
    if (trimmedData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Username validation
    if (trimmedData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    console.log('Attempting registration with:', { ...trimmedData, password: '***' }); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedData),
      });

      console.log('Registration response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Registration response data:', data); // Debug log

      if (response.ok && data.success) {
        setSuccessMessage('Registration successful! You can now login with your credentials.');
        
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
        
        // Set the username and password for easy login
        setUsername(trimmedData.username);
        setPassword('');
        
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccessMessage('You can now login with your new credentials.');
        }, 2000);
      } else {
        // Handle different registration errors
        if (response.status === 409 || data.message?.includes('already exists')) {
          setError('Username or email already exists. Please choose different ones.');
        } else if (response.status === 400) {
          setError(data.message || 'Invalid registration data');
        } else {
          setError(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationChange = (field: keyof RegistrationData, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = async () => {
    try {
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call logout from auth provider
      logout();
      
      setSuccessMessage('Logged out successfully');
      setError('');
      
      // Reset form fields
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
      
    } catch (error) {
      console.error('Logout error:', error);
      setError('Error during logout');
    }
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
  // if (isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="p-8 bg-white shadow-md rounded-md w-full max-w-md text-center">
  //         <h2 className="text-2xl font-bold mb-4 text-green-600">Already Logged In</h2>
  //         <p className="text-gray-700 mb-2">
  //           Welcome <strong>{user?.firstName} {user?.lastName}</strong>!
  //         </p>
  //         <p className="text-gray-700 mb-4">
  //           Role: <strong>{userRole}</strong>
  //         </p>
  //         <div className="space-y-2">
  //           <button
  //             onClick={() => navigate('/')}
  //             className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
  //           >
  //             Go to Home
  //           </button>
  //           {userRole === 'admin' && (
  //             <button
  //               onClick={() => navigate('/admin')}
  //               className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
  //             >
  //               Go to Admin Panel
  //             </button>
  //           )}
  //           <button
  //             onClick={handleLogout}
  //             className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
  //             disabled={loading}
  //           >
  //             {loading ? 'Logging out...' : 'Logout'}
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
            disabled={loading}
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
            disabled={loading}
          >
            Register
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'User Login' : 'User Registration'}
        </h2>

        {isLoginMode && (
          <p className="text-gray-600 mb-4 text-center text-sm">
            Enter your credentials to login
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

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
                disabled={loading}
                required
                placeholder="Enter your username"
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
                disabled={loading}
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="mb-6 flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="text-gray-700 text-sm">
                Keep me logged in
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              <label className="block text-gray-700 mb-2" htmlFor="regUsername">User Name</label>
              <input
                id="regUsername"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={registrationData.username}
                onChange={(e) => handleRegistrationChange('username', e.target.value)}
                disabled={loading}
                required
                placeholder="Enter your store/username (min 3 characters)"
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
                disabled={loading}
                required
                placeholder="Enter password (min 6 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200 disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {isLoginMode && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-blue-500 hover:text-blue-700 text-sm"
              disabled={loading}
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