const express = require('express');

const adminController = require('./../controllers/adminController');

const {protect, restrictTo} = require('./../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/allCount')
  .get(adminController.getCount);

// Customer -----------------------------------------------
router
  .route('/customer')
  .get(adminController.getAllCustomer);

router
  .route('/customer/:id')
  .patch(adminController.banOrUnabnCustomer)
  .delete(adminController.deleteCustomer);

// Restaurant Owner ---------------------------------------
router  
  .route('/owner')
  .get(adminController.getAllOwner);

router
  .route('/owner/approve-reject/:id')
  .patch(adminController.approveOrRejectOwner);

router
  .route('/owner/:id')
  .patch(adminController.banOrUnbanOwner)
  .delete(adminController.deleteOwner);

// Restaurant ---------------------------------------------
router
  .route('/restaurant')
  .get(adminController.getAllRestaurant)

router
  .route('/restaurant/pending/:id')
  .patch(adminController.acceptOrRejectRestaurant);

router
  .route('/restaurant/:id')
  .patch(adminController.banUnbanRestaurant)
  .delete(adminController.deleteRestaurant);

// Rider --------------------------------------------------
router
  .route('/rider')
  .get(adminController.getRider);

router
  .route('/rider/approve-reject/:id')
  .patch(adminController.approveOrRejectRider);

router
  .route('/rider/:id')
  .delete(adminController.deleteRider)
  .patch(adminController.banUnbanRider);

// Admins ----------------------------------------------------

router
  .route('/announcement')
  .get(adminController.getAnnouncement)
  .post(adminController.createAnnouncement);

router
  .route('/auditLogs')
  .get(adminController.getAllAuditLogs);

router
  .route('/adminLIst')
  .get(adminController.getAllAdmin);

module.exports = router;