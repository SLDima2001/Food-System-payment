import CartOrder from '../models/cartorder.js';
import FoodSubscription from '../models/Subscription.js';
import FoodSubscriptionLog from '../models/SubscriptionLog.js';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';



export const payhereConfig = {
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
export const validatePayHereConfig = () => {
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


export const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

// For recurring payments (using CryptoJS)
export const generateRecurringPayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
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
export const verifyPayHereHash = (data, merchantSecret) => {
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

export const handleCartPaymentNotification = async (notificationData) => {
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
export const handleInitialFoodPaymentWithRecurring = async (notificationData) => {
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
export const handleRecurringFoodPayment = async (notificationData) => {
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
export const handleFailedFoodPayment = async (notificationData) => {
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
