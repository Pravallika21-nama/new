const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Pizza = require('./models/Pizza');
const Inventory = require('./models/Inventory');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza-delivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Seed data
const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Pizza.deleteMany({});
    await Inventory.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@pizzadelivery.com',
      password: 'admin123',
      phone: '+1234567890',
      role: 'admin',
      isEmailVerified: true
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'user@example.com',
      password: 'user123',
      phone: '+1234567891',
      role: 'user',
      isEmailVerified: true
    });
    await testUser.save();
    console.log('Created test user');

    // Create inventory items
    const inventoryItems = [
      // Bases
      { name: 'Thin Crust', itemType: 'base', price: 50, stockQuantity: 100, thresholdQuantity: 20, unit: 'pieces', category: 'vegetarian', description: 'Crispy thin crust base' },
      { name: 'Thick Crust', itemType: 'base', price: 60, stockQuantity: 100, thresholdQuantity: 20, unit: 'pieces', category: 'vegetarian', description: 'Soft thick crust base' },
      { name: 'Whole Wheat', itemType: 'base', price: 55, stockQuantity: 80, thresholdQuantity: 15, unit: 'pieces', category: 'vegetarian', description: 'Healthy whole wheat base' },
      { name: 'Gluten Free', itemType: 'base', price: 70, stockQuantity: 50, thresholdQuantity: 10, unit: 'pieces', category: 'vegan', description: 'Gluten-free base' },
      { name: 'Cauliflower', itemType: 'base', price: 65, stockQuantity: 60, thresholdQuantity: 12, unit: 'pieces', category: 'vegetarian', description: 'Low-carb cauliflower base' },

      // Sauces
      { name: 'Tomato Sauce', itemType: 'sauce', price: 15, stockQuantity: 200, thresholdQuantity: 30, unit: 'liters', category: 'vegetarian', description: 'Classic tomato sauce' },
      { name: 'BBQ Sauce', itemType: 'sauce', price: 20, stockQuantity: 150, thresholdQuantity: 25, unit: 'liters', category: 'vegetarian', description: 'Smoky BBQ sauce' },
      { name: 'Pesto Sauce', itemType: 'sauce', price: 25, stockQuantity: 100, thresholdQuantity: 20, unit: 'liters', category: 'vegetarian', description: 'Fresh basil pesto' },
      { name: 'Alfredo Sauce', itemType: 'sauce', price: 22, stockQuantity: 120, thresholdQuantity: 20, unit: 'liters', category: 'vegetarian', description: 'Creamy alfredo sauce' },
      { name: 'Buffalo Sauce', itemType: 'sauce', price: 18, stockQuantity: 80, thresholdQuantity: 15, unit: 'liters', category: 'vegetarian', description: 'Spicy buffalo sauce' },

      // Cheeses
      { name: 'Mozzarella', itemType: 'cheese', price: 30, stockQuantity: 150, thresholdQuantity: 25, unit: 'kg', category: 'vegetarian', description: 'Fresh mozzarella cheese' },
      { name: 'Cheddar', itemType: 'cheese', price: 28, stockQuantity: 120, thresholdQuantity: 20, unit: 'kg', category: 'vegetarian', description: 'Sharp cheddar cheese' },
      { name: 'Parmesan', itemType: 'cheese', price: 35, stockQuantity: 80, thresholdQuantity: 15, unit: 'kg', category: 'vegetarian', description: 'Aged parmesan cheese' },
      { name: 'Vegan Cheese', itemType: 'cheese', price: 40, stockQuantity: 60, thresholdQuantity: 12, unit: 'kg', category: 'vegan', description: 'Plant-based cheese' },
      { name: 'Goat Cheese', itemType: 'cheese', price: 45, stockQuantity: 40, thresholdQuantity: 8, unit: 'kg', category: 'vegetarian', description: 'Creamy goat cheese' },

      // Vegetables
      { name: 'Bell Peppers', itemType: 'veggie', price: 8, stockQuantity: 50, thresholdQuantity: 10, unit: 'kg', category: 'vegetarian', description: 'Fresh bell peppers' },
      { name: 'Mushrooms', itemType: 'veggie', price: 12, stockQuantity: 40, thresholdQuantity: 8, unit: 'kg', category: 'vegetarian', description: 'Fresh mushrooms' },
      { name: 'Onions', itemType: 'veggie', price: 6, stockQuantity: 60, thresholdQuantity: 12, unit: 'kg', category: 'vegetarian', description: 'Red onions' },
      { name: 'Olives', itemType: 'veggie', price: 15, stockQuantity: 30, thresholdQuantity: 6, unit: 'kg', category: 'vegetarian', description: 'Black olives' },
      { name: 'Tomatoes', itemType: 'veggie', price: 10, stockQuantity: 45, thresholdQuantity: 9, unit: 'kg', category: 'vegetarian', description: 'Fresh tomatoes' },
      { name: 'Spinach', itemType: 'veggie', price: 9, stockQuantity: 35, thresholdQuantity: 7, unit: 'kg', category: 'vegetarian', description: 'Fresh spinach' },
      { name: 'Jalapeños', itemType: 'veggie', price: 11, stockQuantity: 25, thresholdQuantity: 5, unit: 'kg', category: 'vegetarian', description: 'Spicy jalapeños' },

      // Meat
      { name: 'Pepperoni', itemType: 'meat', price: 25, stockQuantity: 40, thresholdQuantity: 8, unit: 'kg', category: 'non-vegetarian', description: 'Classic pepperoni' },
      { name: 'Chicken', itemType: 'meat', price: 30, stockQuantity: 35, thresholdQuantity: 7, unit: 'kg', category: 'non-vegetarian', description: 'Grilled chicken' },
      { name: 'Bacon', itemType: 'meat', price: 35, stockQuantity: 30, thresholdQuantity: 6, unit: 'kg', category: 'non-vegetarian', description: 'Crispy bacon' },
      { name: 'Sausage', itemType: 'meat', price: 28, stockQuantity: 25, thresholdQuantity: 5, unit: 'kg', category: 'non-vegetarian', description: 'Italian sausage' },
      { name: 'Ham', itemType: 'meat', price: 32, stockQuantity: 20, thresholdQuantity: 4, unit: 'kg', category: 'non-vegetarian', description: 'Smoked ham' }
    ];

    for (const item of inventoryItems) {
      const inventoryItem = new Inventory(item);
      await inventoryItem.save();
    }
    console.log('Created inventory items');

    // Create pizzas
    const pizzas = [
      {
        name: 'Margherita',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        basePrice: 299,
        category: 'vegetarian',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        ingredients: [
          { name: 'Tomato Sauce', quantity: '2 tbsp' },
          { name: 'Mozzarella', quantity: '100g' },
          { name: 'Fresh Basil', quantity: '5 leaves' }
        ],
        nutritionInfo: {
          calories: 250,
          protein: 12,
          carbs: 30,
          fat: 8
        }
      },
      {
        name: 'Pepperoni',
        description: 'Spicy pepperoni with mozzarella cheese on tomato sauce',
        basePrice: 399,
        category: 'non-vegetarian',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        ingredients: [
          { name: 'Tomato Sauce', quantity: '2 tbsp' },
          { name: 'Mozzarella', quantity: '120g' },
          { name: 'Pepperoni', quantity: '80g' }
        ],
        nutritionInfo: {
          calories: 320,
          protein: 18,
          carbs: 28,
          fat: 15
        }
      },
      {
        name: 'Veggie Supreme',
        description: 'Loaded with bell peppers, mushrooms, onions, olives, and tomatoes',
        basePrice: 449,
        category: 'vegetarian',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        ingredients: [
          { name: 'Tomato Sauce', quantity: '2 tbsp' },
          { name: 'Mozzarella', quantity: '100g' },
          { name: 'Bell Peppers', quantity: '50g' },
          { name: 'Mushrooms', quantity: '40g' },
          { name: 'Onions', quantity: '30g' },
          { name: 'Olives', quantity: '20g' },
          { name: 'Tomatoes', quantity: '30g' }
        ],
        nutritionInfo: {
          calories: 280,
          protein: 14,
          carbs: 32,
          fat: 10
        }
      },
      {
        name: 'BBQ Chicken',
        description: 'Grilled chicken with BBQ sauce, red onions, and cilantro',
        basePrice: 499,
        category: 'non-vegetarian',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
        ingredients: [
          { name: 'BBQ Sauce', quantity: '3 tbsp' },
          { name: 'Mozzarella', quantity: '100g' },
          { name: 'Chicken', quantity: '100g' },
          { name: 'Red Onions', quantity: '40g' },
          { name: 'Cilantro', quantity: '10g' }
        ],
        nutritionInfo: {
          calories: 350,
          protein: 22,
          carbs: 26,
          fat: 18
        }
      },
      {
        name: 'Vegan Delight',
        description: 'Plant-based pizza with vegan cheese, spinach, and mushrooms',
        basePrice: 429,
        category: 'vegan',
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500',
        ingredients: [
          { name: 'Tomato Sauce', quantity: '2 tbsp' },
          { name: 'Vegan Cheese', quantity: '80g' },
          { name: 'Spinach', quantity: '60g' },
          { name: 'Mushrooms', quantity: '50g' },
          { name: 'Bell Peppers', quantity: '40g' }
        ],
        nutritionInfo: {
          calories: 220,
          protein: 10,
          carbs: 28,
          fat: 6
        }
      },
      {
        name: 'Meat Lovers',
        description: 'Pepperoni, sausage, bacon, and ham with extra cheese',
        basePrice: 549,
        category: 'non-vegetarian',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        ingredients: [
          { name: 'Tomato Sauce', quantity: '2 tbsp' },
          { name: 'Mozzarella', quantity: '120g' },
          { name: 'Pepperoni', quantity: '60g' },
          { name: 'Sausage', quantity: '50g' },
          { name: 'Bacon', quantity: '40g' },
          { name: 'Ham', quantity: '30g' }
        ],
        nutritionInfo: {
          calories: 420,
          protein: 28,
          carbs: 24,
          fat: 22
        }
      }
    ];

    for (const pizza of pizzas) {
      const pizzaItem = new Pizza(pizza);
      await pizzaItem.save();
    }
    console.log('Created pizzas');

    console.log('Database seeding completed successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@pizzadelivery.com / admin123');
    console.log('User: user@example.com / user123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();
