import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FarmerDashboard = () => {
  const [status, setStatus] = useState({ subscriptionPaid: false, farmerStatus: '' });
  const [loadingPay, setLoadingPay] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to decode stored token payload (simple)
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setStatus({ subscriptionPaid: !!payload.subscriptionPaid, farmerStatus: payload.farmerStatus || '' });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePay = async () => {
    try {
      setLoadingPay(true);
      setError('');
      const res = await api.paySubscription();
      setStatus({ subscriptionPaid: res.subscriptionPaid, farmerStatus: res.farmerStatus });
      // Ideally refresh token (login again) to get new payload; skipped for brevity
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPay(false);
    }
  };

  // Mock data
  const stats = {
    totalProducts: 12,
    activeOrders: 8,
    pendingOrders: 3,
    monthlyRevenue: 2450.75,
    totalSales: 156,
    avgRating: 4.8
  };

  const recentOrders = [
    {
      id: '123456',
      customer: 'John Doe',
      items: ['Fresh Apples (2kg)', 'Organic Carrots (1kg)'],
      total: 15.99,
      status: 'pending',
      date: '2024-03-15'
    },
    {
      id: '123457',
      customer: 'Jane Smith',
      items: ['Fresh Bananas (3kg)'],
      total: 8.99,
      status: 'confirmed',
      date: '2024-03-15'
    },
    {
      id: '123458',
      customer: 'Bob Wilson',
      items: ['Green Broccoli (2kg)', 'Mixed Vegetables (1kg)'],
      total: 18.97,
      status: 'shipped',
      date: '2024-03-14'
    }
  ];

  const topProducts = [
    { name: 'Fresh Apples', sold: 45, revenue: 179.55 },
    { name: 'Organic Carrots', sold: 32, revenue: 79.68 },
    { name: 'Fresh Bananas', sold: 28, revenue: 55.72 },
    { name: 'Green Broccoli', sold: 21, revenue: 62.79 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Farmer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your farm business.</p>
        </div>

        {/* Subscription / Approval Banner */}
        <div className="mb-6">
          {!status.subscriptionPaid && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold">Subscription Payment Required</div>
                <div className="text-sm">Pay the subscription to submit for admin approval.</div>
              </div>
              <button onClick={handlePay} disabled={loadingPay} className="px-4 py-2 rounded text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">
                {loadingPay ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          )}
          {status.subscriptionPaid && status.farmerStatus === 'pending_review' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
              <div className="font-semibold">Awaiting Admin Approval</div>
              <div className="text-sm">Your payment is received. An admin will review your account soon.</div>
            </div>
          )}
          {status.subscriptionPaid && status.farmerStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
              <div className="font-semibold">Account Approved</div>
              <div className="text-sm">You can add products and receive orders.</div>
            </div>
          )}
          {status.subscriptionPaid && status.farmerStatus === 'declined' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <div className="font-semibold">Account Declined</div>
              <div className="text-sm">Please contact support or update your profile details.</div>
            </div>
          )}
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-8a1 1 0 011-1h4a1 1 0 011 1v8h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeOrders}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${stats.monthlyRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalSales}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.avgRating}/5.0</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {status.subscriptionPaid && status.farmerStatus === 'approved' ? (
              <Link
                to="/farmer/products/new"
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Add Product
              </Link>
            ) : (
              <div
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
                title={
                  !status.subscriptionPaid
                    ? 'Pay subscription first'
                    : status.farmerStatus === 'pending_review'
                      ? 'Waiting admin approval'
                      : status.farmerStatus === 'declined'
                        ? 'Account declined - contact support'
                        : 'Not available yet'
                }
              >
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Add Product (Locked)
              </div>
            )}
            
            <Link
              to="/farmer/orders"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Manage Orders
            </Link>
            
            <Link
              to="/farmer/products"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              View Products
            </Link>
            
            <Link
              to="/farmer/profile"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                <Link to="/farmer/orders" className="text-sm hover:underline" style={{color: '#51ac37'}}>
                  View all
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {recentOrders.map(order => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-800">#{order.id}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">Customer: {order.customer}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Items: {order.items.join(', ')}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={{color: '#51ac37'}}>
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Top Products</h2>
                <Link to="/farmer/products" className="text-sm hover:underline" style={{color: '#51ac37'}}>
                  View all
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.sold} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{color: '#51ac37'}}>
                        ${product.revenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Farmer Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Quality Photos</h3>
              <p className="text-gray-600 text-sm">Upload high-quality photos to attract more customers</p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">Research market prices to stay competitive</p>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Fast Response</h3>
              <p className="text-gray-600 text-sm">Respond quickly to orders to improve ratings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;