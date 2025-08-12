import { LayoutDashboard, Package, ShoppingCart, MessageCircle, Users } from 'lucide-react';

const SideNav = ({ activeItem, onNavClick }) => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { label: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { label: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { label: 'Messages', icon: <MessageCircle size={20} />, path: '/admin/messages' },
    { label: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white shadow-lg flex flex-col p-4">
      <div className="text-2xl font-bold mb-8 text-center">Admin Panel</div>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavClick(item.path)}
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
  );
};

export default SideNav;