// API utility functions for connecting to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('🌐 Making API request:', { url, method: config.method || 'GET' });
      const response = await fetch(url, config);
      
      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', { status: response.status, text: errorText });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ API response success:', result);
      return result;
    } catch (error) {
      console.error('❌ API request failed:', { url, error: error.message });
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Failed to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // User Authentication Methods
  async login(credentials) {
    return this.post('/users/login', credentials);
  }

  async loginFarmer(credentials) {
    return this.post('/users/login', credentials);
  }

  async register(userData) {
    return this.post('/users/register', userData);
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerUser');
    return Promise.resolve();
  }

  // Profile Methods
  async getCurrentUser() {
    return this.get('/users/me');
  }

  async updateProfile(profileData) {
    return this.put('/users/profile', profileData);
  }

  // Product Methods
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Farmer-specific product methods
  async getFarmerProducts() {
    // Use the authenticated farmer's products endpoint
    return this.get('/products/list');
  }

  // Farmer subscription & approval workflow
  async paySubscription() {
    return this.post('/users/farmer/pay-subscription', {});
  }

  async listPendingFarmers() {
    return this.get('/users/admin/farmers/pending');
  }

  async approveFarmer(id) {
    return this.post(`/users/admin/farmers/${id}/approve`, {});
  }

  async declineFarmer(id, reason='') {
    return this.post(`/users/admin/farmers/${id}/decline`, { reason });
  }

  // Cart Methods
  async getCart() {
    return this.get('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.post('/cart/add', { productId, quantity });
  }

  async updateCartItem(productId, quantity) {
    // Backend expects PUT /cart/update with { productId, quantity }
    return this.put('/cart/update', { productId, quantity });
  }

  async removeFromCart(productId) {
    return this.delete(`/cart/remove/${productId}`);
  }

  async clearCart() {
    return this.delete('/cart/clear');
  }

  // Order Methods
  async getOrders() {
    return this.get('/orders');
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async updateOrder(id, orderData) {
    return this.put(`/orders/${id}`, orderData);
  }

  // Farmer-specific order methods
  async getFarmerOrders() {
    return this.get('/orders/farmer');
  }

  async updateOrderItemStatus(orderId, productId, status) {
    return this.put('/orders/item-status', { orderId, productId, status });
  }

  async updateOrderStatus(orderId, status) {
    return this.put(`/orders/${orderId}/status`, { status });
  }

  // Payment Methods - NEW
  async createCartPayment(paymentData) {
    return this.post('/create-cart-payment', paymentData);
  }
   async createsubscriptionPayment(paymentData) {
    return this.post('/create-food-subscription-payment', paymentData);
  }

  async getCartOrderStatus(orderId) {
    return this.get(`/cart-order-status/${orderId}`);
  }

  async getUserOrders(email, page = 1, limit = 10) {
    return this.get(`/user-orders/${email}?page=${page}&limit=${limit}`);
  }

  async getAdminOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.get(`/admin/orders${queryParams ? `?${queryParams}` : ''}`);
  }

  // Utility Methods
  async testConnection() {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
      return await response.json();
    } catch (error) {
      console.error('Backend connection test failed:', error);
      throw error;
    }
  }
}

// Export a single instance
export default new ApiService();