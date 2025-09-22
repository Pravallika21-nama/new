import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../utils/api';
import { FaPlus, FaEdit, FaTrash, FaPizzaSlice } from 'react-icons/fa';

const AdminPizzas = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPizza, setEditingPizza] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: 'vegetarian',
    image: '',
    ingredients: [{ name: '', quantity: '' }],
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    }
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const { data: pizzas, isLoading } = useQuery(
    'admin-pizzas',
    adminAPI.getPizzas,
    {
      select: (response) => response.data
    }
  );

  const addMutation = useMutation(adminAPI.addPizza, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-pizzas');
      setShowAddForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => adminAPI.updatePizza(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-pizzas');
        setEditingPizza(null);
        resetForm();
      }
    }
  );

  const deleteMutation = useMutation(adminAPI.deletePizza, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-pizzas');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      category: 'vegetarian',
      image: '',
      ingredients: [{ name: '', quantity: '' }],
      nutritionInfo: {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      }
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

  const handleNutritionChange = (e) => {
    setFormData({
      ...formData,
      nutritionInfo: {
        ...formData.nutritionInfo,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const ingredients = [...formData.ingredients];
    ingredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '' }]
    });
  };

  const removeIngredient = (index) => {
    const ingredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
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
      basePrice: parseFloat(formData.basePrice),
      nutritionInfo: {
        calories: parseInt(formData.nutritionInfo.calories) || 0,
        protein: parseInt(formData.nutritionInfo.protein) || 0,
        carbs: parseInt(formData.nutritionInfo.carbs) || 0,
        fat: parseInt(formData.nutritionInfo.fat) || 0
      },
      ingredients: formData.ingredients.filter(ing => ing.name.trim() && ing.quantity.trim())
    };

    if (editingPizza) {
      updateMutation.mutate({ id: editingPizza._id, data: submitData });
    } else {
      addMutation.mutate(submitData);
    }
  };

  const handleEdit = (pizza) => {
    setEditingPizza(pizza);
    setFormData({
      name: pizza.name,
      description: pizza.description,
      basePrice: pizza.basePrice.toString(),
      category: pizza.category,
      image: pizza.image,
      ingredients: pizza.ingredients?.length > 0 ? pizza.ingredients : [{ name: '', quantity: '' }],
      nutritionInfo: {
        calories: pizza.nutritionInfo?.calories?.toString() || '',
        protein: pizza.nutritionInfo?.protein?.toString() || '',
        carbs: pizza.nutritionInfo?.carbs?.toString() || '',
        fat: pizza.nutritionInfo?.fat?.toString() || ''
      }
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pizza?')) {
      deleteMutation.mutate(id);
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
                Pizza Menu Management 🍕
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Manage your pizza varieties and menu items
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingPizza(null);
                resetForm();
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FaPlus />
              Add Pizza
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              {editingPizza ? 'Edit Pizza' : 'Add New Pizza'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Pizza Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter pizza name"
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
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
                  <label className="form-label">Base Price (₹)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter base price"
                    step="0.01"
                    min="0"
                  />
                  {errors.basePrice && <div className="form-error">{errors.basePrice}</div>}
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
                  {errors.image && <div className="form-error">{errors.image}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter pizza description"
                  rows="3"
                />
                {errors.description && <div className="form-error">{errors.description}</div>}
              </div>

              {/* Ingredients */}
              <div className="form-group">
                <label className="form-label">Ingredients</label>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="form-input"
                      placeholder="Ingredient name"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      className="form-input"
                      placeholder="Quantity"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn btn-outline"
                  style={{ marginTop: '0.5rem' }}
                >
                  Add Ingredient
                </button>
              </div>

              {/* Nutrition Info */}
              <div className="form-group">
                <label className="form-label">Nutrition Information</label>
                <div className="grid grid-4">
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.nutritionInfo.calories}
                      onChange={handleNutritionChange}
                      className="form-input"
                      placeholder="Calories"
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.nutritionInfo.protein}
                      onChange={handleNutritionChange}
                      className="form-input"
                      placeholder="Protein"
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.nutritionInfo.carbs}
                      onChange={handleNutritionChange}
                      className="form-input"
                      placeholder="Carbs"
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.nutritionInfo.fat}
                      onChange={handleNutritionChange}
                      className="form-input"
                      placeholder="Fat"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPizza(null);
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
                    : editingPizza ? 'Update Pizza' : 'Add Pizza'
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pizzas Grid */}
        <div className="grid grid-3">
          {pizzas?.map((pizza) => (
            <div key={pizza._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                height: '200px',
                backgroundImage: `url(${pizza.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: getCategoryColor(pizza.category),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {pizza.category.toUpperCase()}
                </div>
                
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => handleEdit(pizza)}
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#e74c3c'
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(pizza._id)}
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#dc3545'
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>
                  {pizza.name}
                </h3>
                <p style={{ 
                  color: '#6c757d', 
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {pizza.description}
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                    ₹{pizza.basePrice}
                  </span>
                </div>

                {pizza.ingredients?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>Ingredients:</h4>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                      {pizza.ingredients.slice(0, 3).map((ing, index) => (
                        <span key={index}>
                          {ing.name}
                          {index < Math.min(pizza.ingredients.length, 3) - 1 && ', '}
                        </span>
                      ))}
                      {pizza.ingredients.length > 3 && '...'}
                    </div>
                  </div>
                )}

                {pizza.nutritionInfo && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#6c757d',
                    borderTop: '1px solid #e1e5e9',
                    paddingTop: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Calories: {pizza.nutritionInfo.calories}</span>
                      <span>Protein: {pizza.nutritionInfo.protein}g</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {pizzas?.length === 0 && (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <FaPizzaSlice style={{ fontSize: '4rem', color: '#e1e5e9', marginBottom: '1rem' }} />
            <h2 style={{ color: '#6c757d', marginBottom: '1rem' }}>No pizzas in menu</h2>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Add your first pizza to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Add First Pizza
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPizzas;
