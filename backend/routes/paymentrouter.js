import express from 'express';
import { 
  payhereConfig,
  generatePayHereHash, 
  generateRecurringPayHereHash,
  verifyPayHereHash,
  handleCartPaymentNotification,
  handleInitialFoodPaymentWithRecurring,
  handleRecurringFoodPayment,
  handleFailedFoodPayment 
} from '../controllers/paymentController.js'; // Added .js extension
import FoodSubscription from '../models/Subscription.js'; // Added .js extension
import FoodSubscriptionLog from '../models/SubscriptionLog.js'; // Added .js extension
import CartOrder from '../models/cartorder.js';
import mongoose from 'mongoose';

const router = express.Router();

// REST OF YOUR ROUTER CODE REMAINS THE SAME...

router.post('/create-cart-payment', async (req, res) => {
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
router.post('/create-food-subscription-payment', async (req, res) => {
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
router.post('/create-food-subscription-record', async (req, res) => {
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

// All your other routes remain the same...
// [Rest of the routes from your original file]

export default router;