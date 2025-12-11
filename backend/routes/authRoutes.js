const express = require('express');
const sendEmail = require('./../utils/sendEmail');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/register')
  .post(authController.createUser);

router  
  .route('/login')
  .post(authController.loginUser);

router
  .route('/verify-otp')
  .post(authController.verifyOtp);

router
  .route('/new-otp')
  .post(authController.newOtp);
module.exports = router;