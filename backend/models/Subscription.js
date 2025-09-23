// models/order.js

import mongoose from "mongoose";

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


export default FoodSubscription;
