const express = require("express");
const restaurantOwnerController = require("./../controllers/restaurantOwnerController");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

router.patch("/update/:id", authMiddleware.protect, restaurantOwnerController.updateRestaurantOwner);
router.delete("/delete/:id", authMiddleware.protect, restaurantOwnerController.deleteRestaurantOwner);

module.exports = router;
