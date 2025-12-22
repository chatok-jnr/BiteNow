const express = require("express");
const locationController = require("./../controllers/locationController");
const { protect } = require("./../middleware/authMiddleware");

const router = express.Router();

//update current location for rider and customer
router.route("/update").post(protect, locationController.updateLocation);
//get nearby restaurants for customer
router
  .route("/nearby-restaurants")
  .get(protect, locationController.getNearByReataurants);

//get nearby orders for rider
router.route("/nearby-orders").get(protect, locationController.getNearByOrders);

//get delivery route
router.route("/delivery-route/:orderId").get(protect, locationController.getDeliveryRoutes);

//track rider location for specific order
router.route('/track-rider/:orderId').get(protect, locationController.trackRider);

module.exports = router;
