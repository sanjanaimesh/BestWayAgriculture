import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Filter } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        category: '',
        description: '',
        stock: ''
    });

    const API_BASE_URL = 'http://localhost:4000';
    const categories = ['Vegetables', 'Fruits', 'Flowers', 'Grains'];

    // API Functions
    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            } else {
                setError(data.message || 'Failed to fetch products');
            }
        } catch (error) {
            setError('Failed to connect to server');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (productData) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                setProducts([data.data, ...products]);
                return true;
            } else {
                setError(data.message || 'Failed to add product');
                return false;
            }
        } catch (error) {
            setError('Failed to connect to server');
            console.error('Error adding product:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id, productData) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (data.success) {
                setProducts(products.map(product =>
                    product.id === id ? data.data : product
                ));
                return true;
            } else {
                setError(data.message || 'Failed to update product');
                return false;
            }
        } catch (error) {
            setError('Failed to connect to server');
            console.error('Error updating product:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setProducts(products.filter(product => product.id !== id));
                return true;
            } else {
                setError(data.message || 'Failed to delete product');
                return false;
            }
        } catch (error) {
            setError('Failed to connect to server');
            console.error('Error deleting product:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Event Handlers
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            setError('Name, price, and category are required');
            return;
        }

        const productData = {
            name: formData.name,
            price: parseFloat(formData.price),
            image: formData.image || '',
            category: formData.category,
            description: formData.description || '',
            stock: parseInt(formData.stock) || 0
        };

        let success = false;

        if (editingProduct) {
            success = await updateProduct(editingProduct.id, productData);
        } else {
            success = await addProduct(productData);
        }

        if (success) {
            setFormData({ name: '', price: '', image: '', category: '', description: '', stock: '' });
            setShowProductForm(false);
            setEditingProduct(null);
            setError('');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price.toString(),
            image: product.image || '',
            category: product.category,
            description: product.description || '',
            stock: product.stock.toString()
        });
        setEditingProduct(product);
        setShowProductForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
                <button
                    onClick={() => {
                        setShowProductForm(true);
                        setEditingProduct(null);
                        setFormData({ name: '', price: '', image: '', category: '', description: '', stock: '' });
                        setError('');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    disabled={loading}
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    Loading...
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {showProductForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-bold mb-4">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="col-span-2 flex gap-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProductForm(false);
                                    setEditingProduct(null);
                                    setFormData({ name: '', price: '', image: '', category: '', description: '', stock: '' });
                                    setError('');
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{product.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                                            alt={product.name}
                                            className="h-12 w-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        Rs{parseFloat(product.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 20 ? 'bg-green-100 text-green-800' :
                                                product.stock > 5 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                disabled={loading}
                                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm || selectedCategory ? 'No products found matching your search/filter.' : 'No products found. Add your first product!'}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Package size={24} className="text-blue-600" />
                        <div>
                            <div className="text-sm text-blue-600 font-medium">Total Products</div>
                            <div className="text-2xl font-bold text-blue-800">{products.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Package size={24} className="text-green-600" />
                        <div>
                            <div className="text-sm text-green-600 font-medium">Total Stock</div>
                            <div className="text-2xl font-bold text-green-800">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Filter size={24} className="text-purple-600" />
                        <div>
                            <div className="text-sm text-purple-600 font-medium">Categories</div>
                            <div className="text-2xl font-bold text-purple-800">{new Set(products.map(p => p.category)).size}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;