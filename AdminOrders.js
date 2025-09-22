import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSocket } from '../contexts/SocketContext';
import { adminAPI } from '../utils/api';
import { FaClock, FaCheckCircle, FaTimesCircle, FaTruck, FaUtensils, FaEye } from 'react-icons/fa';

const AdminOrders = () => {
  const { socket } = useSocket();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery(
    ['admin-orders', selectedStatus, currentPage],
    () => adminAPI.getAllOrders({ 
      status: selectedStatus || undefined,
      page: currentPage,
      limit: 10
    }),
    {
      select: (response) => response.data
    }
  );

  const updateStatusMutation = useMutation(
    ({ orderId, status }) => adminAPI.updateOrderStatus(orderId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
        queryClient.invalidateQueries('admin-dashboard');
      }
    }
  );

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock style={{ color: '#ffc107' }} />;
      case 'confirmed':
        return <FaCheckCircle style={{ color: '#17a2b8' }} />;
      case 'preparing':
        return <FaUtensils style={{ color: '#fd7e14' }} />;
      case 'out-for-delivery':
        return <FaTruck style={{ color: '#6f42c1' }} />;
      case 'delivered':
        return <FaCheckCircle style={{ color: '#28a745' }} />;
      case 'cancelled':
        return <FaTimesCircle style={{ color: '#dc3545' }} />;
      default:
        return <FaClock style={{ color: '#6c757d' }} />;
    }
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'out-for-delivery',
      'out-for-delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                Order Management 📋
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Manage and track all customer orders
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ marginRight: '0.5rem', fontWeight: '600' }}>Filter by Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
                style={{ width: 'auto', minWidth: '150px' }}
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
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
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersData?.orders?.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #e1e5e9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                        {order.orderNumber}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{order.user?.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{order.user?.email}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{order.user?.phone}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div>{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          {order.items.slice(0, 2).map(item => 
                            item.pizza ? item.pizza.name : 'Custom Pizza'
                          ).join(', ')}
                          {order.items.length > 2 && '...'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusIcon(order.orderStatus)}
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
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                        >
                          <FaEye />
                        </button>
                        
                        {getNextStatus(order.orderStatus) && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, getNextStatus(order.orderStatus))}
                            disabled={updateStatusMutation.isLoading}
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            {updateStatusMutation.isLoading ? '...' : 'Next'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {ordersData?.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '1rem',
              marginTop: '2rem',
              padding: '1rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              
              <span style={{ color: '#6c757d' }}>
                Page {currentPage} of {ordersData.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(ordersData.totalPages, prev + 1))}
                disabled={currentPage === ordersData.totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div className="card" style={{ 
              maxWidth: '600px', 
              width: '100%', 
              maxHeight: '80vh', 
              overflowY: 'auto' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#e74c3c' }}>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Customer Information</h4>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <div><strong>Name:</strong> {selectedOrder.user?.name}</div>
                  <div><strong>Email:</strong> {selectedOrder.user?.email}</div>
                  <div><strong>Phone:</strong> {selectedOrder.user?.phone}</div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Order Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ 
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    {item.pizza ? (
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {item.pizza.name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          Quantity: {item.quantity} • ₹{item.price.toFixed(2)} each
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          Custom Pizza
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          <div><strong>Base:</strong> {item.customPizza.base?.name}</div>
                          <div><strong>Sauce:</strong> {item.customPizza.sauce?.name}</div>
                          <div><strong>Cheese:</strong> {item.customPizza.cheese?.name}</div>
                          {item.customPizza.veggies?.length > 0 && (
                            <div><strong>Veggies:</strong> {item.customPizza.veggies.map(v => v.name).join(', ')}</div>
                          )}
                          {item.customPizza.meat?.length > 0 && (
                            <div><strong>Meat:</strong> {item.customPizza.meat.map(m => m.name).join(', ')}</div>
                          )}
                          <div><strong>Size:</strong> {item.customPizza.size}</div>
                          <div>Quantity: {item.quantity} • ₹{item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Delivery Address</h4>
                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <div>{selectedOrder.deliveryAddress.street}</div>
                    <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</div>
                    <div>Phone: {selectedOrder.deliveryAddress.phone}</div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Order Summary</h4>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Delivery Fee:</span>
                    <span>₹0.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Tax:</span>
                    <span>₹0.00</span>
                  </div>
                  <hr style={{ margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {getNextStatus(selectedOrder.orderStatus) && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.orderStatus));
                      setSelectedOrder(null);
                    }}
                    disabled={updateStatusMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
