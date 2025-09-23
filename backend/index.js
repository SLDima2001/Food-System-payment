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
import paymentrouter from './routes/paymentrouter.js'

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


// Payment Endpoints

// CREATE CART PAYMENT ENDPOINT (One-time)

// Payment Notification Handlers

// Handle cart payment notification

// UNIFIED PAYHERE NOTIFICATION HANDLER

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


// Mount existing routes
app.use('/api/users', userRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', orderRouter);
app.use('/api/cart', cartRouter);
app.use('/api/utility', utilityRouter);

app.use('/api', paymentrouter)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`JWT_SECRET_KEY loaded: ${!!process.env.JWT_SECRET_KEY}`);
  //console.log(`PayHere Mode: ${payhereConfig.mode}`);
  //console.log(`PayHere Merchant ID: ${payhereConfig.merchantId}`);
});