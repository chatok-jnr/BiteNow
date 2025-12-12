const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const riderRoutes = require("./routes/riderRoutes");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/riders", riderRoutes);
module.exports = app;
