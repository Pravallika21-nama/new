const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (item.customPizza) {
        // Calculate custom pizza price
        const { base, sauce, cheese, veggies, meat, size } = item.customPizza;
        let itemPrice = 0;
        
        const sizeMultiplier = { small: 0.8, medium: 1, large: 1.3 };
        
        // Get prices from inventory
        const baseItem = await Inventory.findById(base);
        const sauceItem = await Inventory.findById(sauce);
        const cheeseItem = await Inventory.findById(cheese);
        
        itemPrice += baseItem.price + sauceItem.price + cheeseItem.price;
        
        if (veggies && veggies.length > 0) {
          const veggieItems = await Inventory.find({ _id: { $in: veggies } });
          veggieItems.forEach(veggie => itemPrice += veggie.price);
        }
        
        if (meat && meat.length > 0) {
          const meatItems = await Inventory.find({ _id: { $in: meat } });
          meatItems.forEach(meatItem => itemPrice += meatItem.price);
        }
        
        itemPrice *= sizeMultiplier[size] || 1;
        itemPrice *= item.quantity;
        
        processedItems.push({
          customPizza: item.customPizza,
          quantity: item.quantity,
          price: itemPrice
        });
        
        totalAmount += itemPrice;
      } else {
        // Regular pizza
        processedItems.push({
          pizza: item.pizza,
          quantity: item.quantity,
          price: item.price * item.quantity
        });
        totalAmount += item.price * item.quantity;
      }
    }

    // Generate order number
    const orderNumber = `PZ${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order in database
    const order = new Order({
      user: req.user.userId,
      orderNumber,
      items: processedItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: 'razorpay'
    });

    await order.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderId: order._id.toString()
      }
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order
    const order = await Order.findById(req.body.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.razorpayPaymentId = paymentId;
    order.razorpaySignature = signature;
    order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes

    await order.save();

    // Update inventory
    await updateInventory(order.items);

    // Emit order update to admin
    req.io.to('admin').emit('newOrder', order);

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory after order
const updateInventory = async (items) => {
  try {
    for (const item of items) {
      if (item.customPizza) {
        // Update inventory for custom pizza ingredients
        const { base, sauce, cheese, veggies, meat } = item.customPizza;
        
        // Update base, sauce, cheese
        await Inventory.findByIdAndUpdate(base, { $inc: { stockQuantity: -item.quantity } });
        await Inventory.findByIdAndUpdate(sauce, { $inc: { stockQuantity: -item.quantity } });
        await Inventory.findByIdAndUpdate(cheese, { $inc: { stockQuantity: -item.quantity } });
        
        // Update veggies
        if (veggies && veggies.length > 0) {
          await Inventory.updateMany(
            { _id: { $in: veggies } },
            { $inc: { stockQuantity: -item.quantity } }
          );
        }
        
        // Update meat
        if (meat && meat.length > 0) {
          await Inventory.updateMany(
            { _id: { $in: meat } },
            { $inc: { stockQuantity: -item.quantity } }
          );
        }
      }
    }
  } catch (error) {
    console.error('Update inventory error:', error);
  }
};

module.exports = router;
