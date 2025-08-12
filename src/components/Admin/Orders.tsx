import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle, Edit, Plus, Trash2, Save, X } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const API_BASE = 'http://localhost:4000';

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'pending': Clock,
    'processing': Package,
    'shipped': Truck,
    'delivered': CheckCircle,
    'cancelled': XCircle
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      
      // Ensure data is always an array
      const ordersArray = Array.isArray(data) ? data : (data.orders || []);
      setOrders(ordersArray);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Create new order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError('');
    try {
      // Remove any undefined or empty fields and ensure proper data types
      const cleanData = {
        order_number: orderData.order_number?.toString() || '',
        customer_first_name: orderData.customer_first_name?.toString() || '',
        customer_last_name: orderData.customer_last_name?.toString() || '',
        customer_email: orderData.customer_email?.toString() || '',
        customer_phone: orderData.customer_phone?.toString() || '',
        shipping_address: orderData.shipping_address?.toString() || '',
        shipping_city: orderData.shipping_city?.toString() || '',
        shipping_postal_code: orderData.shipping_postal_code?.toString() || '',
        shipping_province: orderData.shipping_province?.toString() || '',
        subtotal: parseFloat(orderData.subtotal || 0).toFixed(2),
        shipping_cost: parseFloat(orderData.shipping_cost || 0).toFixed(2),
        total: parseFloat(orderData.total || 0).toFixed(2),
        status: orderData.status || 'pending'
      };

      console.log('Creating order with data:', cleanData); // Debug log

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Create order error:', response.status, errorData);
        throw new Error(`Failed to create order: ${response.status} - ${errorData}`);
      }

      await fetchOrders(); // Refresh the list
      setShowCreateModal(false);
    } catch (err) {
      console.error('Create order error:', err);
      setError('Failed to create order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order
  const updateOrder = async (orderId, orderData) => {
    setLoading(true);
    setError('');
    try {
      // Clean and format the data similar to create
      const cleanData = {
        order_number: orderData.order_number?.toString() || '',
        customer_first_name: orderData.customer_first_name?.toString() || '',
        customer_last_name: orderData.customer_last_name?.toString() || '',
        customer_email: orderData.customer_email?.toString() || '',
        customer_phone: orderData.customer_phone?.toString() || '',
        shipping_address: orderData.shipping_address?.toString() || '',
        shipping_city: orderData.shipping_city?.toString() || '',
        shipping_postal_code: orderData.shipping_postal_code?.toString() || '',
        shipping_province: orderData.shipping_province?.toString() || '',
        subtotal: parseFloat(orderData.subtotal || 0).toFixed(2),
        shipping_cost: parseFloat(orderData.shipping_cost || 0).toFixed(2),
        total: parseFloat(orderData.total || 0).toFixed(2),
        status: orderData.status || 'pending'
      };

      console.log('Updating order', orderId, 'with data:', cleanData); // Debug log

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Update order error:', response.status, errorData);
        throw new Error(`Failed to update order: ${response.status} - ${errorData}`);
      }

      await fetchOrders(); // Refresh the list
      setEditingOrder(null);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        // Update the selected order in the details modal
        const updatedOrders = Array.isArray(orders) ? orders : [];
        const updatedOrder = updatedOrders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (err) {
      console.error('Update order error:', err);
      setError('Failed to update order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    setLoading(true);
    setError('');
    try {
      console.log('Deleting order:', orderId); // Debug log

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete order error:', response.status, errorData);
        throw new Error(`Failed to delete order: ${response.status} - ${errorData}`);
      }

      await fetchOrders(); // Refresh the list
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDetails(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Delete order error:', err);
      setError('Failed to delete order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update order status quickly
  const updateOrderStatus = async (orderId, newStatus) => {
    const order = Array.isArray(orders) ? orders.find(o => o.id === orderId) : null;
    if (!order) return;

    await updateOrder(orderId, { ...order, status: newStatus });
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const searchFields = [
      order.order_number,
      order.customer_first_name,
      order.customer_last_name,
      order.customer_email
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getOrderStats = () => {
    // Ensure orders is always an array before calculating stats
    const ordersArray = Array.isArray(orders) ? orders : [];
    
    const stats = {
      total: ordersArray.length,
      pending: ordersArray.filter(o => o.status === 'pending').length,
      processing: ordersArray.filter(o => o.status === 'processing').length,
      shipped: ordersArray.filter(o => o.status === 'shipped').length,
      delivered: ordersArray.filter(o => o.status === 'delivered').length,
      cancelled: ordersArray.filter(o => o.status === 'cancelled').length,
      totalRevenue: ordersArray.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  // Order Form Component
  const OrderForm = ({ order, onSubmit, onCancel, title }) => {
    const [formData, setFormData] = useState({
      order_number: order?.order_number || '',
      customer_first_name: order?.customer_first_name || '',
      customer_last_name: order?.customer_last_name || '',
      customer_email: order?.customer_email || '',
      customer_phone: order?.customer_phone || '',
      shipping_address: order?.shipping_address || '',
      shipping_city: order?.shipping_city || '',
      shipping_postal_code: order?.shipping_postal_code || '',
      shipping_province: order?.shipping_province || '',
      subtotal: order?.subtotal || '0.00',
      shipping_cost: order?.shipping_cost || '0.00',
      total: order?.total || '0.00',
      status: order?.status || 'pending'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        
        // Auto-calculate total when subtotal or shipping cost changes
        if (name === 'subtotal' || name === 'shipping_cost') {
          const subtotal = parseFloat(name === 'subtotal' ? value : updated.subtotal) || 0;
          const shipping = parseFloat(name === 'shipping_cost' ? value : updated.shipping_cost) || 0;
          updated.total = (subtotal + shipping).toFixed(2);
        }
        
        return updated;
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="customer_first_name"
                  value={formData.customer_first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="customer_last_name"
                  value={formData.customer_last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <input
                type="text"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="shipping_city"
                  value={formData.shipping_city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="shipping_postal_code"
                  value={formData.shipping_postal_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  type="text"
                  name="shipping_province"
                  value={formData.shipping_province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input
                  type="number"
                  step="0.01"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
                <input
                  type="number"
                  step="0.01"
                  name="shipping_cost"
                  value={formData.shipping_cost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <input
                  type="number"
                  step="0.01"
                  name="total"
                  value={formData.total}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Order Details Modal
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Order Details - {order.order_number}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingOrder(order)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {order.customer_first_name} {order.customer_last_name}</p>
                  <p><span className="font-medium">Email:</span> {order.customer_email}</p>
                  <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
                  <p><span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Status</h3>
                <div className="space-y-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                    {React.createElement(statusIcons[order.status], { size: 16, className: "mr-2" })}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <p className="text-gray-600">
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">${parseFloat(order.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Order
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-blue-600" />
            <div>
              <div className="text-sm text-blue-600 font-medium">Total Orders</div>
              <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-yellow-600" />
            <div>
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <div className="text-sm text-green-600 font-medium">Delivered</div>
              <div className="text-2xl font-bold text-green-800">{stats.delivered}</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-purple-600" />
            <div>
              <div className="text-sm text-purple-600 font-medium">Revenue</div>
              <div className="text-2xl font-bold text-purple-800">${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders by number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer_first_name} {order.customer_last_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        <StatusIcon size={14} className="mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || statusFilter ? 'No orders found matching your search/filter.' : 'No orders found.'}
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading orders...
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <OrderForm
          title="Create New Order"
          onSubmit={createOrder}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <OrderForm
          title="Edit Order"
          order={editingOrder}
          onSubmit={(data) => updateOrder(editingOrder.id, data)}
          onCancel={() => setEditingOrder(null)}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;