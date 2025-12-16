const express = require("express");
const restaurantController = require("./../controllers/restaurantController");
const { protect, restrictTo } = require("./../middleware/authMiddleware");
const { upload } = require("./../utils/cloudinary");
const RestaurantOwner = require("../models/restaurantOwnerModel");

const router = express.Router();

//public
router.get("/", restaurantController.getAllRestaurant);
router.get("/search/all", restaurantController.searchRestaurants);
router.get("/:id", restaurantController.getRestaurantById);

router.use(protect);

router
  .route("/register")
  .post(restrictTo("restaurant_owner"), restaurantController.createRestaurant);

router
  .route("/my/list")
  .get(
    restrictTo("admin", "restaurant_owner"),
    restaurantController.getMyRestaurants
  );

router
  .route("/:id")
  .patch(restrictTo("restaurant_owner"), restaurantController.updateRestaurant)
  .delete(
    restrictTo("restaurant_owner"),
    restaurantController.deleteRestaurant
  );

//Image upload routes
//upload image
router
  .route("/:id/image")
  .post(
    restrictTo("restaurant_owner"),
    upload.single("image"),
    restaurantController.uploadRestaurantImage
  );
//delete specific image
router
  .route("/:id/image/:imgId")
  .delete(
    restrictTo("restaurant_owner"),
    restaurantController.deleteRestaurantImage
  );
//update image
router
  .route("/:id/image/:imgId")
  .patch(
    restrictTo("restaurant_owner"),
    upload.single("image"),
    restaurantController.updateRestaurantImage
  )
  .delete(
    restrictTo("restaurant_owner"),
    restaurantController.deleteRestaurantImage
  );

module.exports = router;
