const express = require('express');
// const sendEmail = require('./../utils/sendEmail');
const authController = require('./../controllers/authController');
const passport = require('./../config/passport');

const router = express.Router();

//For Admin
// router
//   .route('/register/admin')
//   .post(authController.createAdmin);
// router
//   .route('/verify-admin')
//   .post(authController.verifyAdmin);
router
  .route('/login/admin')
  .post(authController.adminLogin);

//For Customer
router
  .route('/register/customer')
  .post(authController.createCustomer);

// router
//   .route('/verify-otp/customer')
//   .post(authController.verifyCustomerOtp);

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

// router
//   .route('/verify-otp/rider')
//   .post(authController.verifyRiderOtp);

//For restaurant Owner
router
  .route('/register/restaurant-owner')
  .post(authController.createRestaurantOwner);

// router
//   .route('/verify-otp/restaurant-owner')
//   .post(authController.restaurantOwnerVerification);

router  
  .route('/login/restaurant-owner')
  .post(authController.loginRestaurantOwner);

// router
//   .route('/new-otp')
//   .post(authController.newOtp);

// Google OAuth routes for Customer
router.get('/google/customer', 
  passport.authenticate('google-customer', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/customer/callback', 
  passport.authenticate('google-customer', { 
    failureRedirect: '/api/v1/auth/google/failure',
    session: false 
  }),
  authController.googleAuthSuccessCustomer
);

// Google OAuth routes for Restaurant Owner
router.get('/google/restaurant', 
  passport.authenticate('google-restaurant', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/restaurant/callback', 
  passport.authenticate('google-restaurant', { 
    failureRedirect: '/api/v1/auth/google/failure',
    session: false 
  }),
  authController.googleAuthSuccessRestaurant
);

// Google OAuth routes for Rider
router.get('/google/rider', 
  passport.authenticate('google-rider', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/rider/callback', 
  passport.authenticate('google-rider', { 
    failureRedirect: '/api/v1/auth/google/failure',
    session: false 
  }),
  authController.googleAuthSuccessRider
);

router.get('/google/failure', authController.googleAuthFailure);

module.exports = router;