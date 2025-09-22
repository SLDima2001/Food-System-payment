import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [farmerUser, setFarmerUser] = useState(null);
  const [customerUser, setCustomerUser] = useState(null);

  useEffect(() => {
    // Check if farmer is logged in
    const storedFarmer = localStorage.getItem('farmerUser');
    if (storedFarmer) {
      setFarmerUser(JSON.parse(storedFarmer));
    }

    // Check if customer is logged in
    const storedCustomer = localStorage.getItem('customerUser');
    if (storedCustomer) {
      setCustomerUser(JSON.parse(storedCustomer));
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{backgroundColor: '#0b2f00'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white hover:text-green-400 transition-colors">
              GreenHarvest
            </Link>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                Home
              </Link>
              <Link to="/products" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                Products
              </Link>
              
              {/* Show different links based on farmer login status */}
              {farmerUser ? (
                <>
                  <Link to="/farmer/dashboard" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                    Dashboard
                  </Link>
                  <Link to="/farmer/orders" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                    My Orders
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/promotions" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                    Promotions
                  </Link>
                  <Link to="/community" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                    Community
                  </Link>
                </>
              )}
              
              {/* Show Orders link only for logged-in customers */}
              {customerUser && (
                <Link to="/orders" className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors whitespace-nowrap">
                  Orders
                </Link>
              )}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Cart Button */}
            <Link 
              to="/cart"
              className="text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:opacity-90 transition-opacity" 
              style={{backgroundColor: '#51ac37'}}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19"/>
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </Link>
            
            {/* User Authentication Actions */}
            {farmerUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm hidden lg:inline">Welcome, {farmerUser.name}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('farmerUser');
                    setFarmerUser(null);
                    window.location.reload();
                  }}
                  className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors rounded-md border border-transparent hover:border-green-400"
                >
                  Logout
                </button>
              </div>
            ) : customerUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm hidden lg:inline">Welcome, {customerUser.name}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('customerUser');
                    setCustomerUser(null);
                    window.location.reload();
                  }}
                  className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors rounded-md border border-transparent hover:border-green-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-white px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors rounded-md border border-transparent hover:border-green-400"
                >
                  Login
                </Link>
                
                <Link 
                  to="/signup" 
                  className="text-white px-3 py-2 rounded-md text-sm font-medium border border-green-500 hover:bg-green-500 transition-colors whitespace-nowrap"
                >
                  Sign Up
                </Link>
                
                <Link 
                  to="/farmer/signup" 
                  className="text-white px-3 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap hidden lg:inline-block" 
                  style={{backgroundColor: '#51ac37'}}
                >
                  Join as Farmer
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-white p-2 rounded-md hover:text-green-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;