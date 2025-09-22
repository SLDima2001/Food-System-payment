import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ViewProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fruits', 'Vegetables', 'Herbs', 'Grains', 'Dairy', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'missing');
      
      if (!token) {
        setError('Please login to view your products.');
        navigate('/farmer/login');
        return;
      }
      
      // Call farmer-specific products endpoint
      console.log('Calling getFarmerProducts...');
      const response = await api.getFarmerProducts();
      console.log('Farmer products response:', response);
      
      // The backend returns { products: [...] }
      const products = response.products || response.list || response || [];
      console.log('Extracted products:', products);
      setProducts(products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products: ' + err.message);
      
      // Check if it's an authentication error
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        navigate('/farmer/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Delete product error:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      const updatedProduct = await api.put(`/products/${productId}`, {
        isAvailable: !currentStatus
      });
      
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, isAvailable: !currentStatus }
          : product
      ));
    } catch (error) {
      console.error('Toggle availability error:', error);
      alert('Failed to update product availability.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper functions for expiry date
  const formatExpiryDate = (expiryDate) => {
    const date = new Date(expiryDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires Today';
    if (diffDays === 1) return 'Expires Tomorrow';
    if (diffDays <= 3) return `Expires in ${diffDays} days`;
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    if (diffDays <= 30) return `Expires in ${diffDays} days`;
    return 'Fresh';
  };

  const getExpiryStatusColor = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { textColor: 'text-red-600', borderColor: 'border-red-500' };
    } else if (diffDays <= 3) {
      return { textColor: 'text-orange-600', borderColor: 'border-orange-500' };
    } else if (diffDays <= 7) {
      return { textColor: 'text-yellow-600', borderColor: 'border-yellow-500' };
    } else {
      return { textColor: 'text-green-600', borderColor: 'border-green-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
              <p className="text-gray-600 mt-2">Manage your farm products and inventory</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/farmer/products/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Add New Product
              </Link>
            </div>
          </div>
        </div>

        {/* Stock Overview Cards */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Well Stocked</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => (p.stock || p.quantity || 0) > 10).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => (p.stock || p.quantity || 0) > 0 && (p.stock || p.quantity || 0) <= 10).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {products.filter(p => (p.stock || p.quantity || 0) === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Expires Soon</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {products.filter(p => {
                      if (!p.expiryDate) return false;
                      const today = new Date();
                      const expiry = new Date(p.expiryDate);
                      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                      return diffDays >= 0 && diffDays <= 7;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' 
                ? 'No products match your current filters.' 
                : "You haven't added any products yet."}
            </p>
            <Link
              to="/farmer/products/new"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                {/* Product Image */}
                <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      product.isAvailable !== false 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {product.isAvailable !== false ? '●' : '●'}
                    </div>
                  </div>

                  {/* Expiry Warning Badge */}
                  {product.expiryDate && (() => {
                    const today = new Date();
                    const expiry = new Date(product.expiryDate);
                    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                    return diffDays <= 3 && diffDays >= 0 ? (
                      <div className="absolute top-3 left-3">
                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/90 text-white backdrop-blur-sm">
                          {diffDays === 0 ? 'Today' : `${diffDays}d`}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Product Content */}
                <div className="p-5">
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{product.name}</h3>
                  
                  {/* Price */}
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      Rs {product.price}
                    </span>
                    {product.lastPrice && product.lastPrice !== product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs {product.lastPrice}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">/ {product.unit || 'kg'}</span>
                  </div>

                  {/* Stock Level */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Stock</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        (product.stock || product.quantity || 0) > 10 ? 'bg-green-500' : 
                        (product.stock || product.quantity || 0) > 5 ? 'bg-yellow-500' : 
                        (product.stock || product.quantity || 0) > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {product.stock || product.quantity || 0}
                      </span>
                    </div>
                  </div>

                  {/* Expiry Date (Minimal) */}
                  {product.expiryDate && (
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <span className="text-gray-600">Expires</span>
                      <span className={`font-medium ${getExpiryStatusColor(product.expiryDate).textColor}`}>
                        {(() => {
                          const today = new Date();
                          const expiry = new Date(product.expiryDate);
                          const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                          if (diffDays < 0) return 'Expired';
                          if (diffDays === 0) return 'Today';
                          if (diffDays <= 7) return `${diffDays}d`;
                          return formatExpiryDate(product.expiryDate);
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/farmer/products/edit/${product.id}`)}
                      className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                      className={`font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm ${
                        product.isAvailable !== false
                          ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      {product.isAvailable !== false ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewProducts;