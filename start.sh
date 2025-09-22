#!/bin/bash

echo "🍕 Pizza Delivery Application Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: mongod"
    exit 1
fi

echo "✅ Node.js and MongoDB are ready"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server
    npm install
    cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client
    npm install
    cd ..
fi

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found in server directory."
    echo "   Please copy server/config.env to server/.env and update the values."
    echo "   Required: MongoDB URI, JWT Secret, Email credentials, Razorpay keys"
    exit 1
fi

echo "✅ Dependencies installed"

# Run seed script if database is empty
echo "🌱 Checking if database needs seeding..."
cd server
node -e "
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza-delivery')
.then(async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('🌱 Database is empty, running seed script...');
    require('./seed.js');
  } else {
    console.log('✅ Database already has data');
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
"
cd ..

echo ""
echo "🚀 Starting the application..."
echo "   Server will run on http://localhost:5000"
echo "   Client will run on http://localhost:3000"
echo ""
echo "📝 Test Accounts:"
echo "   Admin: admin@pizzadelivery.com / admin123"
echo "   User: user@example.com / user123"
echo ""

# Start the application
npm run dev
