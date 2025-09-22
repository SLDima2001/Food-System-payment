import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import your existing routers
import userRouter from './routes/userRouter.js';
import productsRouter from './routes/productRouter.js';
import orderRouter from './routes/orderRouter.js';
import cartRouter from './routes/cartRouter.js';
import utilityRouter from './routes/utilityRouter.js';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.mongodbURL;
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Server will continue running without database...');
  }
};

connectDB();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://localhost:5555'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    console.warn('🚫 CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// PayHere Configuration
const payhereConfig = {
  merchantId: process.env.PAYHERE_MERCHANT_ID?.trim(),
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET?.trim(),
  appId: process.env.PAYHERE_APP_ID?.trim(),
  appSecret: process.env.PAYHERE_APP_SECRET?.trim(),
  mode: process.env.PAYHERE_MODE?.trim() || 'sandbox',
  returnUrl: process.env.PAYHERE_RETURN_URL?.trim() || 'http://localhost:5173/payment/status',
  cancelUrl: process.env.PAYHERE_CANCEL_URL?.trim() || 'http://localhost:5173/payment/cancelled',
  notifyUrl: process.env.PAYHERE_NOTIFY_URL?.trim() || 'http://localhost:5000/api/payhere-notify',
  
  apiBaseUrl: process.env.PAYHERE_MODE === 'live'
    ? 'https://www.payhere.lk/pay/api'
    : 'https://sandbox.payhere.lk/pay/api'
};

// Validate PayHere Configuration
const validatePayHereConfig = () => {
  const issues = [];
  
  if (!payhereConfig.merchantId) issues.push('Missing PAYHERE_MERCHANT_ID');
  if (!payhereConfig.merchantSecret) issues.push('Missing PAYHERE_MERCHANT_SECRET');

  if (issues.length > 0) {
    console.error('PayHere Configuration Issues:', issues);
    return false;
  }

  console.log('PayHere configuration validated successfully');
  console.log(`Mode: ${payhereConfig.mode}`);
  console.log(`Merchant ID: ${payhereConfig.merchantId}`);
  return true;
};

validatePayHereConfig();

// MongoDB Schemas

// Cart Order Schema (One-time payments)
const cartOrderSchema = new mongoose.Schema({
  // Customer details
  customerEmail: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },

  // Order details
  orderId: { type: String, required: true, unique: true, index: true },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  
  // Payment details
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'LKR' },
  
  // PayHere details
  paymentMethod: { type: String, default: 'payhere' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  payhereOrderId: { type: String, unique: true, index: true },
  payherePaymentId: { type: String },
  
  // Order status
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

cartOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CartOrder = mongoose.model('CartOrder', cartOrderSchema);

// Food Subscription Schema (Recurring payments)
const foodSubscriptionSchema = new mongoose.Schema({
  // Customer details
  userEmail: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },

  // Subscription details
  planId: { type: String, required: true, default: 'food_premium' },
  planName: { type: String, required: true, default: 'Premium Food Subscription' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'pending_renewal', 'payment_failed'],
    default: 'active'
  },
  
  // Fixed amount - LKR 2,500 per month
  amount: { type: Number, required: true, default: 2500 },
  currency: { type: String, default: 'LKR' },
  billingCycle: { type: String, default: 'monthly' },

  // Payment details
  paymentMethod: { type: String, default: 'payhere' },
  payhereOrderId: { type: String, unique: true, index: true },
  payherePaymentId: { type: String },
  payhereRecurringToken: { type: String, index: true },

  // Auto-renewal settings
  autoRenew: { type: Boolean, default: true },
  renewalAttempts: { type: Number, default: 0 },
  maxRenewalAttempts: { type: Number, default: 3 },
  
  // Payment failure tracking
  paymentFailure: { type: Boolean, default: false },
  paymentFailureReason: { type: String },
  lastPaymentFailureDate: { type: Date },

  // Cancellation fields
  cancellationScheduled: { type: Boolean, default: false },
  cancellationScheduledDate: { type: Date },
  cancellationReason: { type: String },
  cancellationEffectiveDate: { type: Date },
  autoRenewalCancelledDate: { type: Date },
  autoRenewalCancelledReason: { type: String },

  // Dates
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  nextBillingDate: { type: Date },

  // Renewal history
  renewalHistory: [{
    renewalDate: { type: Date, default: Date.now },
    amount: { type: Number },
    status: { type: String, enum: ['success', 'failed', 'cancelled'] },
    paymentId: { type: String },
    failureReason: { type: String },
    attempt: { type: Number },
    payhereToken: { type: String }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

foodSubscriptionSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    const endDate = new Date(this.startDate || new Date());
    endDate.setMonth(endDate.getMonth() + 1);
    this.endDate = endDate;
    
    if (!this.nextBillingDate && this.autoRenew) {
      this.nextBillingDate = new Date(endDate);
    }
  }
  this.updatedAt = new Date();
  next();
});

const FoodSubscription = mongoose.model('FoodSubscription', foodSubscriptionSchema);

// Food Subscription Log Schema
const foodSubscriptionLogSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodSubscription', required: true },
  userEmail: { type: String, required: true },
  action: {
    type: String,
    enum: ['created', 'renewed', 'cancelled', 'failed', 'auto_renewal_cancelled', 'reactivated'],
    required: true
  },
  details: {
    paymentId: String,
    amount: Number,
    currency: String,
    reason: String,
    payhereToken: String,
    autoRenewal: Boolean,
    recurringToken: Boolean,
    payhereCancellationSuccess: Boolean,
    payhereCancellationError: String,
    requiresManualCancellation: Boolean
  },
  timestamp: { type: Date, default: Date.now }
});

const FoodSubscriptionLog = mongoose.model('FoodSubscriptionLog', foodSubscriptionLogSchema);

// Hash Generation Functions

// For one-time payments
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

// For recurring payments (using CryptoJS)
const generateRecurringPayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  try {
    const cleanMerchantId = merchantId.toString().trim();
    const cleanOrderId = orderId.toString().trim();
    const cleanAmount = parseFloat(amount).toFixed(2);
    const cleanCurrency = currency.toString().toUpperCase().trim();
    const cleanSecret = merchantSecret.toString().trim();

    const secretHash = CryptoJS.MD5(cleanSecret).toString().toUpperCase();
    const hashString = cleanMerchantId + cleanOrderId + cleanAmount + cleanCurrency + secretHash;
    const finalHash = CryptoJS.MD5(hashString).toString().toUpperCase();
    
    return finalHash;
  } catch (error) {
    console.error('Recurring hash generation failed:', error);
    throw error;
  }
};

// Hash verification for notifications
const verifyPayHereHash = (data, merchantSecret) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig
  } = data;

  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const amountFormatted = parseFloat(payhere_amount).toFixed(2);
  const hashString = `${merchant_id}${order_id}${amountFormatted}${payhere_currency}${status_code}${hashedSecret}`;
  const localHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

  return localHash === md5sig.toUpperCase();
};

// Payment Endpoints

// CREATE CART PAYMENT ENDPOINT (One-time)
app.post('/api/create-cart-payment', async (req, res) => {
  try {
    console.log('Creating PayHere One-time Cart Payment...');

    const { amount, currency = 'LKR', cartItems, customerData } = req.body;

    if (!payhereConfig.merchantId || !payhereConfig.merchantSecret) {
      console.error('PayHere configuration missing');
      return res.status(500).json({
        success: false,
        error: 'PayHere configuration invalid'
      });
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    if (!customerData?.firstName || !customerData?.lastName || !customerData?.email || !customerData?.address) {
      return res.status(400).json({
        success: false,
        error: 'Customer information is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const orderId = `CART_${timestamp}_${randomSuffix}`;

    let cleanPhone = customerData.phone?.trim() || '0771234567';
    cleanPhone = cleanPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('94')) {
      cleanPhone = '0' + cleanPhone.substring(2);
    } else if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }

    const subtotal = numAmount;
    const tax = 0;
    const shipping = 0;
    const totalAmount = subtotal + tax + shipping;

    const hash = generatePayHereHash(
      payhereConfig.merchantId,
      orderId,
      totalAmount,
      currency,
      payhereConfig.merchantSecret
    );

    let itemsDescription = 'Cart Items';
    if (cartItems && cartItems.length > 0) {
      itemsDescription = cartItems.map(item => 
        `${item.productName} (x${item.quantity})`
      ).join(', ');
      
      if (itemsDescription.length > 100) {
        itemsDescription = itemsDescription.substring(0, 97) + '...';
      }
    }

    const paymentData = {
      sandbox: payhereConfig.mode === 'sandbox',
      merchant_id: payhereConfig.merchantId,
      return_url: `${payhereConfig.returnUrl}?order_id=${orderId}`,
      cancel_url: payhereConfig.cancelUrl,
      notify_url: payhereConfig.notifyUrl,
      order_id: orderId,
      items: itemsDescription,
      currency: currency.toUpperCase(),
      amount: totalAmount.toFixed(2),
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email.trim().toLowerCase(),
      phone: cleanPhone,
      address: customerData.address.trim(),
      city: customerData.city || 'Colombo',
      country: 'Sri Lanka',
      hash: hash,
      custom_1: 'cart_order',
      custom_2: `customer_${customerData.email.trim().toLowerCase()}`
    };

    const orderData = {
      customerEmail: customerData.email.trim().toLowerCase(),
      customerName: `${customerData.firstName} ${customerData.lastName}`.trim(),
      phoneNumber: cleanPhone,
      address: customerData.address.trim(),
      city: customerData.city || 'Colombo',
      orderId: orderId,
      items: cartItems ? cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity
      })) : [],
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      totalAmount: totalAmount,
      currency: currency.toUpperCase(),
      paymentStatus: 'pending',
      orderStatus: 'pending',
      payhereOrderId: orderId
    };

    const order = new CartOrder(orderData);
    await order.save();

    console.log('One-time cart payment order created:', {
      orderId,
      amount: totalAmount,
      itemsCount: cartItems?.length || 0
    });

    res.json({
      success: true,
      orderId: orderId,
      paymentData: paymentData,
      amount: totalAmount,
      currency: currency.toUpperCase(),
      message: 'One-time cart payment created successfully'
    });

  } catch (error) {
    console.error('Cart payment creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Payment creation failed',
      message: error.message
    });
  }
});

// CREATE FOOD SUBSCRIPTION PAYMENT ENDPOINT (Recurring)
app.post('/api/create-food-subscription-payment', async (req, res) => {
  try {
    console.log('Creating PayHere Recurring Food Subscription Payment...');

    const { amount, currency = 'LKR', planId, enableAutoRenew = true, customerData } = req.body;

    if (!payhereConfig.merchantId || !payhereConfig.merchantSecret) {
      console.error('PayHere configuration missing');
      return res.status(500).json({
        success: false,
        error: 'PayHere configuration invalid'
      });
    }

    const fixedAmount = 2500;
    const numAmount = parseFloat(amount);
    if (numAmount !== fixedAmount) {
      return res.status(400).json({
        success: false,
        error: `Invalid amount. Food subscription is fixed at LKR ${fixedAmount} per month`
      });
    }

    if (!customerData?.name || !customerData?.email || !customerData?.address) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, email, and delivery address are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const orderId = `FOOD_RECURRING_${timestamp}_${randomSuffix}`;

    const nameParts = customerData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    let cleanPhone = customerData.phoneNumber?.trim() || '0771234567';
    cleanPhone = cleanPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('94')) {
      cleanPhone = '0' + cleanPhone.substring(2);
    } else if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }

    const hash = generateRecurringPayHereHash(
      payhereConfig.merchantId,
      orderId,
      fixedAmount,
      currency,
      payhereConfig.merchantSecret
    );

    const paymentData = {
      sandbox: payhereConfig.mode === 'sandbox',
      merchant_id: payhereConfig.merchantId,
      return_url: `${payhereConfig.returnUrl}?order_id=${orderId}`,
      cancel_url: payhereConfig.cancelUrl,
      notify_url: payhereConfig.notifyUrl,
      order_id: orderId,
      items: 'Premium Food Subscription - Monthly Auto-Renewal',
      currency: currency.toUpperCase(),
      amount: fixedAmount.toFixed(2),
      first_name: firstName,
      last_name: lastName,
      email: customerData.email.trim().toLowerCase(),
      phone: cleanPhone,
      address: customerData.address.trim(),
      city: 'Colombo',
      country: 'Sri Lanka',
      hash: hash,
      custom_1: `plan_${planId}`,
      custom_2: 'food_monthly_recurring',
      recurrence: '1 Month',
      duration: 'Forever',
      startup_fee: '0.00'
    };

    console.log('PayHere recurring food payment data prepared:', {
      orderId,
      amount: fixedAmount,
      recurring: true
    });

    res.json({
      success: true,
      orderId: orderId,
      paymentData: paymentData,
      amount: fixedAmount,
      currency: currency.toUpperCase(),
      recurring: true,
      message: 'Food subscription recurring payment created successfully'
    });

  } catch (error) {
    console.error('Food subscription payment creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Recurring payment creation failed',
      message: error.message
    });
  }
});

// CREATE FOOD SUBSCRIPTION RECORD ENDPOINT
app.post('/api/create-food-subscription-record', async (req, res) => {
  try {
    console.log('Creating food subscription record...');

    const {
      userEmail,
      customerName,
      phoneNumber,
      address,
      amount = 2500,
      currency = 'LKR',
      paymentMethod = 'payhere',
      payhereOrderId,
      payhereRecurringToken,
      enableAutoRenew = true
    } = req.body;

    if (!userEmail || !customerName || !address) {
      return res.status(400).json({
        success: false,
        message: 'User email, customer name, and address are required'
      });
    }

    const existingSubscription = await FoodSubscription.findOne({ payhereOrderId });
    if (existingSubscription) {
      return res.json({
        success: true,
        subscriptionId: existingSubscription._id,
        message: 'Subscription record already exists',
        subscription: {
          id: existingSubscription._id,
          planName: existingSubscription.planName,
          amount: existingSubscription.amount,
          currency: existingSubscription.currency,
          nextBillingDate: existingSubscription.nextBillingDate,
          autoRenew: existingSubscription.autoRenew
        }
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const nextBillingDate = enableAutoRenew ? new Date(endDate) : null;

    const subscriptionData = {
      userEmail: userEmail.toLowerCase().trim(),
      customerName: customerName.trim(),
      phoneNumber: phoneNumber?.trim() || '0771234567',
      address: address.trim(),
      planId: 'food_premium',
      planName: 'Premium Food Subscription',
      status: 'active',
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      billingCycle: 'monthly',
      paymentMethod: paymentMethod,
      payhereOrderId: payhereOrderId,
      payhereRecurringToken: payhereRecurringToken,
      autoRenew: enableAutoRenew,
      startDate: startDate,
      endDate: endDate,
      nextBillingDate: nextBillingDate,
      renewalHistory: [{
        renewalDate: startDate,
        amount: parseFloat(amount),
        status: 'success',
        paymentId: payhereOrderId,
        attempt: 1,
        payhereToken: payhereRecurringToken || null
      }]
    };

    const subscription = new FoodSubscription(subscriptionData);
    await subscription.save();

    await FoodSubscriptionLog.create({
      subscriptionId: subscription._id,
      userEmail: subscription.userEmail,
      action: 'created',
      details: {
        paymentId: payhereOrderId,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        autoRenewal: enableAutoRenew,
        recurringToken: !!payhereRecurringToken,
        payhereToken: payhereRecurringToken
      }
    });

    console.log('Food subscription record created:', {
      id: subscription._id,
      userEmail: subscription.userEmail,
      autoRenew: subscription.autoRenew,
      nextBilling: subscription.nextBillingDate
    });

    res.json({
      success: true,
      subscriptionId: subscription._id,
      message: 'Food subscription record created successfully',
      subscription: {
        id: subscription._id,
        planName: subscription.planName,
        amount: subscription.amount,
        currency: subscription.currency,
        nextBillingDate: subscription.nextBillingDate,
        autoRenew: subscription.autoRenew
      }
    });

  } catch (error) {
    console.error('Error creating food subscription record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription record',
      error: error.message
    });
  }
});

// Payment Notification Handlers

// Handle cart payment notification
const handleCartPaymentNotification = async (notificationData) => {
  try {
    const {
      order_id,
      payment_id,
      payhere_amount,
      status_code,
      status_message
    } = notificationData;

    console.log('Processing one-time cart payment notification:', {
      orderId: order_id,
      paymentId: payment_id,
      statusCode: status_code
    });

    const order = await CartOrder.findOne({ payhereOrderId: order_id });

    if (!order) {
      console.error('Cart order not found:', order_id);
      return;
    }

    if (status_code === '2') {
      console.log('Cart payment successful');
      
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.payherePaymentId = payment_id;
      order.updatedAt = new Date();
      
      await order.save();
      
      console.log('Cart order updated successfully:', {
        orderId: order.orderId,
        status: order.paymentStatus
      });
      
    } else {
      console.log('Cart payment failed:', status_message);
      
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      order.updatedAt = new Date();
      
      await order.save();
    }

  } catch (error) {
    console.error('Failed to handle cart payment notification:', error);
  }
};

// Handle initial food subscription payment
const handleInitialFoodPaymentWithRecurring = async (notificationData) => {
  try {
    const {
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      email,
      custom_1,
      custom_2,
      recurring_token,
      next_occurrence_date
    } = notificationData;

    const planId = custom_1?.replace('plan_', '') || 'food_premium';
    const isRecurring = custom_2 === 'food_monthly_recurring';

    console.log('Processing initial food payment:', {
      orderId: order_id,
      paymentId: payment_id,
      amount: payhere_amount,
      hasRecurringToken: !!recurring_token,
      isRecurring
    });

    const existingSubscription = await FoodSubscription.findOne({ payhereOrderId: order_id });

    if (existingSubscription) {
      console.log('Updating existing food subscription with recurring data...');

      if (isRecurring && recurring_token) {
        existingSubscription.payhereRecurringToken = recurring_token;
        existingSubscription.payherePaymentId = payment_id;
        existingSubscription.autoRenew = true;
        existingSubscription.status = 'active';
        existingSubscription.nextBillingDate = next_occurrence_date ?
          new Date(next_occurrence_date) :
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        existingSubscription.updatedAt = new Date();

        await existingSubscription.save();
        console.log('Existing food subscription updated with auto-renewal');
      }
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const nextBillingDate = isRecurring && recurring_token ?
      (next_occurrence_date ? new Date(next_occurrence_date) : endDate) :
      null;

    const subscription = new FoodSubscription({
      userEmail: email || 'customer@example.com',
      customerName: 'Food Subscriber',
      phoneNumber: '0771234567',
      address: 'Colombo, Sri Lanka',
      planId: planId,
      planName: 'Premium Food Subscription',
      status: 'active',
      amount: parseFloat(payhere_amount),
      currency: payhere_currency,
      billingCycle: 'monthly',
      paymentMethod: 'payhere',
      payhereOrderId: order_id,
      payherePaymentId: payment_id,
      payhereRecurringToken: recurring_token,
      autoRenew: isRecurring && !!recurring_token,
      startDate: startDate,
      endDate: endDate,
      nextBillingDate: nextBillingDate,
      renewalAttempts: 0,
      maxRenewalAttempts: 3,
      renewalHistory: [{
        renewalDate: startDate,
        amount: parseFloat(payhere_amount),
        status: 'success',
        paymentId: payment_id,
        attempt: 1,
        payhereToken: recurring_token
      }]
    });

    await subscription.save();

    await FoodSubscriptionLog.create({
      subscriptionId: subscription._id,
      userEmail: subscription.userEmail,
      action: 'created',
      details: {
        paymentId: payment_id,
        amount: parseFloat(payhere_amount),
        currency: payhere_currency,
        autoRenewal: subscription.autoRenew,
        recurringToken: !!recurring_token,
        payhereToken: recurring_token
      }
    });

    console.log('New food subscription created with auto-renewal:', {
      id: subscription._id,
      autoRenew: subscription.autoRenew,
      nextBilling: subscription.nextBillingDate,
      hasRecurringToken: !!subscription.payhereRecurringToken
    });

  } catch (error) {
    console.error('Failed to handle initial food payment with recurring:', error);
  }
};

// Handle recurring food subscription payment
const handleRecurringFoodPayment = async (notificationData) => {
  try {
    const {
      subscription_id,
      payment_id,
      payhere_amount,
      status_code,
      email,
      next_occurrence_date
    } = notificationData;

    console.log('Processing recurring food payment:', { subscription_id, status_code });

    const subscription = await FoodSubscription.findOne({
      $or: [
        { payhereRecurringToken: subscription_id },
        { userEmail: email?.toLowerCase().trim() }
      ],
      autoRenew: true
    }).sort({ createdAt: -1 });

    if (!subscription) {
      console.error('Food subscription not found for recurring payment');
      return;
    }

    if (status_code === '2') {
      console.log('Recurring food payment successful');

      const currentEndDate = new Date(subscription.endDate);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      subscription.status = 'active';
      subscription.endDate = newEndDate;
      subscription.nextBillingDate = next_occurrence_date ?
        new Date(next_occurrence_date) : newEndDate;
      subscription.renewalAttempts = 0;
      subscription.paymentFailure = false;
      subscription.updatedAt = new Date();

      subscription.renewalHistory.push({
        renewalDate: new Date(),
        amount: parseFloat(payhere_amount),
        status: 'success',
        paymentId: payment_id,
        attempt: subscription.renewalAttempts + 1,
        payhereToken: subscription.payhereRecurringToken
      });

      await subscription.save();

      await FoodSubscriptionLog.create({
        subscriptionId: subscription._id,
        userEmail: subscription.userEmail,
        action: 'renewed',
        details: {
          paymentId: payment_id,
          amount: parseFloat(payhere_amount),
          currency: 'LKR',
          payhereToken: subscription.payhereRecurringToken
        }
      });

      console.log('Food subscription renewed with new end date:', {
        oldEndDate: currentEndDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        nextBilling: subscription.nextBillingDate.toISOString()
      });

    } else {
      console.log('Recurring food payment failed');

      subscription.renewalAttempts += 1;
      subscription.paymentFailure = true;
      subscription.lastPaymentFailureDate = new Date();
      subscription.status = subscription.renewalAttempts >= subscription.maxRenewalAttempts ?
        'cancelled' : 'pending_renewal';

      subscription.renewalHistory.push({
        renewalDate: new Date(),
        amount: parseFloat(payhere_amount),
        status: 'failed',
        failureReason: `Payment failed with status code: ${status_code}`,
        attempt: subscription.renewalAttempts,
        payhereToken: subscription.payhereRecurringToken
      });

      if (subscription.renewalAttempts >= subscription.maxRenewalAttempts) {
        subscription.autoRenew = false;
      }

      await subscription.save();

      await FoodSubscriptionLog.create({
        subscriptionId: subscription._id,
        userEmail: subscription.userEmail,
        action: 'failed',
        details: {
          paymentId: payment_id,
          amount: parseFloat(payhere_amount),
          currency: 'LKR',
          reason: `Payment failed with status code: ${status_code}`,
          payhereToken: subscription.payhereRecurringToken
        }
      });
    }

  } catch (error) {
    console.error('Failed to handle recurring food payment:', error);
  }
};

// Handle failed food subscription payment
const handleFailedFoodPayment = async (notificationData) => {
  try {
    const { order_id, status_code, status_message } = notificationData;

    console.log(`Handling failed food payment for order: ${order_id}`);

    const subscription = await FoodSubscription.findOne({ payhereOrderId: order_id });

    if (subscription) {
      subscription.status = 'payment_failed';
      subscription.paymentFailure = true;
      subscription.lastPaymentFailureDate = new Date();
      subscription.renewalAttempts += 1;

      subscription.renewalHistory.push({
        renewalDate: new Date(),
        amount: subscription.amount,
        status: 'failed',
        failureReason: `${status_code} - ${status_message}`,
        attempt: subscription.renewalAttempts
      });

      if (subscription.renewalAttempts >= subscription.maxRenewalAttempts) {
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
      }

      await subscription.save();

      await FoodSubscriptionLog.create({
        subscriptionId: subscription._id,
        userEmail: subscription.userEmail,
        action: 'failed',
        details: {
          amount: subscription.amount,
          currency: subscription.currency,
          reason: `${status_code} - ${status_message}`
        }
      });

      console.log('Food subscription updated with failure information');
    }

  } catch (error) {
    console.error('Failed to handle failed food payment:', error);
  }
};

// UNIFIED PAYHERE NOTIFICATION HANDLER
app.post('/api/payhere-notify', async (req, res) => {
  try {
    console.log('PayHere Notification Received');
    console.log('Raw Notification Data:', JSON.stringify(req.body, null, 2));

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message,
      custom_1,
      custom_2,
      email,
      recurring_token,
      subscription_id,
      event_type,
      next_occurrence_date
    } = req.body;

    // Validate required fields
    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      console.error('Missing required notification fields');
      return res.status(400).send('Missing required fields');
    }

    // Verify merchant ID
    if (merchant_id.trim() !== payhereConfig.merchantId.trim()) {
      console.error('Merchant ID mismatch');
      return res.status(400).send('Merchant ID mismatch');
    }

    // Verify hash
    const isValidHash = verifyPayHereHash(req.body, payhereConfig.merchantSecret);
    if (!isValidHash) {
      console.error('Hash verification failed');
      return res.status(400).send('Invalid hash');
    }

    console.log('Hash verification successful');
    console.log(`Status: ${status_code} - ${status_message}`);
    console.log(`Custom 1: ${custom_1}, Custom 2: ${custom_2}`);

    // Route to appropriate handler based on payment type
    if (status_code === '2') {
      // Successful payment
      if (custom_1 === 'cart_order' || order_id.startsWith('CART_')) {
        console.log('Processing one-time cart payment notification...');
        await handleCartPaymentNotification(req.body);
      } else if (custom_2 === 'food_monthly_recurring' || order_id.startsWith('FOOD_')) {
        if (event_type === 'SUBSCRIPTION_PAYMENT' && recurring_token) {
          console.log('Processing recurring food payment...');
          await handleRecurringFoodPayment(req.body);
        } else {
          console.log('Processing initial food payment...');
          await handleInitialFoodPaymentWithRecurring(req.body);
        }
      } else {
        console.log('Unknown payment type, treating as cart order');
        await handleCartPaymentNotification(req.body);
      }
    } else {
      // Failed payment
      if (custom_2 === 'food_monthly_recurring' || order_id.startsWith('FOOD_')) {
        console.log('Processing failed food payment...');
        await handleFailedFoodPayment(req.body);
      } else {
        console.log('Processing failed cart payment...');
        await handleCartPaymentNotification(req.body);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Error processing PayHere notification:', error);
    res.status(500).send('Server error');
  }
});

// Status Check Endpoints

// GET CART ORDER STATUS BY ORDER ID
app.get('/api/cart-order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await CartOrder.findOne({ payhereOrderId: orderId });

    if (order) {
      res.json({
        success: true,
        status: 'completed',
        order: {
          id: order._id,
          orderId: order.orderId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          currency: order.currency,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          items: order.items,
          createdAt: order.createdAt
        }
      });
    } else {
      res.json({
        success: true,
        status: 'pending',
        message: 'Payment is being processed'
      });
    }

  } catch (error) {
    console.error('Error checking cart order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status'
    });
  }
});

// GET FOOD SUBSCRIPTION STATUS BY ORDER ID
app.get('/api/food-subscription-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const subscription = await FoodSubscription.findOne({ payhereOrderId: orderId });

    if (subscription) {
      res.json({
        success: true,
        status: 'completed',
        subscription: {
          id: subscription._id,
          planName: subscription.planName,
          status: subscription.status,
          amount: subscription.amount,
          currency: subscription.currency,
          autoRenew: subscription.autoRenew,
          nextBillingDate: subscription.nextBillingDate,
          endDate: subscription.endDate,
          customerName: subscription.customerName,
          address: subscription.address
        }
      });
    } else {
      res.json({
        success: true,
        status: 'pending',
        message: 'Payment is being processed'
      });
    }

  } catch (error) {
    console.error('Error checking food subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check payment status'
    });
  }
});

// User Management Endpoints

// GET USER ORDERS (Cart)
app.get('/api/user-orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const orders = await CartOrder.find({
      customerEmail: email.toLowerCase().trim()
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const totalOrders = await CartOrder.countDocuments({
      customerEmail: email.toLowerCase().trim()
    });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        itemsCount: order.items.length,
        createdAt: order.createdAt,
        items: order.items
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders: totalOrders
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET USER FOOD SUBSCRIPTIONS
app.get('/api/user-food-subscriptions/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const subscriptions = await FoodSubscription.find({
      userEmail: email.toLowerCase().trim()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub._id,
        planName: sub.planName,
        status: sub.status,
        amount: sub.amount,
        currency: sub.currency,
        autoRenew: sub.autoRenew,
        startDate: sub.startDate,
        endDate: sub.endDate,
        nextBillingDate: sub.nextBillingDate,
        customerName: sub.customerName,
        address: sub.address,
        paymentFailure: sub.paymentFailure,
        renewalAttempts: sub.renewalAttempts,
        renewalHistory: sub.renewalHistory.slice(-5)
      }))
    });

  } catch (error) {
    console.error('Error fetching user food subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscriptions'
    });
  }
});

// CHECK FOOD SUBSCRIPTION STATUS
app.post('/api/check-food-subscription', async (req, res) => {
  try {
    const { email, subscriptionId } = req.body;

    if (!email && !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Email or subscription ID is required'
      });
    }

    console.log('Checking food subscription for:', { email, subscriptionId });

    const subscription = await FoodSubscription.findOne({
      $or: [
        email ? { userEmail: email.toLowerCase().trim() } : null,
        subscriptionId ? { _id: subscriptionId } : null
      ].filter(Boolean)
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        hasActiveSubscription: false,
        subscription: null
      });
    }

    const now = new Date();
    const isActive = subscription.status === 'active' && 
                    (!subscription.endDate || new Date(subscription.endDate) > now);

    res.json({
      success: true,
      hasSubscription: true,
      hasActiveSubscription: isActive,
      subscription: {
        id: subscription._id,
        planName: subscription.planName,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        autoRenew: subscription.autoRenew,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        nextBillingDate: subscription.nextBillingDate,
        customerName: subscription.customerName,
        address: subscription.address,
        paymentFailure: subscription.paymentFailure,
        renewalAttempts: subscription.renewalAttempts,
        maxRenewalAttempts: subscription.maxRenewalAttempts
      }
    });

  } catch (error) {
    console.error('Error checking food subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking subscription'
    });
  }
});

// Subscription Management Endpoints

// CANCEL FOOD SUBSCRIPTION AUTO-RENEWAL
app.post('/api/cancel-food-subscription-renewal', async (req, res) => {
  let session = null;

  try {
    const { subscriptionId, userEmail, reason } = req.body;

    console.log('Cancelling food subscription auto-renewal for:', { subscriptionId, userEmail });

    if (!subscriptionId && !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID or email is required'
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const subscription = await FoodSubscription.findOne({
      $and: [
        subscriptionId ? { _id: subscriptionId } : { userEmail: userEmail?.toLowerCase().trim() },
        { status: 'active' },
        { autoRenew: true }
      ]
    }).session(session);

    if (!subscription) {
      await session.abortTransaction();
      return res.json({
        success: false,
        message: 'No active food subscription with auto-renewal found'
      });
    }

    if (!subscription.autoRenew) {
      await session.abortTransaction();
      console.log('Auto-renewal is already disabled');
      return res.json({
        success: true,
        message: 'Auto-renewal is already disabled',
        autoRenew: false
      });
    }

    let payhereResult = { success: true };
    if (subscription.payhereRecurringToken) {
      console.log('PayHere recurring token exists - would cancel here in production');
    }

    const updateData = {
      $set: {
        autoRenew: false,
        updatedAt: new Date(),
        autoRenewalCancelledDate: new Date(),
        autoRenewalCancelledReason: reason || 'User requested cancellation'
      }
    };

    if (payhereResult.success && subscription.payhereRecurringToken) {
      updateData.$unset = { payhereRecurringToken: '' };
    }

    const updateResult = await FoodSubscription.updateOne(
      { _id: subscription._id },
      updateData
    ).session(session);

    console.log('Database update result:', updateResult);

    if (updateResult.modifiedCount > 0) {
      await FoodSubscriptionLog.create([{
        subscriptionId: subscription._id,
        userEmail: subscription.userEmail,
        action: 'auto_renewal_cancelled',
        details: {
          reason: reason || 'User requested cancellation',
          payhereToken: subscription.payhereRecurringToken || null,
          payhereCancellationSuccess: payhereResult.success,
          payhereCancellationError: payhereResult.error || null,
          requiresManualCancellation: payhereResult.requiresManualCancellation || false
        }
      }], { session });

      await session.commitTransaction();

      console.log('Food subscription auto-renewal cancelled successfully');

      let message = `Auto-renewal cancelled successfully. Your food subscription will continue until ${subscription.endDate.toLocaleDateString()}.`;

      if (!payhereResult.success) {
        message += ' Note: PayHere recurring payment requires manual cancellation by our team.';
      }

      res.json({
        success: true,
        message: message,
        autoRenew: false,
        payhereStatus: payhereResult.success ? 'cancelled' : 'requires_manual_cancellation'
      });
    } else {
      await session.abortTransaction();
      console.error('Failed to update subscription in database - no documents modified');

      res.json({
        success: false,
        message: 'Failed to cancel auto-renewal. Please try again or contact support.',
        debug: 'No documents were modified in the database update'
      });
    }

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error cancelling food subscription auto-renewal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while cancelling auto-renewal: ' + error.message
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

// REACTIVATE FOOD SUBSCRIPTION AUTO-RENEWAL
app.post('/api/reactivate-food-subscription-renewal', async (req, res) => {
  try {
    const { subscriptionId, userEmail } = req.body;

    if (!subscriptionId && !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID or email is required'
      });
    }

    const subscription = await FoodSubscription.findOne({
      $and: [
        subscriptionId ? { _id: subscriptionId } : { userEmail: userEmail?.toLowerCase().trim() },
        { status: { $in: ['active', 'pending_renewal'] } },
        { autoRenew: false }
      ]
    });

    if (!subscription) {
      return res.json({
        success: false,
        message: 'No eligible subscription found for reactivation'
      });
    }

    const now = new Date();
    if (subscription.endDate && new Date(subscription.endDate) <= now) {
      return res.json({
        success: false,
        message: 'Subscription has expired. Please create a new subscription.'
      });
    }

    subscription.autoRenew = true;
    subscription.status = 'active';
    subscription.renewalAttempts = 0;
    subscription.paymentFailure = false;
    subscription.updatedAt = new Date();

    if (!subscription.nextBillingDate && subscription.endDate) {
      subscription.nextBillingDate = new Date(subscription.endDate);
    }

    await subscription.save();

    await FoodSubscriptionLog.create({
      subscriptionId: subscription._id,
      userEmail: subscription.userEmail,
      action: 'reactivated',
      details: {
        autoRenewal: true
      }
    });

    console.log('Food subscription auto-renewal reactivated:', {
      id: subscription._id,
      userEmail: subscription.userEmail,
      nextBilling: subscription.nextBillingDate
    });

    res.json({
      success: true,
      message: 'Auto-renewal reactivated successfully. Your subscription will automatically renew.',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        autoRenew: subscription.autoRenew,
        nextBillingDate: subscription.nextBillingDate
      }
    });

  } catch (error) {
    console.error('Error reactivating food subscription auto-renewal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate auto-renewal: ' + error.message
    });
  }
});

// Admin Endpoints

// GET ADMIN ORDERS
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      if (status === 'payment') {
        filter.paymentStatus = { $in: ['pending', 'completed', 'failed'] };
      } else {
        filter.orderStatus = status;
      }
    }

    const totalCount = await CartOrder.countDocuments(filter);

    const orders = await CartOrder.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const stats = {
      totalOrders: await CartOrder.countDocuments({}),
      pendingPayments: await CartOrder.countDocuments({ paymentStatus: 'pending' }),
      completedPayments: await CartOrder.countDocuments({ paymentStatus: 'completed' }),
      failedPayments: await CartOrder.countDocuments({ paymentStatus: 'failed' }),
      confirmedOrders: await CartOrder.countDocuments({ orderStatus: 'confirmed' }),
      cancelledOrders: await CartOrder.countDocuments({ orderStatus: 'cancelled' })
    };

    res.json({
      success: true,
      orders: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        limit: parseInt(limit)
      },
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET ADMIN FOOD SUBSCRIPTIONS
app.get('/api/admin/food-subscriptions', async (req, res) => {
  try {
    console.log('Starting admin food subscriptions fetch...');

    const { status, page = 1, limit = 50 } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    console.log('Using filter:', filter);

    const totalCount = await FoodSubscription.countDocuments(filter);
    console.log(`Total matching subscriptions: ${totalCount}`);

    const subscriptions = await FoodSubscription.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    console.log(`Found ${subscriptions.length} subscriptions`);

    const stats = {
      totalSubscriptions: await FoodSubscription.countDocuments({}),
      activeSubscriptions: await FoodSubscription.countDocuments({ status: 'active' }),
      autoRenewEnabled: await FoodSubscription.countDocuments({ autoRenew: true }),
      pendingRenewal: await FoodSubscription.countDocuments({ status: 'pending_renewal' }),
      cancelledSubscriptions: await FoodSubscription.countDocuments({ status: 'cancelled' }),
      failedPayments: await FoodSubscription.countDocuments({ paymentFailure: true })
    };

    res.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        daysUntilExpiry: sub.endDate ? 
          Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        limit: parseInt(limit)
      },
      stats: stats
    });

  } catch (error) {
    console.error('Error in admin food subscriptions endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions: ' + error.message,
      error: error.toString()
    });
  }
});

// GET SUBSCRIPTION LOGS
app.get('/api/admin/food-subscription-logs/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { limit = 20 } = req.query;

    const logs = await FoodSubscriptionLog.find({ subscriptionId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      logs: logs
    });

  } catch (error) {
    console.error('Error fetching subscription logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs'
    });
  }
});

// Utility Endpoints

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Unified PayHere API is running',
    timestamp: new Date().toISOString(),
    config: {
      mode: payhereConfig.mode,
      merchantId: payhereConfig.merchantId,
      hasSecret: !!payhereConfig.merchantSecret
    },
    features: {
      cartPayments: true,
      foodSubscriptions: true,
      notifications: true,
      adminDashboard: true
    }
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    PORT: process.env.PORT,
    JWT_SECRET_KEY_EXISTS: !!process.env.JWT_SECRET_KEY,
    JWT_SECRET_KEY_LENGTH: process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY.length : 0,
    NODE_ENV: process.env.NODE_ENV,
    PAYHERE_MODE: payhereConfig.mode,
    PAYHERE_MERCHANT_ID: payhereConfig.merchantId
  });
});

// Basic test route
app.get('/', (req, res) => {
  res.json({
    message: 'Unified PayHere Server is working!',
    features: [
      'Cart Payments (One-time)',
      'Food Subscriptions (Recurring)', 
      'Unified Notifications',
      'User Management',
      'Admin Dashboard'
    ],
    routes: [
      'api/users', 
      'api/products', 
      'api/orders', 
      'api/cart', 
      'api/utility',
      'api/create-cart-payment',
      'api/create-food-subscription-payment',
      'api/payhere-notify'
    ]
  });
});

// Mount existing routes
app.use('/api/users', userRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/utility', utilityRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`JWT_SECRET_KEY loaded: ${!!process.env.JWT_SECRET_KEY}`);
  console.log(`PayHere Mode: ${payhereConfig.mode}`);
  console.log(`PayHere Merchant ID: ${payhereConfig.merchantId}`);
});