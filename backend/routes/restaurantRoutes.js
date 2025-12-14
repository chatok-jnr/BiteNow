const express = require("express");
const restaurantController = require("./../controllers/restaurantController");
const authMiddleware = require("./../middleware/authMiddleware");

const router = express.Router();

//public
router.get("/", restaurantController.getAllRestaurant);
router.get("/search/all", restaurantController.searchRestaurants);
router.get("/:id", restaurantController.getRestaurantById);

//protected - ADD AUTHENTICATION MIDDLEWARE
router.post("/register", authMiddleware.protect, restaurantController.createRestaurant);
router.get(
  "/my/list",
  authMiddleware.protect,
  restaurantController.getMyRestaurants
);
router.patch(
  "/:id",
  authMiddleware.protect,
  restaurantController.updateRestaurant
);
router.delete(
  "/:id",
  authMiddleware.protect,
  restaurantController.deleteRestaurant
);

module.exports = router;
