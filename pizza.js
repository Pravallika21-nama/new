const express = require('express');
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all available pizzas
router.get('/', async (req, res) => {
  try {
    const pizzas = await Pizza.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.json(pizzas);
  } catch (error) {
    console.error('Get pizzas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pizza by ID
router.get('/:id', async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' });
    }
    res.json(pizza);
  } catch (error) {
    console.error('Get pizza error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pizza customization options
router.get('/customization/options', async (req, res) => {
  try {
    const options = {
      bases: await Inventory.find({ itemType: 'base', isAvailable: true }),
      sauces: await Inventory.find({ itemType: 'sauce', isAvailable: true }),
      cheeses: await Inventory.find({ itemType: 'cheese', isAvailable: true }),
      veggies: await Inventory.find({ itemType: 'veggie', isAvailable: true }),
      meats: await Inventory.find({ itemType: 'meat', isAvailable: true })
    };
    res.json(options);
  } catch (error) {
    console.error('Get customization options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate custom pizza price
router.post('/customization/calculate-price', auth, async (req, res) => {
  try {
    const { base, sauce, cheese, veggies, meat, size } = req.body;
    
    let totalPrice = 0;
    const sizeMultiplier = { small: 0.8, medium: 1, large: 1.3 };

    // Get base price
    const baseItem = await Inventory.findById(base);
    if (!baseItem) {
      return res.status(400).json({ message: 'Invalid base selected' });
    }
    totalPrice += baseItem.price;

    // Get sauce price
    const sauceItem = await Inventory.findById(sauce);
    if (!sauceItem) {
      return res.status(400).json({ message: 'Invalid sauce selected' });
    }
    totalPrice += sauceItem.price;

    // Get cheese price
    const cheeseItem = await Inventory.findById(cheese);
    if (!cheeseItem) {
      return res.status(400).json({ message: 'Invalid cheese selected' });
    }
    totalPrice += cheeseItem.price;

    // Get veggies prices
    if (veggies && veggies.length > 0) {
      const veggieItems = await Inventory.find({ _id: { $in: veggies } });
      veggieItems.forEach(veggie => {
        totalPrice += veggie.price;
      });
    }

    // Get meat prices
    if (meat && meat.length > 0) {
      const meatItems = await Inventory.find({ _id: { $in: meat } });
      meatItems.forEach(meatItem => {
        totalPrice += meatItem.price;
      });
    }

    // Apply size multiplier
    totalPrice *= sizeMultiplier[size] || 1;

    res.json({ 
      totalPrice: Math.round(totalPrice * 100) / 100,
      breakdown: {
        base: baseItem.price,
        sauce: sauceItem.price,
        cheese: cheeseItem.price,
        veggies: veggies ? veggies.length * 5 : 0, // Assuming 5 per veggie
        meat: meat ? meat.length * 10 : 0, // Assuming 10 per meat
        sizeMultiplier: sizeMultiplier[size] || 1
      }
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
