import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

const ProductCatalog: React.FC = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products: Product[] = [
    {
      id: 1,
      name: 'Hybrid Tomato Seeds',
      price: 2599,
      image: 'https://images.pexels.com/photos/533346/pexels-photo-533346.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'vegetables',
      description: 'High-yield hybrid tomato variety with excellent disease resistance',
      stock: 50
    },
    {
      id: 2,
      name: 'Organic Carrot Seeds',
      price: 1799,
      image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'vegetables',
      description: 'Premium organic carrot seeds for sweet, crisp carrots',
      stock: 75
    },
    {
      id: 3,
      name: 'Sunflower Seeds',
      price: 3199,
      image: 'https://images.pexels.com/photos/36729/sunflower-yellow-flower-macro.jpg?auto=compress&cs=tinysrgb&w=400',
      category: 'flowers',
      description: 'Giant sunflower variety that grows up to 12 feet tall',
      stock: 30
    },
    {
      id: 4,
      name: 'Wheat Seeds',
      price: 5199,
      image: 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'grains',
      description: 'High-protein winter wheat variety for commercial farming',
      stock: 100
    },
    {
      id: 5,
      name: 'Bell Pepper Seeds',
      price: 2199,
      image: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'vegetables',
      description: 'Mixed color bell pepper seeds for colorful harvests',
      stock: 45
    },
    {
      id: 6,
      name: 'Corn Seeds',
      price: 3799,
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'grains',
      description: 'Sweet corn variety perfect for home gardens',
      stock: 60
    }
  ];

  const categories = [
    { id: 'all', name: 'All Seeds' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'grains', name: 'Grains' },
    { id: 'flowers', name: 'Flowers' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Premium Seed Collection
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Browse our extensive catalog of high-quality seeds for all your agricultural needs
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search seeds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            />
          </div>
          <div className="flex items-center space-x-2 justify-center sm:justify-start">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base min-w-[140px]"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 sm:h-52 object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">LKR {product.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">{product.stock} in stock</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-base"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCatalog;