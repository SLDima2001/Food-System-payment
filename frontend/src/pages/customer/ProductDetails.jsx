import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getProduct(productId);
        const p = data.product;
        // Derive fields for old template expectations
        const enhanced = {
          ...p,
          images: p.images && p.images.length ? p.images : (p.image ? [p.image] : ['/src/assets/1.jpg']),
          category: p.category || 'General',
          inStock: p.stock > 0,
          stockCount: p.stock,
          details: {
            origin: p.owner && p.owner.name ? p.owner.name : 'Local Farm',
            weight: '1 unit',
            organic: false,
            storage: 'Keep refrigerated',
            shelfLife: p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A'
          },
          nutritionFacts: {}
        };
        setProduct(enhanced);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || !product.id) return;
    try {
      setAdding(true);
      setAddMessage('');
      await api.addToCart(product.id, quantity);
      setAddMessage('Added to cart successfully');
      setTimeout(() => setAddMessage(''), 3000);
    } catch (e) {
      setAddMessage(e.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-gray-500">
            <li><Link to="/" className="hover:text-green-600">Home</Link></li>
            <li className="text-gray-400">›</li>
            <li><span className="hover:text-green-600 cursor-default">{product.category}</span></li>
            <li className="text-gray-400">›</li>
            <li className="text-gray-800 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="flex gap-6">
            {/* Thumbnails */}
            <div className="flex flex-col gap-4 w-28 shrink-0">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative rounded-xl border transition-all h-24 w-24 overflow-hidden bg-white ${
                    activeImage === index ? 'border-green-500 ring-1 ring-green-300' : 'border-gray-200 hover:border-green-400'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="border-2 border-green-300 rounded-2xl p-4 flex items-center justify-center w-full min-h-[480px] bg-gradient-to-b from-white to-green-50">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="max-h-[430px] object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-prose">{product.description}</p>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-3xl font-bold text-green-600">Rs {product.price}.00</span>
              {product.lastPrice && product.lastPrice > product.price && (
                <span className="text-gray-400 line-through text-lg">Rs {product.lastPrice}.00</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  In Stock • {product.stockCount} available
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Out of Stock
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-lg font-medium"
                  aria-label="Decrease quantity"
                >-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 border-x outline-none"
                  min="1"
                  max={product.stockCount}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-lg font-medium"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                className="flex-1 py-3 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#51ac37'}}
              >
                {adding ? 'Adding...' : (product.inStock ? 'Add to Cart' : 'Out of Stock')}
              </button>
            </div>
            {addMessage && (
              <div className="mb-6 p-3 rounded-md text-sm flex items-center justify-between" style={{background:'#f0fdf4', color:'#166534'}}>
                <span>{addMessage}</span>
                <button onClick={() => navigate('/cart')} className="underline font-medium">Go to Cart</button>
              </div>
            )}

            {/* Meta Data */}
            <div className="grid grid-cols-2 gap-6 text-sm mb-10">
              <div>
                <p className="text-gray-500 mb-1">Origin</p>
                <p className="font-medium text-gray-800">{product.details.origin}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Weight</p>
                <p className="font-medium text-gray-800">{product.details.weight}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Storage</p>
                <p className="font-medium text-gray-800">{product.details.storage}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Shelf Life</p>
                <p className="font-medium text-gray-800">{product.details.shelfLife}</p>
              </div>
            </div>

            {/* Share + Tags */}
            <div className="flex flex-wrap items-center gap-4 border-t pt-6">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-sm font-medium">Share:</span>
                <button className="hover:text-green-600" aria-label="Share Facebook">Fb</button>
                <button className="hover:text-green-600" aria-label="Share Twitter">Tw</button>
                <button className="hover:text-green-600" aria-label="Share Link">Link</button>
              </div>
              <div className="flex flex-wrap gap-2 ml-auto">
                {[product.category, 'Fresh', 'Inorganic'].filter(Boolean).map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;