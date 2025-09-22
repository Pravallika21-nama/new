import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useSocket } from '../contexts/SocketContext';
import { adminAPI } from '../utils/api';
import { FaPizzaSlice, FaShoppingCart, FaUsers, FaExclamationTriangle, FaClock, FaCheckCircle } from 'react-icons/fa';

const AdminDashboard = () => {
  const { socket } = useSocket();
  const [dashboardData, setDashboardData] = useState(null);
  const [newOrders, setNewOrders] = useState([]);

  const { data, isLoading, refetch } = useQuery(
    'admin-dashboard',
    adminAPI.getDashboard,
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setDashboardData(data);
      }
    }
  );

  useEffect(() => {
    if (socket) {
      socket.on('newOrder', (order) => {
        setNewOrders(prev => [order, ...prev.slice(0, 4)]);
        refetch(); // Refresh dashboard data
      });

      socket.on('orderCancelled', (order) => {
        refetch(); // Refresh dashboard data
      });
    }

    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderCancelled');
      }
    };
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
            Admin Dashboard 📊
          </h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Manage your pizza delivery business
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card text-center">
            <div style={{ 
              fontSize: '2rem', 
              color: '#e74c3c',
              marginBottom: '0.5rem'
            }}>
              <FaShoppingCart />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{dashboardData?.totalOrders || 0}</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Total Orders</p>
          </div>

          <div className="card text-center">
            <div style={{ 
              fontSize: '2rem', 
              color: '#ffc107',
              marginBottom: '0.5rem'
            }}>
              <FaClock />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{dashboardData?.pendingOrders || 0}</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Pending Orders</p>
          </div>

          <div className="card text-center">
            <div style={{ 
              fontSize: '2rem', 
              color: '#28a745',
              marginBottom: '0.5rem'
            }}>
              <FaCheckCircle />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>₹{dashboardData?.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Total Revenue</p>
          </div>

          <div className="card text-center">
            <div style={{ 
              fontSize: '2rem', 
              color: '#dc3545',
              marginBottom: '0.5rem'
            }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>{dashboardData?.lowStockItems || 0}</h3>
            <p style={{ color: '#6c757d', margin: 0 }}>Low Stock Items</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <Link to="/admin/orders" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#e74c3c',
                backgroundColor: '#ffeaa7',
                padding: '1rem',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaShoppingCart />
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Manage Orders</h3>
                <p style={{ color: '#6c757d', margin: 0 }}>
                  View and update order status
                </p>
              </div>
            </div>
          </Link>

          <Link to="/admin/inventory" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#e74c3c',
                backgroundColor: '#ffeaa7',
                padding: '1rem',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                📦
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Inventory</h3>
                <p style={{ color: '#6c757d', margin: 0 }}>
                  Manage ingredients and stock
                </p>
              </div>
            </div>
          </Link>

          <Link to="/admin/pizzas" className="card" style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#e74c3c',
                backgroundColor: '#ffeaa7',
                padding: '1rem',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaPizzaSlice />
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Pizza Menu</h3>
                <p style={{ color: '#6c757d', margin: 0 }}>
                  Manage pizza varieties
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-outline">
              View All Orders
            </Link>
          </div>

          {dashboardData?.recentOrders?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <FaShoppingCart style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
              <p>No recent orders</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e1e5e9' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Order #</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Items</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentOrders?.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #e1e5e9' }}>
                      <td style={{ padding: '1rem' }}>
                        <Link 
                          to={`/admin/orders/${order._id}`}
                          style={{ color: '#e74c3c', textDecoration: 'none' }}
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{order.user?.name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{order.user?.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '1rem' }}>₹{order.totalAmount}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: getStatusColor(order.orderStatus) + '20',
                          color: getStatusColor(order.orderStatus)
                        }}>
                          {order.orderStatus.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        {dashboardData?.lowStockItems > 0 && (
          <div className="card" style={{ 
            backgroundColor: '#f8d7da', 
            borderColor: '#f5c6cb',
            marginTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaExclamationTriangle style={{ color: '#721c24', fontSize: '1.5rem' }} />
              <div>
                <h3 style={{ color: '#721c24', marginBottom: '0.5rem' }}>Low Stock Alert</h3>
                <p style={{ color: '#721c24', margin: 0 }}>
                  {dashboardData.lowStockItems} items are running low on stock. 
                  <Link to="/admin/inventory" style={{ color: '#721c24', fontWeight: 'bold' }}>
                    {' '}Manage Inventory
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ffc107';
    case 'confirmed':
      return '#17a2b8';
    case 'preparing':
      return '#fd7e14';
    case 'out-for-delivery':
      return '#6f42c1';
    case 'delivered':
      return '#28a745';
    case 'cancelled':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};

export default AdminDashboard;
