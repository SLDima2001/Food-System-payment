import React, { useState, useEffect } from 'react';

function FoodSubscriptionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    agreement: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:5555';

  // Hardcoded food subscription plan - LKR 2,500/month
  const foodPlan = {
    id: 'food_premium',
    name: 'Premium Food Subscription',
    monthlyPrice: 2500,
    description: 'Fresh, healthy meals delivered daily',
    features: [
      'Daily fresh meal delivery (30 meals/month)',
      'Customizable meal plans',
      'Organic ingredients only',
      'Nutritionist consultation included',
      'Free delivery within Colombo',
      'Auto-renewal for convenience',
      'Cancel anytime'
    ]
  };

  useEffect(() => {
    const checkPayHereSDK = () => {
      if (typeof window.payhere === 'undefined') {
        console.warn('PayHere SDK not loaded. Retrying...');
        setTimeout(() => {
          if (typeof window.payhere === 'undefined') {
            setError('PayHere payment system failed to load. Please refresh the page.');
          }
        }, 2000);
      }
    };

    setTimeout(checkPayHereSDK, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name?.trim()) {
      errors.push('Full name is required');
    }

    if (!formData.email?.trim()) {
      errors.push('Email address is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!formData.phoneNumber?.trim()) {
      errors.push('Phone number is required');
    }

    if (!formData.address?.trim()) {
      errors.push('Delivery address is required');
    }

    if (!formData.agreement) {
      errors.push('Please agree to the terms and conditions');
    }

    return errors;
  };

  const initiatePayHereSDKPayment = (paymentData) => {
    try {
      console.log('Initializing PayHere SDK payment...');

      if (typeof window.payhere === 'undefined') {
        throw new Error('PayHere SDK not loaded. Please refresh the page and try again.');
      }

      window.payhere.onCompleted = null;
      window.payhere.onDismissed = null;
      window.payhere.onError = null;

      window.payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed successfully. OrderID:", orderId);
        setPaymentStatus('success');
        setIsProcessing(false);

        createFoodSubscriptionRecord({
          userEmail: formData.email,
          customerName: formData.name,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          amount: foodPlan.monthlyPrice,
          currency: 'LKR',
          paymentMethod: 'payhere',
          payhereOrderId: orderId,
          payhereRecurringToken: paymentData.recurring_token || null,
          enableAutoRenew: true
        }).then(() => {
          setTimeout(() => {
            window.location.href = `/payment-success?plan=food&orderId=${orderId}`;
          }, 1500);
        }).catch(error => {
          console.error('Failed to create subscription record:', error);
          setTimeout(() => {
            window.location.href = `/payment-success?plan=food&orderId=${orderId}&warning=subscription_record_failed`;
          }, 1500);
        });
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed by user");
        setPaymentStatus('cancelled');
        setError('Payment was cancelled. You can try again anytime.');
        setIsProcessing(false);
      };

      window.payhere.onError = function onError(error) {
        console.log("PayHere Error:", error);
        setPaymentStatus('error');
        setError(`Payment failed: ${error}`);
        setIsProcessing(false);
      };

      console.log('Starting PayHere SDK payment...');
      window.payhere.startPayment(paymentData);

    } catch (error) {
      console.error('PayHere SDK initialization error:', error);
      setError(`Payment initialization failed: ${error.message}`);
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const createFoodSubscriptionRecord = async (subscriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-food-subscription-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Food subscription record created:', result.subscriptionId);
        return result;
      } else {
        throw new Error(result.message || 'Failed to create subscription record');
      }
    } catch (error) {
      console.error('Error creating subscription record:', error);
      throw error;
    }
  };

  const createFoodSubscriptionPayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setPaymentStatus('processing');

      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const paymentRequest = {
        amount: foodPlan.monthlyPrice,
        currency: 'LKR',
        planId: foodPlan.id,
        enableAutoRenew: true,
        customerData: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim()
        }
      };

      console.log('Creating food subscription payment...');

      const response = await fetch(`${API_BASE_URL}/api/create-food-subscription-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || responseData.message || 'Payment creation failed');
      }

      console.log('Payment data received, initializing PayHere SDK...');
      setPaymentStatus('redirecting');

      setTimeout(() => {
        initiatePayHereSDKPayment(responseData.paymentData);
      }, 500);

    } catch (error) {
      console.error('Food subscription payment error:', error);
      setError(error.message || 'Payment creation failed. Please try again.');
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    await createFoodSubscriptionPayment();
  };

  const getStatusAlert = () => {
    if (error) {
      return (
        <div style={styles.errorAlert}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      );
    }

    if (paymentStatus === 'processing') {
      return (
        <div style={styles.processingAlert}>
          <div style={styles.spinner}></div>
          <strong>Processing your subscription...</strong>
        </div>
      );
    }

    if (paymentStatus === 'redirecting') {
      return (
        <div style={styles.processingAlert}>
          <div style={styles.spinner}></div>
          <strong>Opening secure payment gateway...</strong>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div style={styles.successAlert}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <strong>Payment successful! Redirecting...</strong>
        </div>
      );
    }

    return null;
  };

  const styles = {
    container: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5em',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '1.2em',
      color: '#64748b',
      marginBottom: '20px'
    },
    mainContent: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      flexWrap: 'wrap',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    planCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '2px solid #3b82f6',
      position: 'relative',
      maxWidth: '400px',
      textAlign: 'center'
    },
    popularBadge: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '5px 20px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    planName: {
      fontSize: '1.8em',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '10px'
    },
    planDescription: {
      color: '#64748b',
      fontSize: '14px',
      marginBottom: '20px'
    },
    planPrice: {
      fontSize: '2.5em',
      fontWeight: 'bold',
      color: '#3b82f6',
      marginBottom: '5px'
    },
    planPeriod: {
      color: '#64748b',
      fontSize: '14px',
      marginBottom: '20px'
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: '20px 0',
      textAlign: 'left'
    },
    featureItem: {
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    checkIcon: {
      color: '#22c55e',
      fontWeight: 'bold',
      fontSize: '16px'
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      width: '100%'
    },
    formTitle: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center'
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    autoRenewNotice: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#e8f5e8',
      borderRadius: '8px',
      border: '1px solid #c3e6cb',
      color: '#155724'
    },
    termsContainer: {
      marginBottom: '20px',
      textAlign: 'left'
    },
    button: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    securityNotice: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      textAlign: 'center'
    },
    errorAlert: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      color: '#dc2626',
      padding: '15px',
      borderRadius: '8px',
      margin: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    processingAlert: {
      backgroundColor: '#dbeafe',
      border: '1px solid #93c5fd',
      color: '#2563eb',
      padding: '15px',
      borderRadius: '8px',
      margin: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    successAlert: {
      backgroundColor: '#d1fae5',
      border: '1px solid #86efac',
      color: '#059669',
      padding: '15px',
      borderRadius: '8px',
      margin: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid currentColor',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Fresh Food Delivery</h1>
        <p style={styles.subtitle}>Premium meal subscription service</p>
      </header>

      {getStatusAlert()}

      <div style={styles.mainContent}>
        <div style={styles.planCard}>
          <div style={styles.popularBadge}>Premium Plan</div>
          <div style={styles.planName}>{foodPlan.name}</div>
          <div style={styles.planDescription}>{foodPlan.description}</div>
          <div style={styles.planPrice}>LKR {foodPlan.monthlyPrice.toLocaleString()}</div>
          <div style={styles.planPeriod}>per month (auto-renewal)</div>

          <ul style={styles.featuresList}>
            {foodPlan.features.map((feature, index) => (
              <li key={index} style={styles.featureItem}>
                <span style={styles.checkIcon}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Start Your Food Subscription</h2>

          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />

            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number (e.g., 0771234567)"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              style={styles.input}
              required
            />

            <textarea
              name="address"
              placeholder="Delivery Address (Please provide complete address with landmarks)"
              value={formData.address}
              onChange={handleInputChange}
              style={styles.textarea}
              required
            />

            <div style={styles.autoRenewNotice}>
              <strong>🔄 Auto-Renewal Included</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Your subscription includes automatic monthly renewal for uninterrupted meal delivery. 
                You can cancel anytime through customer support or your account dashboard.
              </p>
            </div>

            <div style={styles.termsContainer}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="agreement"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>I agree to the terms and conditions and auto-renewal policy</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                ...styles.button,
                ...(!formData.agreement || isProcessing ? styles.buttonDisabled : {})
              }}
              disabled={!formData.agreement || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div style={styles.spinner}></div>
                  Processing...
                </>
              ) : (
                `Subscribe Now - LKR ${foodPlan.monthlyPrice.toLocaleString()}/month`
              )}
            </button>
          </div>

          <div style={styles.securityNotice}>
            <strong>🔒 Secure Payment:</strong>
            Your payment is processed securely through PayHere, Sri Lanka's most trusted payment gateway.
            <br />
            <strong>Auto-Renewal:</strong> Convenient monthly billing with full control to manage or cancel anytime.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default FoodSubscriptionPage;