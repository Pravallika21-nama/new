import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../utils/api';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const AdminInventory = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    itemType: 'base',
    price: '',
    stockQuantity: '',
    thresholdQuantity: '',
    unit: 'pieces',
    category: 'vegetarian',
    description: '',
    image: ''
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery(
    'admin-inventory',
    () => adminAPI.getInventory({ limit: 50 }),
    {
      select: (response) => response.data.items
    }
  );

  const addMutation = useMutation(adminAPI.addInventoryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-inventory');
      setShowAddForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => adminAPI.updateInventoryItem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-inventory');
        setEditingItem(null);
        resetForm();
      }
    }
  );

  const deleteMutation = useMutation(adminAPI.deleteInventoryItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-inventory');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      itemType: 'base',
      price: '',
      stockQuantity: '',
      thresholdQuantity: '',
      unit: 'pieces',
      category: 'vegetarian',
      description: '',
      image: ''
    });
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stockQuantity || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    if (!formData.thresholdQuantity || formData.thresholdQuantity < 0) {
      newErrors.thresholdQuantity = 'Threshold quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      thresholdQuantity: parseInt(formData.thresholdQuantity)
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: submitData });
    } else {
      addMutation.mutate(submitData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      itemType: item.itemType,
      price: item.price.toString(),
      stockQuantity: item.stockQuantity.toString(),
      thresholdQuantity: item.thresholdQuantity.toString(),
      unit: item.unit,
      category: item.category,
      description: item.description || '',
      image: item.image || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const getItemTypeIcon = (type) => {
    switch (type) {
      case 'base':
        return '🍞';
      case 'sauce':
        return '🍅';
      case 'cheese':
        return '🧀';
      case 'veggie':
        return '🥬';
      case 'meat':
        return '🥩';
      default:
        return '📦';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'vegetarian':
        return '#28a745';
      case 'non-vegetarian':
        return '#dc3545';
      case 'vegan':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  const isLowStock = (item) => {
    return item.stockQuantity <= item.thresholdQuantity;
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
                Inventory Management 📦
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Manage ingredients and track stock levels
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingItem(null);
                resetForm();
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPlus />
              Add Item
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter item name"
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Item Type</label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="base">Base</option>
                    <option value="sauce">Sauce</option>
                    <option value="cheese">Cheese</option>
                    <option value="veggie">Vegetable</option>
                    <option value="meat">Meat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter stock quantity"
                    min="0"
                  />
                  {errors.stockQuantity && <div className="form-error">{errors.stockQuantity}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Threshold Quantity</label>
                  <input
                    type="number"
                    name="thresholdQuantity"
                    value={formData.thresholdQuantity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter threshold quantity"
                    min="0"
                  />
                  {errors.thresholdQuantity && <div className="form-error">{errors.thresholdQuantity}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="grams">Grams</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter image URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isLoading || updateMutation.isLoading}
                  className="btn btn-primary"
                >
                  {addMutation.isLoading || updateMutation.isLoading 
                    ? 'Saving...' 
                    : editingItem ? 'Update Item' : 'Add Item'
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory Items */}
        <div className="grid grid-3">
          {inventory?.map((item) => (
            <div key={item._id} className="card" style={{
              border: isLowStock(item) ? '2px solid #dc3545' : '1px solid #e1e5e9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{getItemTypeIcon(item.itemType)}</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#333' }}>{item.name}</h3>
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      backgroundColor: getCategoryColor(item.category) + '20',
                      color: getCategoryColor(item.category),
                      fontWeight: '600'
                    }}>
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {item.description && (
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {item.description}
                </p>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6c757d' }}>Price:</span>
                  <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>₹{item.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#6c757d' }}>Stock:</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: isLowStock(item) ? '#dc3545' : '#28a745'
                  }}>
                    {item.stockQuantity} {item.unit}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d' }}>Threshold:</span>
                  <span style={{ fontWeight: 'bold' }}>{item.thresholdQuantity} {item.unit}</span>
                </div>
              </div>

              {isLowStock(item) && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#721c24'
                }}>
                  <FaExclamationTriangle />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Low Stock Alert!
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {inventory?.length === 0 && (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', color: '#e1e5e9', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ color: '#6c757d', marginBottom: '1rem' }}>No inventory items</h2>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Add your first inventory item to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
