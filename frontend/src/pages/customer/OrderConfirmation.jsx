import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  
  // Mock order data
  const orderData = {
    id: orderId,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: 'confirmed',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    items: [
      { id: 1, name: 'Fresh Apples', price: 3.99, quantity: 2, weight: '1 lb each' },
      { id: 2, name: 'Organic Carrots', price: 2.49, quantity: 1, weight: '2 lbs' },
      { id: 3, name: 'Fresh Bananas', price: 1.99, quantity: 3, weight: '1 lb each' }
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
      phone: '(555) 123-4567'
    },
    payment: {
      method: 'Credit Card',
      last4: '4567'
    },
    totals: {
      subtotal: 13.96,
      tax: 1.12,
      shipping: 0,
      total: 15.08
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{backgroundColor: '#51ac37'}}>
              ✓
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">Thank you for your purchase. Your order has been received and is being processed.</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200" style={{backgroundColor: '#f8f9fa'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Order Number</h3>
                <p className="text-lg font-semibold text-gray-800">#{orderData.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Order Date</h3>
                <p className="text-lg font-semibold text-gray-800">{orderData.date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Estimated Delivery</h3>
                <p className="text-lg font-semibold" style={{color: '#51ac37'}}>{orderData.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderData.items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.weight}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${orderData.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${orderData.totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {orderData.totals.shipping === 0 ? 'Free' : `$${orderData.totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span style={{color: '#51ac37'}}>${orderData.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping and Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-800">{orderData.shipping.name}</p>
              <p>{orderData.shipping.address}</p>
              <p>{orderData.shipping.city}, {orderData.shipping.state} {orderData.shipping.zipCode}</p>
              <p className="mt-2">{orderData.shipping.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-800">{orderData.payment.method}</p>
              <p>**** **** **** {orderData.payment.last4}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Order Confirmation</p>
                <p className="text-sm">You'll receive an email confirmation shortly with your order details.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Order Preparation</p>
                <p className="text-sm">Our farmers will carefully select and pack your fresh produce.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-gray-600 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Out for Delivery</p>
                <p className="text-sm">You'll receive tracking information once your order ships.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-gray-600 text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Delivered</p>
                <p className="text-sm">Enjoy your fresh produce!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-center"
            style={{backgroundColor: '#51ac37'}}
          >
            Track Your Order
          </Link>
          <Link
            to="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600">
            Need help? Contact our customer support at{' '}
            <a href="mailto:support@greenharvest.com" className="text-green-600 hover:underline">
              support@greenharvest.com
            </a>{' '}
            or call{' '}
            <a href="tel:+1234567890" className="text-green-600 hover:underline">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;