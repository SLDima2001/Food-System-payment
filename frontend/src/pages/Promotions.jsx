import React from 'react';
import { Link } from 'react-router-dom';

const Promotions = () => {
  const promotions = [
    {
      id: 1,
      title: 'Fresh Vegetables Sale',
      description: 'Get 30% off on all fresh vegetables from local farms',
      discount: '30% OFF',
      validUntil: '2025-10-01',
      image: '/src/assets/1.jpg',
      category: 'Vegetables',
      minOrder: '$25',
      code: 'VEGGIE30'
    },
    {
      id: 2,
      title: 'Seasonal Fruits Bundle',
      description: 'Buy 3 different seasonal fruits and save 25%',
      discount: '25% OFF',
      validUntil: '2025-09-30',
      image: '/src/assets/2.png',
      category: 'Fruits',
      minOrder: '$20',
      code: 'FRUIT25'
    },
    {
      id: 3,
      title: 'Organic Produce Special',
      description: 'Premium organic vegetables and fruits at discounted prices',
      discount: '20% OFF',
      validUntil: '2025-10-15',
      image: '/src/assets/3.png',
      category: 'Organic',
      minOrder: '$35',
      code: 'ORGANIC20'
    },
    {
      id: 4,
      title: 'First Time Buyer Offer',
      description: 'Special discount for new customers on their first order',
      discount: '40% OFF',
      validUntil: '2025-12-31',
      image: '/src/assets/4.jpg',
      category: 'New Customer',
      minOrder: '$15',
      code: 'WELCOME40'
    },
    {
      id: 5,
      title: 'Bulk Order Discount',
      description: 'Order in bulk and save more on farm fresh produce',
      discount: '35% OFF',
      validUntil: '2025-11-30',
      image: '/src/assets/5.jpg',
      category: 'Bulk Order',
      minOrder: '$50',
      code: 'BULK35'
    },
    {
      id: 6,
      title: 'Weekend Special',
      description: 'Saturday and Sunday exclusive deals on selected items',
      discount: '15% OFF',
      validUntil: 'Every Weekend',
      image: '/src/assets/6.png',
      category: 'Weekend',
      minOrder: '$10',
      code: 'WEEKEND15'
    }
  ];

  const categories = ['All', 'Vegetables', 'Fruits', 'Organic', 'New Customer', 'Bulk Order', 'Weekend'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Current Promotions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing deals on fresh, locally-sourced produce. Save more while supporting local farmers.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: category === 'All' ? '#51ac37' : 'white',
                color: category === 'All' ? 'white' : '#51ac37',
                border: `2px solid #51ac37`
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={promotion.image}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span 
                    className="px-3 py-1 rounded-full text-white font-bold text-sm"
                    style={{backgroundColor: '#51ac37'}}
                  >
                    {promotion.discount}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-white text-gray-800 rounded-full text-xs font-medium">
                    {promotion.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{promotion.title}</h3>
                <p className="text-gray-600 mb-4">{promotion.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Valid Until:</span>
                    <span className="font-medium text-gray-800">{promotion.validUntil}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Min Order:</span>
                    <span className="font-medium text-gray-800">{promotion.minOrder}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Promo Code:</span>
                    <span 
                      className="font-mono font-bold px-2 py-1 rounded text-xs text-white"
                      style={{backgroundColor: '#51ac37'}}
                    >
                      {promotion.code}
                    </span>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="w-full block text-center py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: '#51ac37'}}
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Special Offers Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Special Offers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Delivery */}
            <div className="flex items-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Free Delivery</h3>
                <p className="text-gray-600">On orders over $30 within city limits</p>
              </div>
            </div>

            {/* Loyalty Program */}
            <div className="flex items-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4" style={{backgroundColor: '#51ac37'}}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Loyalty Rewards</h3>
                <p className="text-gray-600">Earn points with every purchase</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div 
          className="rounded-lg p-8 text-center text-white"
          style={{backgroundColor: '#51ac37'}}
        >
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Latest Offers</h2>
          <p className="text-green-100 mb-6">
            Subscribe to our newsletter and never miss a deal on fresh, local produce
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button 
              className="px-6 py-2 bg-white text-green-700 font-medium rounded-r-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;