import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Slideshow';

// Customer Pages
import Home from './pages/customer/Home';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import Login from './pages/customer/Login';
import Signup from './pages/customer/Signup';
import Profile from './pages/customer/Profile';
import Orders from './pages/customer/Orders';
import Products from './pages/customer/Products';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProducts from './pages/farmer/FarmerProducts';
import FarmerSignup from './pages/farmer/FarmerSignup';
import FarmerLogin from './pages/farmer/FarmerLogin';
import AddProduct from './pages/farmer/AddProduct';
import ViewProducts from './pages/farmer/ViewProducts';
import ManageOrders from './pages/farmer/ManageOrders';
import EditProfile from './pages/farmer/EditProfile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Public Pages
import Promotions from './pages/Promotions';
import Community from './pages/Community';

// Utility Pages
import NotFound from './pages/NotFound';
import FoodSubscriptionPage from './pages/customer/FoodSubscriptionPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer/signup" element={<FarmerSignup />} />
          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/products" element={<ViewProducts />} />
          <Route path="/farmer/products/new" element={<AddProduct />} />
          <Route path="/farmer/products/edit/:id" element={<AddProduct />} />
          <Route path="/farmer/orders" element={<ManageOrders />} />
          <Route path="/farmer/profile" element={<EditProfile />} />
          <Route path="/farmer/subscription" element={<FoodSubscriptionPage />} />
          
          {/* Public Pages */}
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/community" element={<Community />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4"><h1 className="text-3xl font-bold text-gray-800">Admin Products</h1><p className="text-gray-600 mt-2">Admin product management - Coming Soon!</p></div></div>} />
          <Route path="/admin/orders" element={<div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4"><h1 className="text-3xl font-bold text-gray-800">Admin Orders</h1><p className="text-gray-600 mt-2">Admin order management - Coming Soon!</p></div></div>} />
          <Route path="/admin/users" element={<div className="min-h-screen bg-gray-50 py-8"><div className="max-w-7xl mx-auto px-4"><h1 className="text-3xl font-bold text-gray-800">Admin Users</h1><p className="text-gray-600 mt-2">Admin user management - Coming Soon!</p></div></div>} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App
