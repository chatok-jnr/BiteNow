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
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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
