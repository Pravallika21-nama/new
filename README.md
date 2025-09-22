# Pizza Delivery Application

A full-stack pizza delivery application built with React, Node.js, MongoDB, and Razorpay payment integration.

## Features

### User Features
- ✅ User registration and login with email verification
- ✅ Forgot password functionality
- ✅ Browse pizza menu with categories (Vegetarian, Non-Vegetarian, Vegan)
- ✅ Custom pizza builder with base, sauce, cheese, veggies, and meat selection
- ✅ Shopping cart functionality
- ✅ Razorpay payment integration
- ✅ Order tracking with real-time status updates
- ✅ Order history and management

### Admin Features
- ✅ Admin dashboard with order statistics
- ✅ Inventory management system
- ✅ Pizza menu management
- ✅ Order management with status updates
- ✅ Low stock alerts via email
- ✅ Real-time order notifications

### Technical Features
- ✅ JWT-based authentication
- ✅ Socket.io for real-time updates
- ✅ Email notifications using Nodemailer
- ✅ Responsive design
- ✅ Error handling and validation
- ✅ Secure payment processing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd pizza-delivery-app
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pizza-delivery
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-secret-key
ADMIN_EMAIL=admin@pizzadelivery.com
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Start MongoDB:
```bash
mongod
```

### 5. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use your Gmail address and app password in the `.env` file

### 6. Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your test API keys from the dashboard
3. Add them to your `.env` file

## Running the Application

### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 3000) concurrently.

### Production Mode
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

## Initial Setup

### 1. Create Admin User

After starting the server, make a POST request to create an admin user:

```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@pizzadelivery.com",
    "password": "admin123"
  }'
```

### 2. Seed Data

Run the seed script to populate initial data:

```bash
cd server
node seed.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Pizza
- `GET /api/pizza` - Get all pizzas
- `GET /api/pizza/:id` - Get pizza by ID
- `GET /api/pizza/customization/options` - Get customization options
- `POST /api/pizza/customization/calculate-price` - Calculate custom pizza price

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (admin)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PATCH /api/orders/:id/cancel` - Cancel order

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/inventory` - Get inventory items
- `POST /api/admin/inventory` - Add inventory item
- `PATCH /api/admin/inventory/:id` - Update inventory item
- `DELETE /api/admin/inventory/:id` - Delete inventory item
- `GET /api/admin/pizzas` - Get pizzas
- `POST /api/admin/pizzas` - Add pizza
- `PATCH /api/admin/pizzas/:id` - Update pizza
- `DELETE /api/admin/pizzas/:id` - Delete pizza

## Project Structure

```
pizza-delivery-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Testing

### Test User Accounts
- **Admin**: admin@pizzadelivery.com / admin123
- **User**: user@example.com / user123

### Test Payment
Use Razorpay test cards:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
ADMIN_EMAIL=your-admin-email
FRONTEND_URL=your-production-frontend-url
```

### Build for Production
```bash
# Build client
cd client
npm run build

# The build folder will be created in client/build
# Serve this folder with your web server
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file

2. **Email Not Sending**
   - Verify email credentials
   - Check if 2FA is enabled and app password is used
   - Ensure SMTP settings are correct

3. **Razorpay Payment Issues**
   - Verify API keys are correct
   - Ensure you're using test keys for development
   - Check if the Razorpay script is loading

4. **Socket.io Connection Issues**
   - Ensure both client and server are running
   - Check CORS settings
   - Verify socket.io versions match

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@pizzadelivery.com or create an issue in the repository.
