const express = require("express");
const { restrictTo, protect } = require("./../middleware/authMiddleware");
const customerController = require("./../controllers/customerController");

const { customerUploader } = require("./../utils/cloudinary");

const router = express.Router();

router.use(protect);
router
  .route("/:id")
  .get(restrictTo("customer"), customerController.getMe)
  .patch(restrictTo("customer"), customerController.updMyData);

//image upload, delete, and update route
router
  .route("/:id/image")
  .post(
    restrictTo("customer"),
    customerUploader.single("image"),
    customerController.uploadCustomerImage
  )
  .patch(
    restrictTo("customer"),
    customerUploader.single("image"),
    customerController.updateCustomerImage
  )
  .delete(restrictTo("customer"), customerController.deleteCustomerImage);

module.exports = router;
