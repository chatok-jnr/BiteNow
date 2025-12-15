const express = require('express');
const sendEmail = require('./../utils/sendEmail');
const authController = require('./../controllers/authController');

const router = express.Router();

//For Customer
router
  .route('/register/customer')
  .post(authController.createCustomer);

router
  .route('/verify-otp/customer')
  .post(authController.verifyCustomerOtp);

router  
  .route('/login/customer')
  .post(authController.loginCustomer);

//For Rider
router
  .route('/register/rider')
  .post(authController.createRider);

router  
  .route('/login/rider')
  .post(authController.loginRider);

router
  .route('/verify-otp/rider')
  .post(authController.verifyRiderOtp);

//For restaurant Owner
router
  .route('/register/restaurant-owner')
  .post(authController.createRestaurantOwner);

router
  .route('/verify-otp/restaurant-owner')
  .post(authController.restaurantOwnerVerification);

router  
  .route('/login/restaurant-owner')
  .post(authController.loginRestaurantOwner);

router
  .route('/new-otp')
  .post(authController.newOtp);

module.exports = router;