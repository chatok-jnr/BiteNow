const express = require("express");
const restaurantOwnerController = require("./../controllers/restaurantOwnerController");
const { protect, restrictTo } = require("./../middleware/authMiddleware");
const {
  restaurantOwnerUploader,
  restaurantOwnerDocUploader,
} = require("./../utils/cloudinary");
const router = express.Router();

router
  .route("/update/:id")
  .patch(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerController.updateRestaurantOwner
  );
router
  .route("/delete/:id")
  .delete(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerController.deleteRestaurantOwner
  );

//for image
router
  .route("/:id/image")
  .post(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerUploader.single("image"),
    restaurantOwnerController.uploadOwnerImage
  )
  .patch(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerUploader.single("image"),
    restaurantOwnerController.updateOwnerImage
  )
  .delete(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerController.deleteOwnerImage
  );

//for documents
router
  .route("/:id/docs")
  .post(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerDocUploader.array("docs", 5),
    restaurantOwnerController.uploadOwnerDocs
  )
  .delete(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerController.deleteOwnerDocs
  );

router
  .route("/:id/doc/:docId")
  .delete(
    protect,
    restrictTo("restaurant_owner"),
    restaurantOwnerController.deleteOwnerDoc
  );

module.exports = router;
