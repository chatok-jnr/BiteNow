const express = require('express');

const adminController = require('./../controllers/adminController');

const {protect, restrictTo} = require('./../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/auditLogs')
  .get(adminController.getAllAuditLogs);

router
  .route('/allCount')
  .get(adminController.getCount);
router
  .route('/owner/approve-reject/:id')
  .patch(adminController.approveOrRejectOwner);

module.exports = router;