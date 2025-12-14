const express = require("express");
const restaurantOwnerController = require("./../controllers/restaurantOwnerController");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

router.post("/register", restaurantOwnerController.registerRestaurantOwner);

module.exports = router;
