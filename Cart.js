import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <FaShoppingCart style={{ fontSize: '4rem', color: '#e1e5e9', marginBottom: '1rem' }} />
            <h2 style={{ color: '#6c757d', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Add some delicious pizzas to get started!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/menu" className="btn btn-primary">
                Browse Menu
              </Link>
              <Link to="/custom-pizza" className="btn btn-outline">
                Build Custom Pizza
              </Link>
            </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                Shopping Cart 🛒
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <button
              onClick={clearCart}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaTrash />
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-2">
          {/* Cart Items */}
          <div>
            {cart.map((item, index) => (
              <div key={index} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    flexShrink: 0
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>
                      {item.name}
                    </h3>
                    
                    {item.customPizza && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                          <strong>Base:</strong> {item.customPizza.base?.name}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                          <strong>Sauce:</strong> {item.customPizza.sauce?.name}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                          <strong>Cheese:</strong> {item.customPizza.cheese?.name}
                        </p>
                        {item.customPizza.veggies?.length > 0 && (
                          <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                            <strong>Veggies:</strong> {item.customPizza.veggies.map(v => v.name).join(', ')}
                          </p>
                        )}
                        {item.customPizza.meat?.length > 0 && (
                          <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                            <strong>Meat:</strong> {item.customPizza.meat.map(m => m.name).join(', ')}
                          </p>
                        )}
                        <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                          <strong>Size:</strong> {item.customPizza.size}
                        </p>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <FaMinus />
                        </button>
                        <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          ₹{item.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeItem(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
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
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ color: '#6c757d' }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr style={{ margin: '1rem 0' }} />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '1rem' 
              }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Subtotal:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#e74c3c' }}>
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '1rem' 
              }}>
                <span>Delivery Fee:</span>
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

              <Link to="/checkout" className="btn btn-primary w-100" style={{ 
                marginBottom: '1rem',
                textAlign: 'center',
                display: 'block'
              }}>
                Proceed to Checkout
              </Link>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/menu" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                  Continue Shopping
                </Link>
                <Link to="/custom-pizza" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                  Add Custom Pizza
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
