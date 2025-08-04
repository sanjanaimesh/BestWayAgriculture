import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, MessageCircle, Users } from 'lucide-react';

const SideNav = () => {
  const [activeItem, setActiveItem] = useState('/admin/dashboard');

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { label: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { label: 'Messages', icon: <MessageCircle size={20} />, path: '/admin/messages' },
    { label: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  const handleNavClick = (path: string) => {
    setActiveItem(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="h-screen w-64 bg-gray-900 text-white shadow-lg flex flex-col p-4">
        <div className="text-2xl font-bold mb-8 text-center">Admin Panel</div>
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full
                ${activeItem === item.path 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content area to show the active selection */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {navItems.find(item => item.path === activeItem)?.label || 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            This is the {navItems.find(item => item.path === activeItem)?.label.toLowerCase() || 'dashboard'} page content area.
            Click on different navigation items to see the active state change.
          </p>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              Currently viewing: <span className="font-mono text-blue-600">{activeItem}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;