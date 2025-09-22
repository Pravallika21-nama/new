import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../utils/api';
import { FaMapMarkerAlt, FaPhone, FaCreditCard } from 'react-icons/fa';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate('/cart');
    }

    // Pre-fill address if available
    if (user?.address) {
      setDeliveryAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipCode: user.address.zipCode || '',
        phone: user.phone || ''
      });
    }
  }, [user, navigate]);

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!deliveryAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!deliveryAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!deliveryAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    if (!deliveryAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await paymentAPI.createOrder({
        items: cart,
        deliveryAddress
      });

      const { orderId, razorpayOrderId, amount, key } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key: key,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Pizza Delivery',
        description: 'Pizza Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentAPI.verifyPayment({
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyResponse.data.message === 'Payment verified successfully') {
              // Clear cart
              localStorage.removeItem('cart');
              
              // Redirect to orders page
              navigate('/orders');
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: deliveryAddress.phone
        },
        notes: {
          address: deliveryAddress
        },
        theme: {
          color: '#e74c3c'
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="card text-center">
            <h2>No items in cart</h2>
            <p>Please add items to your cart before checkout.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
            Checkout 💳
          </h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Complete your order and get your pizza delivered
          </p>
        </div>

        <div className="grid grid-2">
          {/* Delivery Address */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaMapMarkerAlt />
                Delivery Address
              </h3>
              
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                  className="form-input"
                  placeholder="Enter street address"
                />
                {errors.street && <div className="form-error">{errors.street}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  className="form-input"
                  placeholder="Enter city"
                />
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={deliveryAddress.state}
                  onChange={handleAddressChange}
                  className="form-input"
                  placeholder="Enter state"
                />
                {errors.state && <div className="form-error">{errors.state}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={deliveryAddress.zipCode}
                  onChange={handleAddressChange}
                  className="form-input"
                  placeholder="Enter ZIP code"
                />
                {errors.zipCode && <div className="form-error">{errors.zipCode}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={deliveryAddress.phone}
                  onChange={handleAddressChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCreditCard />
                Payment Method
              </h3>
              
              <div style={{
                padding: '1rem',
                border: '2px solid #e74c3c',
                borderRadius: '8px',
                backgroundColor: '#ffeaa7',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <FaCreditCard style={{ fontSize: '1.5rem', color: '#e74c3c' }} />
                <div>
                  <h4 style={{ margin: 0, color: '#333' }}>Razorpay Payment Gateway</h4>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                    Secure payment processing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Order Summary</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                {cart.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: index < cart.length - 1 ? '1px solid #e1e5e9' : 'none'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr style={{ margin: '1rem 0' }} />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem' 
              }}>
                <span>Subtotal:</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem' 
              }}>
                <span>Delivery Fee:</span>
                <span>₹0.00</span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem' 
              }}>
                <span>Tax:</span>
                <span>₹0.00</span>
              </div>

              <hr style={{ margin: '1rem 0' }} />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '2rem' 
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#e74c3c' }}>
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="btn btn-primary w-100"
                style={{ 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>

              <div style={{ 
                fontSize: '0.8rem', 
                color: '#6c757d', 
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                By clicking "Pay Now", you agree to our terms and conditions.
                Your payment is secure and encrypted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
