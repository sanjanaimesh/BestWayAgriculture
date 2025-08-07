import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface NavigationProps {
  isMobile?: boolean;
  onMobileItemClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  isMobile = false,
  onMobileItemClick 
}) => {
  const location = useLocation();
  
  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'products', label: 'Seeds', path: '/products' },
    { id: 'agents', label: 'Expert Help', path: '/agents' },
  ];

  const handleItemClick = () => {
    if (isMobile && onMobileItemClick) {
      onMobileItemClick();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (isMobile) {
    return (
      <div className="lg:hidden py-4 border-t bg-white">
        <nav className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={handleItemClick}
              className={`block w-full text-left px-4 py-3 text-base font-medium transition-colors rounded-md mx-2 ${
                isActive(item.path)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Mobile Login Button */}
          <Link
            to="/login"
            onClick={handleItemClick}
            className={`flex items-center px-4 py-3 mx-2 text-base font-medium transition-colors rounded-md ${
              isActive('/login')
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <LogIn className="h-5 w-5 mr-2" />
            Login
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <nav className="hidden lg:flex space-x-8 items-center">
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          onClick={handleItemClick}
          className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
            isActive(item.path)
              ? 'text-green-600 bg-green-50'
              : 'text-gray-700 hover:text-green-600'
          }`}
        >
          {item.label}
        </Link>
      ))}
      
      {/* Desktop Login Button */}
      <Link
        to="/login"
        onClick={handleItemClick}
        className={`inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md transition-colors ${
          isActive('/login')
            ? 'bg-green-600 text-white'
            : 'text-green-600 bg-white hover:bg-green-50'
        }`}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Link>
    </nav>
  );
};

export default Navigation;