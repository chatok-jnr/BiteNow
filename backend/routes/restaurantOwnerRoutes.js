const express = require("express");
const restaurantOwnerController = require("./../controllers/restaurantOwnerController");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

router.post("/register", restaurantOwnerController.registerRestaurantOwner);
router.patch("/update/:id", authMiddleware.protect, restaurantOwnerController.updateRestaurantOwner);
module.exports = router;
