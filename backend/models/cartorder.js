import mongoose from "mongoose";

const cartOrderSchema = new mongoose.Schema({
  // Customer details
  customerEmail: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, default: 'Colombo' },
  
  // Order details
  orderId: { type: String, required: true, unique: true, index: true },
  payhereOrderId: { type: String, required: true, unique: true, index: true },
  
  // Items
  items: [{
    productId: { type: String },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }
  }],
  
  // Financial details
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  shipping: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'LKR' },
  
  // Status tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // PayHere integration
  payherePaymentId: { type: String, index: true },
  paymentMethod: { type: String, default: 'payhere' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
cartOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate totals before saving
cartOrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totalAmount = this.subtotal + (this.tax || 0) + (this.shipping || 0);
  }
  next();
});

const CartOrder = mongoose.model('CartOrder', cartOrderSchema);

export default CartOrder;