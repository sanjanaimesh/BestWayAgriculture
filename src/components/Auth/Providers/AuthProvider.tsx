import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type UserRole = 'admin' | 'user';

type User = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  [key: string]: any;
};

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: User | null;
  login: (username: string, password: string, role?: UserRole, userData?: User) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  user: null,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    const savedUser = localStorage.getItem('user');
    
    if (savedAuth && savedUser) {
      try {
        const { isAuthenticated: savedIsAuth, userRole: savedRole } = JSON.parse(savedAuth);
        const userData = JSON.parse(savedUser);
        
        if (savedIsAuth && savedRole && userData) {
          setIsAuthenticated(savedIsAuth);
          setUserRole(savedRole);
          setUser(userData);
          console.log('Auth state restored from localStorage:', { savedIsAuth, savedRole, userData });
        }
      } catch (error) {
        console.error('Error loading auth state from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('authState');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    const authState = {
      isAuthenticated,
      userRole
    };
    
    if (isAuthenticated && userRole && user) {
      localStorage.setItem('authState', JSON.stringify(authState));
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Auth state saved to localStorage:', authState, user);
    } else {
      localStorage.removeItem('authState');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [isAuthenticated, userRole, user]);
  
  const login = (username: string, password: string, role?: UserRole, userData?: User): boolean => {
    console.log('AuthProvider.login called with:', { username, role, userData });
    
    // If userData is provided (from successful API call), use that
    if (userData && role) {
      console.log('Using provided userData for authentication');
      setIsAuthenticated(true);
      setUserRole(role);
      setUser(userData);
      return true;
    }
    
    // Fallback to hardcoded credentials for admin access (if no userData provided)
    if (username === 'admin' && password === 'password') {
      console.log('Using hardcoded admin credentials');
      setIsAuthenticated(true);
      setUserRole('admin');
      setUser({ username: 'admin', role: 'admin' });
      return true;
    }
    
    // Fallback for testing
    if (username === 'user' && password === 'userpass') {
      console.log('Using hardcoded user credentials');
      setIsAuthenticated(true);
      setUserRole('user');
      setUser({ username: 'user', role: 'user' });
      return true;
    }
    
    console.log('Authentication failed in AuthProvider');
    return false;
  };
  
  const logout = () => {
    console.log('Logging out user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    // localStorage will be cleared by the useEffect
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};