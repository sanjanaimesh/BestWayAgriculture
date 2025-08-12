import React from 'react';
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

const Dashboard = () => {
  // Mock data - replace with real data from your API
  const stats = {
    totalRevenue: 24500,
    totalOrders: 1234,
    totalProducts: 156,
    totalUsers: 890,
    revenueChange: 12.5,
    ordersChange: 8.3,
    productsChange: 3.2,
    usersChange: 15.7
  };

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 129.99, status: 'Completed', date: '2025-08-12' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 89.50, status: 'Processing', date: '2025-08-12' },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 199.99, status: 'Shipped', date: '2025-08-11' },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 59.99, status: 'Pending', date: '2025-08-11' },
  ];

  const topProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 245, revenue: 12250 },
    { id: 2, name: 'Smart Watch', sales: 189, revenue: 37800 },
    { id: 3, name: 'Laptop Stand', sales: 167, revenue: 5010 },
    { id: 4, name: 'USB-C Cable', sales: 423, revenue: 8460 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-blue-100 mt-1">
                <TrendingUp size={16} className="inline mr-1" />
                +{stats.revenueChange}% from last month
              </p>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
              <p className="text-sm text-green-100 mt-1">
                <TrendingUp size={16} className="inline mr-1" />
                +{stats.ordersChange}% from last month
              </p>
            </div>
            <ShoppingCart size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm text-purple-100 mt-1">
                <TrendingUp size={16} className="inline mr-1" />
                +{stats.productsChange}% from last month
              </p>
            </div>
            <Package size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-orange-100 mt-1">
                <TrendingUp size={16} className="inline mr-1" />
                +{stats.usersChange}% from last month
              </p>
            </div>
            <Users size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                  <p className="text-xs text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">${order.amount}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Top Selling Products</h2>
            <BarChart3 size={24} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">${product.revenue.toLocaleString()}</p>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((product.sales / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Package size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium">Add Product</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ShoppingCart size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium">View Orders</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Users size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium">Manage Users</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <BarChart3 size={24} className="mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-medium">View Analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;