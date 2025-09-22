import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await forgotPassword(email);
    
    if (result.success) {
      setMessage('Password reset email sent! Please check your inbox.');
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 0'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#e74c3c' }}>
          Forgot Password
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#6c757d' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: message.includes('sent') ? '#d4edda' : '#f8d7da',
            color: message.includes('sent') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('sent') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ marginBottom: '1rem' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/login" 
              style={{ color: '#e74c3c', textDecoration: 'none' }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
