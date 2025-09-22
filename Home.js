import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Welcome to Pizza Delivery
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Order delicious pizzas online and get them delivered to your doorstep
          </p>
          {isAuthenticated ? (
            <Link to="/menu" className="btn btn-outline" style={{ 
              color: 'white', 
              borderColor: 'white',
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}>
              Order Now
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-outline" style={{ 
                color: 'white', 
                borderColor: 'white',
                fontSize: '1.1rem',
                padding: '1rem 2rem'
              }}>
                Get Started
              </Link>
              <Link to="/login" className="btn" style={{ 
                backgroundColor: 'white',
                color: '#e74c3c',
                fontSize: '1.1rem',
                padding: '1rem 2rem'
              }}>
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Why Choose Us?
          </h2>
          <div className="grid grid-3">
            <div className="card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ marginBottom: '1rem' }}>Fast Delivery</h3>
              <p>Get your pizza delivered within 30-45 minutes</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍕</div>
              <h3 style={{ marginBottom: '1rem' }}>Fresh Ingredients</h3>
              <p>Made with the freshest ingredients and authentic recipes</p>
            </div>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
              <h3 style={{ marginBottom: '1rem' }}>Custom Pizzas</h3>
              <p>Create your own pizza with our custom pizza builder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pizza Types Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Our Pizza Types
          </h2>
          <div className="grid grid-2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🥬</div>
                <div>
                  <h3>Vegetarian</h3>
                  <p>Fresh vegetables and herbs for a healthy choice</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🥩</div>
                <div>
                  <h3>Non-Vegetarian</h3>
                  <p>Premium meats and cheeses for meat lovers</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🌱</div>
                <div>
                  <h3>Vegan</h3>
                  <p>Plant-based ingredients for vegan customers</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🎨</div>
                <div>
                  <h3>Custom</h3>
                  <p>Build your own pizza with your favorite toppings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to Order?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of satisfied customers and order your favorite pizza today
          </p>
          {isAuthenticated ? (
            <Link to="/menu" className="btn btn-primary" style={{ 
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}>
              Browse Menu
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary" style={{ 
              fontSize: '1.1rem',
              padding: '1rem 2rem'
            }}>
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
