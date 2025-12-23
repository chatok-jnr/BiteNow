const express = require("express");
const { protect, restrictTo } = require("./../middleware/authMiddleware");
const Food = require("./../controllers/foodController");
const { customerUploader, foodUploader } = require("./../utils/cloudinary");

const router = express.Router();

router
  .route("/")
  .get(Food.getAllFood) // All Food in the platform
  .post(protect, restrictTo('restaurant_owner'), Food.createFood); // Create a new food

router.route("/price").get(Food.getFoodByPriceRange); // Get Food by price range

router.route("/discounted").get(Food.getDiscountedFood); // Get Food by discount

router.route("/restaurant/:restaurantId").get(Food.getFoodByRestaurant); // Get food by a specific restaurnat

router
  .route("/:id/restock")
  .patch(protect, restrictTo("restaurant_owner"), Food.restockFood); // Increase the curretn stock of a specifi food

router
  .route("/:id")
  .get(Food.getFood) // Get a specific food
  .patch(protect, restrictTo("restaurant_owner"), Food.updateFood) // update a specific food data
  .delete(protect, restrictTo("restaurant_owner"), Food.deleteFood); // delte a specific food

//food upload, delete, and update
router
  .route("/:id/image")
  .post(protect,
    restrictTo("restaurant_owner"),
    foodUploader.single("image"),
    Food.uploadFoodImage
  )
  .patch(protect,
    restrictTo("restaurant_owner"),
    foodUploader.single("image"),
    Food.updateFoodImage
  )
  .delete(protect, restrictTo("restaurant_owner"), Food.deleteFoodImage);

module.exports = router;
