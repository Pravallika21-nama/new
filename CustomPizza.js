import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { pizzaAPI } from '../utils/api';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';

const CustomPizza = () => {
  const [customPizza, setCustomPizza] = useState({
    base: '',
    sauce: '',
    cheese: '',
    veggies: [],
    meat: [],
    size: 'medium'
  });
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const { data: options, isLoading } = useQuery(
    'customization-options',
    pizzaAPI.getCustomizationOptions,
    {
      select: (response) => response.data
    }
  );

  useEffect(() => {
    calculatePrice();
  }, [customPizza]);

  const calculatePrice = async () => {
    if (!customPizza.base || !customPizza.sauce || !customPizza.cheese) {
      setPrice(0);
      return;
    }

    setLoading(true);
    try {
      const response = await pizzaAPI.calculateCustomPrice(customPizza);
      setPrice(response.data.totalPrice);
    } catch (error) {
      console.error('Error calculating price:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBaseChange = (baseId) => {
    setCustomPizza({ ...customPizza, base: baseId });
  };

  const handleSauceChange = (sauceId) => {
    setCustomPizza({ ...customPizza, sauce: sauceId });
  };

  const handleCheeseChange = (cheeseId) => {
    setCustomPizza({ ...customPizza, cheese: cheeseId });
  };

  const handleVeggieToggle = (veggieId) => {
    const veggies = customPizza.veggies.includes(veggieId)
      ? customPizza.veggies.filter(id => id !== veggieId)
      : [...customPizza.veggies, veggieId];
    setCustomPizza({ ...customPizza, veggies });
  };

  const handleMeatToggle = (meatId) => {
    const meat = customPizza.meat.includes(meatId)
      ? customPizza.meat.filter(id => id !== meatId)
      : [...customPizza.meat, meatId];
    setCustomPizza({ ...customPizza, meat });
  };

  const handleSizeChange = (size) => {
    setCustomPizza({ ...customPizza, size });
  };

  const addToCart = () => {
    if (!customPizza.base || !customPizza.sauce || !customPizza.cheese) {
      alert('Please select base, sauce, and cheese');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const customPizzaItem = {
      customPizza: {
        ...customPizza,
        base: options.bases.find(b => b._id === customPizza.base),
        sauce: options.sauces.find(s => s._id === customPizza.sauce),
        cheese: options.cheeses.find(c => c._id === customPizza.cheese),
        veggies: options.veggies.filter(v => customPizza.veggies.includes(v._id)),
        meat: options.meats.filter(m => customPizza.meat.includes(m._id))
      },
      name: 'Custom Pizza',
      price: price,
      quantity: 1,
      image: '/api/placeholder/300/200'
    };

    cart.push(customPizzaItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Custom pizza added to cart!');
  };

  const renderOption = (option, isSelected, onClick) => (
    <div
      key={option._id}
      onClick={onClick}
      style={{
        padding: '1rem',
        border: `2px solid ${isSelected ? '#e74c3c' : '#e1e5e9'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffeaa7' : 'white',
        transition: 'all 0.2s ease',
        marginBottom: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#333' }}>{option.name}</h4>
          {option.description && (
            <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {option.description}
            </p>
          )}
        </div>
        <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
          ₹{option.price}
        </span>
      </div>
    </div>
  );

  const renderMultiSelectOption = (option, isSelected, onClick) => (
    <div
      key={option._id}
      onClick={onClick}
      style={{
        padding: '0.75rem',
        border: `2px solid ${isSelected ? '#e74c3c' : '#e1e5e9'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffeaa7' : 'white',
        transition: 'all 0.2s ease',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
        {option.name}
      </span>
      <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
        ₹{option.price}
      </span>
    </div>
  );

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
            Build Your Custom Pizza 🎨
          </h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Create your perfect pizza with our fresh ingredients
          </p>
        </div>

        <div className="grid grid-2">
          {/* Pizza Builder */}
          <div>
            {/* Pizza Base */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>1. Choose Your Base</h3>
              {options?.bases?.map(base => 
                renderOption(
                  base,
                  customPizza.base === base._id,
                  () => handleBaseChange(base._id)
                )
              )}
            </div>

            {/* Sauce */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>2. Choose Your Sauce</h3>
              {options?.sauces?.map(sauce => 
                renderOption(
                  sauce,
                  customPizza.sauce === sauce._id,
                  () => handleSauceChange(sauce._id)
                )
              )}
            </div>

            {/* Cheese */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>3. Choose Your Cheese</h3>
              {options?.cheeses?.map(cheese => 
                renderOption(
                  cheese,
                  customPizza.cheese === cheese._id,
                  () => handleCheeseChange(cheese._id)
                )
              )}
            </div>

            {/* Veggies */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>4. Add Vegetables (Optional)</h3>
              {options?.veggies?.map(veggie => 
                renderMultiSelectOption(
                  veggie,
                  customPizza.veggies.includes(veggie._id),
                  () => handleVeggieToggle(veggie._id)
                )
              )}
            </div>

            {/* Meat */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>5. Add Meat (Optional)</h3>
              {options?.meats?.map(meat => 
                renderMultiSelectOption(
                  meat,
                  customPizza.meat.includes(meat._id),
                  () => handleMeatToggle(meat._id)
                )
              )}
            </div>

            {/* Size */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>6. Choose Size</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      border: `2px solid ${customPizza.size === size ? '#e74c3c' : '#e1e5e9'}`,
                      borderRadius: '8px',
                      backgroundColor: customPizza.size === size ? '#ffeaa7' : 'white',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontWeight: customPizza.size === size ? 'bold' : 'normal'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Your Custom Pizza</h3>
              
              {customPizza.base && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Base:</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {options?.bases?.find(b => b._id === customPizza.base)?.name}
                  </p>
                </div>
              )}

              {customPizza.sauce && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Sauce:</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {options?.sauces?.find(s => s._id === customPizza.sauce)?.name}
                  </p>
                </div>
              )}

              {customPizza.cheese && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Cheese:</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {options?.cheeses?.find(c => c._id === customPizza.cheese)?.name}
                  </p>
                </div>
              )}

              {customPizza.veggies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Vegetables:</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {customPizza.veggies.map(id => 
                      options?.veggies?.find(v => v._id === id)?.name
                    ).join(', ')}
                  </p>
                </div>
              )}

              {customPizza.meat.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Meat:</h4>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {customPizza.meat.map(id => 
                      options?.meats?.find(m => m._id === id)?.name
                    ).join(', ')}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#e74c3c' }}>Size:</h4>
                <p style={{ margin: 0, color: '#6c757d', textTransform: 'capitalize' }}>
                  {customPizza.size}
                </p>
              </div>

              <hr style={{ margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Total Price:</h3>
                <h3 style={{ margin: 0, color: '#e74c3c' }}>
                  {loading ? 'Calculating...' : `₹${price.toFixed(2)}`}
                </h3>
              </div>

              <button
                onClick={addToCart}
                disabled={!customPizza.base || !customPizza.sauce || !customPizza.cheese || loading}
                className="btn btn-primary w-100"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <FaShoppingCart />
                Add to Cart
              </button>

              <Link to="/menu" className="btn btn-outline w-100" style={{ textAlign: 'center' }}>
                Browse Regular Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPizza;
