const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const riderRoutes = require("./routes/riderRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const restaurantOwnerRoutes = require("./routes/restaurantOwnerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();
app.use(morgan("dev"));

// Cors for development
// app.use(cors());

// Cors for production
const whiteList = [
  'https://bite-now-admin.netlify.app',
  'https://bite-now.netlify.app/',
  'http://localhost:5173',
  'http://localhost:5174'
];

const corsOption = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOption));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(`${__dirname}/public`));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PATCH') {
    console.log('Body received:', Object.keys(req.body).length > 0 ? 'YES' : 'NO (EMPTY)');
  }
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/riders", riderRoutes);
app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/restaurants-owner", restaurantOwnerRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/location", locationRoutes);

module.exports = app;
