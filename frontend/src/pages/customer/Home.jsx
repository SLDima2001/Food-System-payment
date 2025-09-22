import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts();
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredProducts = products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const category = product.category || 'General';
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16" style={{backgroundColor: '#0b2f00'}}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Fresh Produce Delivered to Your Door
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Quality fruits and vegetables from local farmers
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* ✅ New Button Added */}
          <div className="mt-6">
            <Link
              to="/farmer/subscription"   // <-- Change this path to wherever you want it to navigate
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Go to About Page
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {['All', 'Fruits', 'Vegetables'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? '#51ac37' : undefined
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Our Fresh Products
          </h2>
          {error && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 text-red-700 border border-red-200 p-4 rounded">
              {error}
            </div>
          )}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => {
                const pid = product.id || product._id;
                return (
                  <div key={pid} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                    <Link to={`/product/${pid}`} className="block focus:outline-none focus:ring-2 focus:ring-green-500">
                      <img
                        src={product.image || (product.images && product.images[0]) || '/src/assets/1.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </Link>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/product/${pid}`} className="text-xl font-semibold text-gray-800 hover:text-green-600">
                          {product.name}
                        </Link>
                        <span className="text-sm px-2 py-1 rounded-full text-white" style={{backgroundColor: '#51ac37'}}>
                          {product.category || 'General'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold" style={{color: '#51ac37'}}>
                          ${product.price}
                        </span>
                        <Link
                          to={`/product/${pid}`}
                          className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                          style={{backgroundColor: '#51ac37'}}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
