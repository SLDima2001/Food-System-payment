import React from 'react';

const Footer = () => {
  return (
    <footer className="text-white" style={{backgroundColor: '#0b2f00'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{color: '#51ac37'}}>GreenHarvest</h3>
            <p className="text-white text-sm mb-4">
              Fresh fruits and vegetables delivered to your doorstep. 
              Quality produce, everyday low prices.
            </p>
            <div className="flex items-center text-white text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>+94 11 234 5678</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{color: '#51ac37'}}>Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Fresh Fruits</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Vegetables</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Organic Produce</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{color: '#51ac37'}}>Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Contact Us</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Delivery Info</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>Return Policy</a></li>
              <li><a href="#" className="text-white text-sm transition-colors" onMouseEnter={(e) => e.target.style.color = '#51ac37'} onMouseLeave={(e) => e.target.style.color = 'white'}>FAQ</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="py-4" style={{backgroundColor: '#051500'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <p className="text-white text-sm">© 2025 GreenHarvest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;