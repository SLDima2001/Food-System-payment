

import mongoose from "mongoose";

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

export default FoodSubscriptionLog;
