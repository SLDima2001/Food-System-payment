import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(storedAdmin));
    // Load pending farmers
    const loadPending = async () => {
      try {
        setLoadingFarmers(true);
        const data = await api.listPendingFarmers();
        setPendingFarmers(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingFarmers(false);
      }
    };
    if (storedAdmin) {
      loadPending();
    }
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      await api.approveFarmer(id);
      setPendingFarmers(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDecline = async (id) => {
    const reason = prompt('Reason for decline (optional)') || '';
    try {
      await api.declineFarmer(id, reason);
      setPendingFarmers(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // Mock admin statistics
  const stats = {
    totalUsers: 1250,
    totalOrders: 3480,
    totalProducts: 156,
    totalRevenue: 45670.25,
    newUsersToday: 15,
    ordersToday: 45,
    productsOutOfStock: 8,
    pendingApprovals: pendingFarmers.length
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">GreenHarvest Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{adminUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage your GreenHarvest platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-green-600">+{stats.newUsersToday} today</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOrders.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-green-600">+{stats.ordersToday} today</div>
            </div>
          </div>

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
            <div className="mt-4">
              <div className="text-sm text-red-600">{stats.productsOutOfStock} out of stock</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-green-600">↗ 12% vs last month</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Users</div>
                <div className="text-sm text-gray-600">View and manage user accounts</div>
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Products</div>
                <div className="text-sm text-gray-600">Add, edit, and remove products</div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-8a1 1 0 011-1h4a1 1 0 011 1v8h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Orders</div>
                <div className="text-sm text-gray-600">Process and track orders</div>
              </div>
            </Link>

            <div className="flex flex-col p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: '#51ac37'}}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Pending Farmers</div>
                  <div className="text-sm text-gray-600">{pendingFarmers.length} awaiting review</div>
                </div>
              </div>
              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {loadingFarmers ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : pendingFarmers.length === 0 ? (
                  <div className="text-sm text-gray-500">No pending farmers</div>
                ) : (
                  pendingFarmers.map(f => (
                    <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{f.name || f.farmName}</div>
                        <div className="text-xs text-gray-600">{f.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleApprove(f.id)} className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>
                        <button onClick={() => handleDecline(f.id)} className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Decline</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { id: '#12345', customer: 'John Doe', amount: '$45.99', status: 'Processing' },
                { id: '#12344', customer: 'Jane Smith', amount: '$32.50', status: 'Shipped' },
                { id: '#12343', customer: 'Bob Wilson', amount: '$78.25', status: 'Delivered' },
                { id: '#12342', customer: 'Alice Brown', amount: '$21.99', status: 'Processing' }
              ].map((order, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{order.id}</div>
                      <div className="text-sm text-gray-600">{order.customer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-800">{order.amount}</div>
                      <div className={`text-sm px-2 py-1 rounded-full text-xs ${
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Server Status</span>
                  <span className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Gateway</span>
                  <span className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Service</span>
                  <span className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Running
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;