import React from 'react';
import { Sprout, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navigation from './Nav';

interface Nav {
  activeSection: string;
  setActiveSection: (section: string) => void;
  setIsCartOpen: (isOpen: boolean) => void;
}

const Nav: React.FC<Nav> = ({ activeSection, setActiveSection, setIsCartOpen }) => {
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveSection('home')}>
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">BestWayAgriculture</span>
          </div>

          {/* Desktop Navigation */}
          <Navigation 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <Navigation 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            isMobile={true}
            onMobileItemClick={closeMobileMenu}
          />
        )}
      </div>
    </header>
  );
};

export default Nav;