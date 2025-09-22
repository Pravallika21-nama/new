const express = require('express');
const { body, validationResult } = require('express-validator');
const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      lowStockItems,
      recentOrders,
      totalUsers
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['pending', 'preparing', 'out-for-delivery'] } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Inventory.find({ stockQuantity: { $lte: { $expr: '$thresholdQuantity' } } }),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      User.countDocuments({ role: 'user' })
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockItems: lowStockItems.length,
      recentOrders,
      totalUsers
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Inventory Management Routes

// Get all inventory items
router.get('/inventory', adminAuth, async (req, res) => {
  try {
    const { itemType, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (itemType) {
      filter.itemType = itemType;
    }

    const items = await Inventory.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inventory.countDocuments(filter);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new inventory item
router.post('/inventory', adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('itemType').isIn(['base', 'sauce', 'cheese', 'veggie', 'meat']).withMessage('Invalid item type'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
  body('thresholdQuantity').isInt({ min: 0 }).withMessage('Threshold quantity must be a positive integer'),
  body('category').isIn(['vegetarian', 'non-vegetarian', 'vegan']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = new Inventory(req.body);
    await item.save();

    res.status(201).json({ message: 'Inventory item added successfully', item });
  } catch (error) {
    console.error('Add inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory item
router.patch('/inventory/:id', adminAuth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item updated successfully', item });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/inventory/:id', adminAuth, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pizza Management Routes

// Get all pizzas
router.get('/pizzas', adminAuth, async (req, res) => {
  try {
    const pizzas = await Pizza.find().sort({ createdAt: -1 });
    res.json(pizzas);
  } catch (error) {
    console.error('Get pizzas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new pizza
router.post('/pizzas', adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('basePrice').isNumeric().withMessage('Base price must be a number'),
  body('category').isIn(['vegetarian', 'non-vegetarian', 'vegan']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pizza = new Pizza(req.body);
    await pizza.save();

    res.status(201).json({ message: 'Pizza added successfully', pizza });
  } catch (error) {
    console.error('Add pizza error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pizza
router.patch('/pizzas/:id', adminAuth, async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' });
    }

    res.json({ message: 'Pizza updated successfully', pizza });
  } catch (error) {
    console.error('Update pizza error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pizza
router.delete('/pizzas/:id', adminAuth, async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);

    if (!pizza) {
      return res.status(404).json({ message: 'Pizza not found' });
    }

    res.json({ message: 'Pizza deleted successfully' });
  } catch (error) {
    console.error('Delete pizza error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin user (for initial setup)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const admin = new User({
      name,
      email,
      password,
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();

    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
