import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getCart();
      setCart(data);
    } catch (e) {
      setError(e.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCart(); }, []);

  const items = cart?.cart?.items || [];

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      setUpdating(true);
      if (newQuantity === 0) {
        await api.removeFromCart(productId);
      } else {
        await api.updateCartItem(productId, newQuantity);
      }
      await loadCart();
    } catch (e) {
      setError(e.message || 'Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (productId) => {
    await updateQuantity(productId, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const p = item.productId; if (!p) return total; return total + (p.price * item.quantity);
    }, 0);
  };
  const getTax = () => 0; // Tax disabled
  const getShipping = () => 0; // Shipping removed
  const getTotal = () => getSubtotal() + getTax() + getShipping();

  // New function to handle direct payment
  const proceedToPayment = () => {
    if (items.length === 0) return;
    
    // Store cart data in sessionStorage for checkout
    const cartData = {
      items: items.map(item => ({
        productId: item.productId._id || item.productId,
        productName: item.productId.productName || 'Product',
        quantity: item.quantity,
        price: item.productId.price || 0
      })),
      subtotal: getSubtotal(),
      total: getTotal()
    };
    
    sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));
    navigate('/checkout');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Loading cart...</div></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-red-600 mb-4">{error}</p><button onClick={loadCart} className="px-4 py-2 rounded text-white" style={{background:'#51ac37'}}>Retry</button></div></div>;
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.4 7M7 13l-1.4-7m0 0l-.6-3M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh produce to get started!</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#51ac37'}}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Cart Items ({items.length})</h2>
                <button
                  onClick={async () => { await api.clearCart(); await loadCart(); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                  disabled={updating}
                >Clear Cart</button>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map(item => {
                  const p = item.productId || {}; const pid = p._id || item.productId;
                  return (
                    <div key={pid} className="p-6 flex items-center space-x-4">
                      <img
                        src={(p.images && p.images[0]) || '/src/assets/1.jpg'}
                        alt={p.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link to={`/product/${pid}`} className="text-lg font-semibold text-gray-800 hover:text-green-600">
                          {p.productName || 'Product'}
                        </Link>
                        <p className="text-sm text-gray-500">In Stock: {p.quantityInStock ?? '—'}</p>
                        <p className="text-lg font-medium" style={{color: '#51ac37'}}>
                          Rs {p.price}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(pid, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={updating}
                        >-</button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(pid, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          disabled={updating || (p.quantityInStock && item.quantity >= p.quantityInStock)}
                        >+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800">
                          Rs {p.price * item.quantity}
                        </p>
                        <button
                          onClick={() => removeItem(pid)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
                          disabled={updating}
                        >Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs {getSubtotal().toFixed(2)}</span></div>
                <div className="border-t pt-4 flex justify-between text-lg font-semibold">
                  <span>Total</span><span style={{color:'#51ac37'}}>Rs {getTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={proceedToPayment}
                  className="w-full block text-center py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                  style={{backgroundColor:'#51ac37'}}
                  disabled={updating || processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                <Link to="/" className="w-full block text-center py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Continue Shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;