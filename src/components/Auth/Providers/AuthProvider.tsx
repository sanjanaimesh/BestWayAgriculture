import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  
  const login = (username: string, password: string): boolean => {
    // Check for admin credentials
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    // Check for user credentials (you can add more user accounts here)
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
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};