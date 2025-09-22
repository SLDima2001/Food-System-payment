import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock orders data
  const orders = [
    {
      id: '123456',
      date: '2024-03-15',
      status: 'delivered',
      total: 25.99,
      items: [
        { name: 'Fresh Apples', quantity: 2, price: 3.99 },
        { name: 'Organic Carrots', quantity: 1, price: 2.49 },
        { name: 'Fresh Bananas', quantity: 3, price: 1.99 }
      ],
      deliveredDate: '2024-03-17',
      trackingNumber: 'GH123456789'
    },
    {
      id: '123455',
      date: '2024-03-10',
      status: 'in_transit',
      total: 18.47,
      items: [
        { name: 'Green Broccoli', quantity: 2, price: 2.99 },
        { name: 'Fresh Oranges', quantity: 1, price: 4.49 }
      ],
      estimatedDelivery: '2024-03-16',
      trackingNumber: 'GH123455678'
    },
    {
      id: '123454',
      date: '2024-03-05',
      status: 'processing',
      total: 32.15,
      items: [
        { name: 'Mixed Vegetables', quantity: 2, price: 5.99 },
        { name: 'Fresh Apples', quantity: 3, price: 3.99 },
        { name: 'Organic Carrots', quantity: 2, price: 2.49 }
      ],
      estimatedDelivery: '2024-03-18'
    },
    {
      id: '123453',
      date: '2024-02-28',
      status: 'cancelled',
      total: 15.98,
      items: [
        { name: 'Fresh Bananas', quantity: 4, price: 1.99 },
        { name: 'Green Broccoli', quantity: 1, price: 2.99 }
      ],
      cancelledDate: '2024-03-01',
      cancelReason: 'Customer requested cancellation'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'all', label: 'All Orders', count: orders.length },
                { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                { id: 'in_transit', label: 'In Transit', count: orders.filter(o => o.status === 'in_transit').length },
                { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders in this category yet.</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#51ac37'}}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200" style={{backgroundColor: '#f8f9fa'}}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 lg:mb-0">
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">Order Number</h3>
                        <p className="text-lg font-semibold text-gray-800">#{order.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">Order Date</h3>
                        <p className="text-lg font-semibold text-gray-800">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-600">Total</h3>
                        <p className="text-lg font-semibold" style={{color: '#51ac37'}}>${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/order/${order.id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </Link>
                        
                        {order.status === 'in_transit' && (
                          <button className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                            style={{backgroundColor: '#51ac37'}}
                          >
                            Track Order
                          </button>
                        )}
                        
                        {order.status === 'delivered' && (
                          <button className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                            style={{backgroundColor: '#51ac37'}}
                          >
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Items Ordered</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <span className="text-gray-600 ml-2">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h4>
                      <div className="space-y-3">
                        {order.status === 'delivered' && (
                          <div>
                            <p className="text-sm text-gray-600">Delivered on</p>
                            <p className="font-medium text-gray-800">{new Date(order.deliveredDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {(order.status === 'in_transit' || order.status === 'processing') && (
                          <div>
                            <p className="text-sm text-gray-600">Estimated Delivery</p>
                            <p className="font-medium text-gray-800">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {order.status === 'cancelled' && (
                          <div>
                            <p className="text-sm text-gray-600">Cancelled on</p>
                            <p className="font-medium text-gray-800">{new Date(order.cancelledDate).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mt-2">Reason: {order.cancelReason}</p>
                          </div>
                        )}
                        
                        {order.trackingNumber && (
                          <div>
                            <p className="text-sm text-gray-600">Tracking Number</p>
                            <p className="font-medium text-gray-800">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                {order.status === 'processing' && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Modify Order
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Email Support</h3>
              <p className="text-gray-600">support@greenharvest.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Phone Support</h3>
              <p className="text-gray-600">(123) 456-7890</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">FAQ</h3>
              <Link to="/faq" className="text-gray-600 hover:underline">
                View common questions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;