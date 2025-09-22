import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setMessage('Invalid verification link');
        setLoading(false);
        return;
      }

      const result = await verifyEmail(token);
      
      if (result.success) {
        setMessage('Email verified successfully! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(result.message);
      }
      
      setLoading(false);
    };

    verify();
  }, [token, verifyEmail, navigate]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 0'
      }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 0'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: '#e74c3c' }}>
          Email Verification
        </h2>
        
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: message.includes('successfully') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>

        {message.includes('successfully') && (
          <p style={{ color: '#6c757d' }}>
            Redirecting to login page in 3 seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
