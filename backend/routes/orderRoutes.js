const express = require('express');

const orderController = require('./../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { route } = require('./authRoutes');

const router = express.Router();

// Protect all order routes - user must be authenticated
router.use(authMiddleware.protect);

//Routes for REstauratn
router
  .route('/restaurant/:restaurantId')
  .get(orderController.getOrderByRestaurant)
router
  .route('/restaurant/:orderId')
  .patch(orderController.updateOrderStatusByRestaurant);

//Routes for riders
router
  .route('/rider')
  .get(orderController.getLookForRider);
router
  .route('/rider/:orderId')
  .patch(orderController.availableToDeliver);

//Regular Order routes
router.route('/')
  .get(orderController.getUserOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrder);

router.route('/:id/status')
  .patch(orderController.updateOrderStatus);

router.route('/:id/cancel')
  .post(orderController.cancelOrder);

module.exports = router;