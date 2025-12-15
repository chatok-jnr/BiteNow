const express = require("express");
const {protect, restrictTo} = require("./../middleware/authMiddleware");
const riderController = require("./../controllers/riderController");

const router = express.Router();

router.use(protect);

router
  .route('/all')
  .get(restrictTo('rider', 'admin'), riderController.getAllRiders);

router
  .route('/:id')
  .get(restrictTo('rider', 'admin'), riderController.getRiderById)
  .patch(restrictTo('rider', 'admin'), riderController.updateRider)
  .delete(restrictTo('rider', 'admin'), riderController.deleteRider);

module.exports = router;
