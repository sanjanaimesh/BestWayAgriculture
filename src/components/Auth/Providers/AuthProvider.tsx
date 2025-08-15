import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type UserRole = 'admin' | 'user';

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
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
  
  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const { isAuthenticated: savedIsAuth, userRole: savedRole } = JSON.parse(savedAuth);
        if (savedIsAuth && savedRole) {
          setIsAuthenticated(savedIsAuth);
          setUserRole(savedRole);
        }
      } catch (error) {
        console.error('Error loading auth state from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('authState');
      }
    }
  }, []);

  useEffect(() => {
    const authState = {
      isAuthenticated,
      userRole
    };
    
    if (isAuthenticated && userRole) {
      localStorage.setItem('authState', JSON.stringify(authState));
    } else {
      localStorage.removeItem('authState');
    }
  }, [isAuthenticated, userRole]);
  
  const login = (username: string, password: string): boolean => {
    // Check for admin credentials
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    
    else if (username === 'user' && password === 'userpass') {
      setIsAuthenticated(true);
      setUserRole('user');
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    // localStorage will be cleared by the useEffect
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};