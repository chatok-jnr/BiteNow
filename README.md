# 🍔 BiteNow - Online Food Delivery Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

BiteNow is a comprehensive food delivery application that connects customers, restaurants, delivery riders, and administrators in a seamless ecosystem. Built with modern web technologies, it provides real-time order tracking, secure authentication, and an intuitive user experience.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [User Roles & Functionalities](#-user-roles--functionalities)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication**: Google OAuth 2.0 and JWT-based authentication
- 🛒 **Smart Cart System**: Guest and user carts with automatic expiration
- 📍 **Real-time Tracking**: Live order and rider location tracking using Socket.IO
- 💳 **Multiple Payment Options**: Support for various payment methods
- 📧 **Email Notifications**: Automated email notifications for order updates
- 📱 **Responsive Design**: Mobile-first design using Tailwind CSS
- 🌍 **Location Services**: Mapbox integration for geolocation features
- ☁️ **Cloud Storage**: Cloudinary integration for image and document management
- 📊 **Analytics Dashboard**: Comprehensive dashboards for all user types
- 🔍 **Advanced Search & Filtering**: Search restaurants and food items with filters

---

## 🛠 Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router DOM** 7.1.5 - Client-side routing
- **Vite** 4.4.5 - Build tool and dev server
- **Tailwind CSS** 3.3.3 - Utility-first CSS framework
- **Axios** 1.13.4 - HTTP client
- **Lucide React** - Icon library
- **Recharts** 3.6.0 - Charts for admin dashboard

### Backend
- **Node.js** with **Express.js** 5.2.1 - Server framework
- **MongoDB** with **Mongoose** 8.19.0 - Database and ODM
- **Socket.IO** 4.8.3 - Real-time bidirectional communication
- **Passport.js** with Google OAuth 2.0 - Authentication
- **JWT** (jsonwebtoken) - Token-based authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image and document storage
- **Mapbox SDK** - Location and mapping services
- **Multer** - File upload handling
- **Morgan** - HTTP request logger

---

## 🏗 System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│    Backend   │────────▶│   MongoDB   │
│  (3 Apps)   │◀────────│   (REST API) │◀────────│  Database   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│  Cloudinary │         │  Socket.IO   │
│   (Media)   │         │ (Real-time)  │
└─────────────┘         └──────────────┘
```

The application consists of three separate frontend applications:
1. **Customer Frontend** - Main customer-facing application
2. **Restaurant Owner Frontend** - Restaurant management portal
3. **Admin Dashboard** - Administrative control panel

---

## 👥 User Roles & Functionalities

### 1. 🛍️ Customer

**Getting Started:**
1. Visit the application homepage
2. Click on "Login & Signup"
3. Select "Customer" role
4. Authenticate using Google OAuth

**Features:**
- **Browse & Search**: Explore restaurants and food items with advanced filters
- **Cart Management**: Add items to cart, modify quantities, apply discounts
- **Order Placement**: Place orders with delivery address and special instructions
- **Order Tracking**: Real-time order status updates and rider location tracking
- **Profile Management**: Update personal information, addresses, and preferences
- **Order History**: View past orders with detailed information
- **Ratings & Reviews**: Rate restaurants and delivery experience
- **Guest Cart**: Browse and add items without authentication (auto-converts on login)

---

### 2. 🏪 Restaurant Owner

**Getting Started:**
1. Click on "Login & Signup"
2. Select "Restaurant Owner" role
3. Authenticate using Google OAuth
4. Complete profile with business details
5. Upload required business documents (licenses, permits)
6. Wait for admin approval (verification of documents)

**Features:**

#### Profile Management
- Upload and update business documents
- Manage personal and business information
- View approval status

#### Restaurant Management
- **Create Restaurants**: Add multiple restaurant profiles
- **Restaurant Details**: Set name, description, location, operating hours
- **Restaurant Images**: Upload photos using Cloudinary
- **Approval Process**: Each restaurant requires admin approval

#### Menu Management
- **Add Food Items**: Create menu items with details (name, description, price)
- **Food Categories**: Organize items by categories
- **Pricing & Discounts**: Set prices and discount percentages
- **Inventory Control**: Manage stock quantities and availability
- **Food Images**: Upload appetizing food photos
- **Availability Toggle**: Enable/disable items based on stock

#### Order Management
- **Real-time Orders**: Receive orders instantly via Socket.IO
- **Order Processing**: Accept or reject orders
- **Status Updates**: Update order preparation status
- **Order History**: View all past orders with analytics

#### Analytics Dashboard
- **Revenue Tracking**: Monthly revenue per restaurant
- **Order Statistics**: Order count and trends
- **Performance Metrics**: Restaurant-wise performance analysis
- **Real-time Updates**: Live data synchronization

---

### 3. 🚴 Delivery Rider

**Getting Started:**
1. Click on "Login & Signup"
2. Select "Rider" role
3. Authenticate using Google OAuth
4. Complete profile with personal details
5. Upload required documents (driver's license, vehicle registration, insurance)
6. Wait for admin verification and approval

**Features:**

#### Profile Management
- Upload verification documents
- Update personal information and vehicle details
- View approval status and ratings

#### Order Delivery
- **Order Assignment**: Receive delivery requests
- **Accept/Reject Orders**: Choose orders based on location and preferences
- **Navigation**: Get route to restaurant and customer locations
- **Real-time Location**: Share live location with customers
- **Status Updates**: Update delivery progress (picked up, in transit, delivered)

#### Earnings & Statistics
- **Earnings Dashboard**: Track daily, weekly, monthly earnings
- **Order History**: View completed deliveries
- **Performance Metrics**: View ratings and performance statistics
- **Availability Toggle**: Set online/offline status

---

### 4. 👨‍💼 Administrator

**Access:**
- Separate admin portal at `/admin`
- Secure login with admin credentials

**Features:**

#### User Management
- **View All Users**: Customers, restaurant owners, riders
- **Account Status**: Ban/unban users with reasons
- **User Analytics**: View user statistics and growth

#### Verification & Approvals
- **Restaurant Owner Verification**: Review and verify business documents
- **Approve/Reject Owners**: Based on document validation
- **Rider Verification**: Review driver licenses and vehicle documents
- **Approve/Reject Riders**: Based on eligibility criteria
- **Restaurant Approval**: Review and approve restaurant listings

#### Restaurant & Food Management
- **View All Restaurants**: Monitor all restaurants in the system
- **Restaurant Status**: Suspend or activate restaurants
- **Food Moderation**: Monitor and moderate food listings
- **Quality Control**: Ensure compliance with platform standards

#### Order Management
- **Monitor Orders**: View all orders across the platform
- **Order Statistics**: Analyze order trends and patterns
- **Dispute Resolution**: Handle customer and restaurant disputes

#### Announcements
- **Create Announcements**: Send platform-wide notifications
- **Targeted Messages**: Notify specific user groups
- **Important Updates**: Share policy changes and updates

#### Analytics & Reporting
- **Dashboard Overview**: Real-time platform statistics
  - Total users (customers, owners, riders)
  - Total restaurants and orders
  - Pending approvals count
- **Revenue Analytics**: Platform revenue and trends
- **Charts & Graphs**: Visual representation using Recharts
- **Audit Logs**: Track all admin actions for accountability
- **User Activity**: Monitor platform usage patterns

#### Audit & Compliance
- **Audit Logs**: Detailed logs of all administrative actions
- **Action History**: Who did what and when
- **Compliance Monitoring**: Ensure platform standards are met

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v6 or higher) - Local or Atlas
- **Git**

### External Services Required

You'll need accounts and API keys for:
1. **MongoDB Atlas** (or local MongoDB)
2. **Google Cloud Console** (for OAuth)
3. **Cloudinary** (for image/document storage)
4. **Mapbox** (for location services)
5. **Email Service** (SMTP credentials for Nodemailer)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/BiteNow.git
cd BiteNow
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `config.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE=mongodb://localhost:27017/bitenow
# OR for MongoDB Atlas:
# DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/bitenow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-key-change-this

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Mapbox Configuration
MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URLs
CUSTOMER_FRONTEND_URL=http://localhost:5173
OWNER_FRONTEND_URL=http://localhost:5174
ADMIN_FRONTEND_URL=http://localhost:5175

# CORS Origin
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### 3. Frontend Setup (Customer App)

```bash
cd ../frontend
npm install
```

Create a `config.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Admin Dashboard Setup

```bash
cd ../admin
npm install
```

Create a `config.env` file in the admin directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `MAPBOX_ACCESS_TOKEN` | Mapbox access token | Yes |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | Yes |
| `EMAIL_USERNAME` | Email username | Yes |
| `EMAIL_PASSWORD` | Email password | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes |
| `VITE_SOCKET_URL` | Socket.IO server URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |

---

## 🎯 Running the Application

### Development Mode

**Option 1: Run each service separately**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Customer Frontend
cd frontend
npm run dev

# Terminal 3 - Admin Dashboard
cd admin
npm run dev
```

**Option 2: Using concurrently (if configured)**

```bash
npm run dev:all
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend (Build and serve)
cd frontend
npm run build
npm run preview

# Admin (Build and serve)
cd admin
npm run build
npm run preview
```

### Default Ports

- **Backend API**: http://localhost:5000
- **Customer Frontend**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174

---

## 📁 Project Structure

```
BiteNow/
├── admin/                      # Admin dashboard application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Admin pages
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── backend/                    # Express.js backend
│   ├── config/                # Configuration files
│   │   └── passport.js        # Passport.js configuration
│   ├── configuration/         # Additional configurations
│   │   └── socket.js          # Socket.IO setup
│   ├── controllers/           # Route controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── customerController.js
│   │   ├── foodController.js
│   │   ├── locationController.js
│   │   ├── orderController.js
│   │   ├── restaurantController.js
│   │   ├── restaurantOwnerController.js
│   │   └── riderController.js
│   ├── middleware/            # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/                # Mongoose models
│   │   ├── adminModel.js
│   │   ├── announcementModel.js
│   │   ├── auditLogs.js
│   │   ├── cartModel.js
│   │   ├── customerModel.js
│   │   ├── foodModel.js
│   │   ├── guestSessionModel.js
│   │   ├── orderModel.js
│   │   ├── otpModel.js
│   │   ├── restaurantModel.js
│   │   ├── restaurantOwnerModel.js
│   │   └── riderModel.js
│   ├── routes/                # API routes
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── restaurantOwnerRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── riderRoutes.js
│   ├── services/              # Business logic services
│   │   ├── locationServices.js
│   │   └── socketService.js
│   ├── utils/                 # Utility functions
│   │   ├── cloudinary.js
│   │   └── sendEmail.js
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   └── package.json
│
├── frontend/                   # Customer-facing React app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── ApprovalMessage.jsx
│   │   │   ├── CartSidebar.jsx
│   │   │   ├── FoodCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OwnerSidebar.jsx
│   │   │   └── RestaurantCard.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── customer/      # Customer pages
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── RestaurantDetail.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── OrderStatus.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── RestaurantOwner/ # Restaurant owner pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Restaurants.jsx
│   │   │   │   ├── Manage_Restaurant.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── rider/         # Rider pages
│   │   │       ├── Home.jsx
│   │   │       └── Profile.jsx
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── API_INTEGRATION.md     # API integration guide
│   ├── CUSTOMER_API_INTEGRATION.md
│   └── package.json
│
└── README.md                   # This file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication Routes (`/api/v1/auth`)
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback
- `POST /logout` - Logout user
- `GET /session` - Get current session

#### Customer Routes (`/api/v1/customers`)
- `GET /:id` - Get customer profile
- `PATCH /:id` - Update customer profile
- `POST /:id/upload-image` - Upload profile picture
- `PATCH /:id/update-image` - Update profile picture
- `DELETE /:id/delete-image` - Delete profile picture

#### Restaurant Owner Routes (`/api/v1/restaurant-owners`)
- `GET /dashboard` - Get owner dashboard
- `GET /:id` - Get owner profile
- `PATCH /:id` - Update owner profile
- `POST /:id/upload-docs` - Upload business documents
- `DELETE /:id/delete-doc` - Delete document

#### Restaurant Routes (`/api/v1/restaurants`)
- `GET /` - Get all restaurants (with pagination & filters)
- `GET /:id` - Get restaurant details
- `POST /` - Create restaurant (owner only)
- `PATCH /:id` - Update restaurant (owner only)
- `DELETE /:id` - Delete restaurant (owner only)
- `POST /:id/upload-image` - Upload restaurant image

#### Food Routes (`/api/v1/foods`)
- `GET /restaurant/:restaurantId` - Get foods by restaurant
- `GET /:id` - Get food details
- `POST /` - Create food item (owner only)
- `PATCH /:id` - Update food item (owner only)
- `DELETE /:id` - Delete food item (owner only)
- `POST /:id/upload-image` - Upload food image

#### Cart Routes (`/api/v1/cart`)
- `POST /get-or-create` - Get or create cart
- `POST /add` - Add item to cart
- `PATCH /update/:itemId` - Update cart item
- `DELETE /remove/:itemId` - Remove cart item
- `DELETE /clear` - Clear cart

#### Order Routes (`/api/v1/orders`)
- `POST /` - Create order from cart
- `GET /customer/:customerId` - Get customer orders
- `GET /restaurant/:restaurantId` - Get restaurant orders
- `GET /rider/:riderId` - Get rider deliveries
- `GET /:id` - Get order details
- `PATCH /:id/status` - Update order status
- `PATCH /:id/assign-rider` - Assign rider to order

#### Rider Routes (`/api/v1/riders`)
- `GET /` - Get all riders
- `GET /:id` - Get rider profile
- `PATCH /:id` - Update rider profile
- `POST /:id/upload-docs` - Upload rider documents
- `PATCH /:id/availability` - Toggle availability

#### Admin Routes (`/api/v1/admin`)
- `GET /dashboard` - Get admin dashboard stats
- `GET /customers` - Get all customers
- `GET /owners` - Get all restaurant owners
- `GET /riders` - Get all riders
- `PATCH /approve-owner/:id` - Approve/reject owner
- `PATCH /approve-rider/:id` - Approve/reject rider
- `PATCH /ban-customer/:id` - Ban/unban customer
- `POST /announcements` - Create announcement
- `GET /audit-logs` - Get audit logs

#### Location Routes (`/api/v1/location`)
- `POST /geocode` - Convert address to coordinates
- `POST /reverse-geocode` - Convert coordinates to address
- `POST /calculate-distance` - Calculate distance between points

### Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "status": "failed",
  "message": "Error message here"
}
```

For detailed API integration examples, see:
- [API_INTEGRATION.md](frontend/API_INTEGRATION.md)
- [CUSTOMER_API_INTEGRATION.md](frontend/CUSTOMER_API_INTEGRATION.md)

---

## 🔒 Security Features

### Authentication & Authorization
- **Google OAuth 2.0**: Secure third-party authentication
- **JWT Tokens**: Stateless authentication with secure token generation
- **Password Hashing**: Bcrypt with salt rounds for password security
- **Session Management**: Secure session handling with express-session
- **Role-Based Access Control (RBAC)**: Different permissions for each user type

### Data Security
- **Input Validation**: Server-side validation for all inputs
- **MongoDB Injection Prevention**: Mongoose schema validation
- **XSS Protection**: Sanitized inputs and outputs
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data stored in .env files

### File Upload Security
- **File Type Validation**: Only allowed file types accepted
- **File Size Limits**: Maximum file size restrictions
- **Cloudinary Security**: Secure cloud storage with access controls

### API Security
- **Rate Limiting**: Prevent API abuse (recommended to add)
- **HTTPS**: SSL/TLS encryption in production
- **Audit Logging**: Track all administrative actions

---

## 🎨 Key Features Implementation

### Real-time Features (Socket.IO)
- Live order status updates
- Real-time rider location tracking
- Instant notifications for new orders
- Live chat support (if implemented)

### Guest Cart System
- Allows browsing without authentication
- Automatic cart expiration (30 minutes)
- Cart preservation on user registration
- Seamless guest-to-user conversion

### Order Management
- Multi-stage order workflow
  1. Pending → Restaurant confirms
  2. Preparing → Restaurant preparing food
  3. Ready → Ready for pickup
  4. Picked Up → Rider collected
  5. In Transit → On the way
  6. Delivered → Completed
- Automatic inventory management
- Transaction handling for data consistency

### Document Verification System
- Restaurant owners upload business licenses
- Riders upload driver licenses and vehicle documents
- Admin reviews and approves/rejects
- Document storage in Cloudinary
- Status tracking (Pending, Approved, Rejected)

---

## 🧪 Testing

### Manual Testing
1. Test user registration and login
2. Test cart functionality (add, update, remove)
3. Test order placement and tracking
4. Test file uploads (images, documents)
5. Test admin approval workflows
6. Test real-time updates

### Recommended Testing Tools
- **Postman**: API testing
- **Jest**: Unit testing (to be implemented)
- **React Testing Library**: Component testing (to be implemented)
- **Socket.IO Client**: WebSocket testing

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
# For local MongoDB
sudo systemctl start mongod

# Or use MongoDB Atlas connection string
```

**2. Google OAuth Error**
```
Error: redirect_uri_mismatch
```
**Solution**: Verify redirect URI in Google Cloud Console matches your callback URL

**3. Cloudinary Upload Fails**
```
Error: Invalid cloud_name
```
**Solution**: Check Cloudinary credentials in config.env

**4. Socket.IO Connection Failed**
```
WebSocket connection failed
```
**Solution**: Ensure backend is running and CORS is properly configured

**5. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process or use a different port
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## 📚 Additional Documentation

- **API Integration Guide**: See `frontend/API_INTEGRATION.md`
- **Customer API Reference**: See `frontend/CUSTOMER_API_INTEGRATION.md`
- **Restaurant Management**: See `frontend/MANAGE_RESTAURANT_IMPLEMENTATION.md`
- **Quick API Reference**: See `frontend/QUICK_API_REFERENCE.md`
- **Color Guide**: See `frontend/COLOR_GUIDE.md`
- **Project Summary**: See `frontend/SUMMARY.md`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint rules
- Write clean, documented code
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **RMOS** - Initial work and development

---

## 🙏 Acknowledgments

- Google for OAuth 2.0 authentication
- Cloudinary for media management
- Mapbox for location services
- MongoDB for the robust database
- Socket.IO for real-time features
- All contributors and users of BiteNow

---

## 📧 Support

For support, email support@bitenow.com or open an issue in the repository.

---

## 🚦 Project Status

**Status**: Active Development

**Version**: 1.0.0

**Last Updated**: February 2026

---

## 🔮 Future Enhancements

- [ ] Mobile applications (React Native)
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Advanced analytics and reporting
- [ ] AI-powered food recommendations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Push notifications
- [ ] In-app chat system
- [ ] Loyalty rewards program
- [ ] Restaurant ratings and reviews
- [ ] Promo codes and discounts system
- [ ] Advanced search with filters
- [ ] Table reservation system
- [ ] Scheduled orders
- [ ] Subscription plans

---

## 🌟 Star Us!

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Made with ❤️ by the BiteNow Team**
