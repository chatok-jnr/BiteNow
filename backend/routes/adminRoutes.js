const express = require('express');

const adminController = require('./../controllers/adminController');

const {protect, restrictTo} = require('./../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/update-rider/:id')
  .patch(restrictTo('admin'), adminController.updateRider)

router
  .route('/update-restaurantOwner/:id')
  .patch(restrictTo('admin'), adminController.updateCustomer);

router
  .route('/update-customer/:id')
  .patch(restrictTo('admin'), adminController.updateCustomer);

module.exports = router;