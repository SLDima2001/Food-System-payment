// test-expiry.js - Test script for expiry functionality

const BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

// Test functions
async function testExpiryFunctionality() {
  console.log('🧪 Testing Expiry Functionality\n');

  try {
    // Step 1: Login as farmer to get token
    console.log('1️⃣ Logging in as farmer...');
    const loginResponse = await apiCall('/users/login', 'POST', {
      email: 'farmer@test.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed. Please create a farmer account first.');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Create test products with different expiry dates
    console.log('2️⃣ Creating test products...');
    
    const products = [
      {
        productName: 'Fresh Apples (Expired)',
        price: 25.50,
        lastPrice: 30.00,
        description: 'Already expired apples',
        quantityInStock: 50,
        expiryDate: '2025-09-15T00:00:00.000Z' // Already expired
      },
      {
        productName: 'Bananas (Expiring Soon)',
        price: 15.00,
        lastPrice: 18.00,
        description: 'Bananas expiring within 7 days',
        quantityInStock: 100,
        expiryDate: '2025-09-25T00:00:00.000Z' // Expires in 4 days
      },
      {
        productName: 'Oranges (Fresh)',
        price: 35.00,
        lastPrice: 40.00,
        description: 'Fresh oranges, good for weeks',
        quantityInStock: 75,
        expiryDate: '2025-10-15T00:00:00.000Z' // Expires in future
      }
    ];

    for (const product of products) {
      const response = await apiCall('/products', 'POST', product, token);
      if (response.status === 201) {
        console.log(`✅ Created: ${product.productName}`);
      } else {
        console.log(`❌ Failed to create: ${product.productName}`);
      }
    }
    console.log();

    // Step 3: Test utility endpoints
    console.log('3️⃣ Testing utility endpoints...\n');

    // Check system health
    console.log('📊 System Health Check:');
    const healthResponse = await apiCall('/utility/health');
    console.log(JSON.stringify(healthResponse.data, null, 2));
    console.log();

    // Check products expiring soon (7 days)
    console.log('⏰ Products Expiring Soon (7 days):');
    const expiringSoonResponse = await apiCall('/utility/expiring-soon');
    console.log(JSON.stringify(expiringSoonResponse.data, null, 2));
    console.log();

    // Check products expiring soon (custom days)
    console.log('⏰ Products Expiring Soon (10 days):');
    const expiringSoon10Response = await apiCall('/utility/expiring-soon?days=10');
    console.log(JSON.stringify(expiringSoon10Response.data, null, 2));
    console.log();

    // Step 4: Test cart functionality with expired products
    console.log('4️⃣ Testing cart with expired products...\n');

    // Get all products to find IDs
    const productsResponse = await apiCall('/products');
    const allProducts = productsResponse.data.list;
    
    const expiredProduct = allProducts.find(p => p.productName.includes('Expired'));
    const freshProduct = allProducts.find(p => p.productName.includes('Fresh'));

    if (expiredProduct) {
      console.log('🛒 Trying to add expired product to cart:');
      const cartResponse = await apiCall('/cart', 'POST', {
        productId: expiredProduct._id,
        quantity: 2
      }, token);
      console.log(`Status: ${cartResponse.status}`);
      console.log(JSON.stringify(cartResponse.data, null, 2));
      console.log();
    }

    if (freshProduct) {
      console.log('🛒 Adding fresh product to cart:');
      const cartResponse = await apiCall('/cart', 'POST', {
        productId: freshProduct._id,
        quantity: 3
      }, token);
      console.log(`Status: ${cartResponse.status}`);
      console.log(JSON.stringify(cartResponse.data, null, 2));
      console.log();
    }

    // Step 5: Clean up expired products
    console.log('5️⃣ Cleaning up expired products...\n');
    const cleanupResponse = await apiCall('/utility/expired-products', 'DELETE');
    console.log('🧹 Cleanup Result:');
    console.log(JSON.stringify(cleanupResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testExpiryFunctionality();