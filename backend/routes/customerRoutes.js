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
    customerController.uploadCustomerImage,
  )
  .patch(
    restrictTo("customer"),
    customerUploader.single("image"),
    customerController.updateCustomerImage,
  )
  .delete(restrictTo("customer"), customerController.deleteCustomerImage);

//address management routes
router
  .route("/:id/addresses")
  .get(restrictTo("customer"), customerController.getAddresses)
  .post(restrictTo("customer"), customerController.addAddress);

router
  .route("/:id/addresses/:addressId")
  .patch(restrictTo("customer"), customerController.updateAddress)
  .delete(restrictTo("customer"), customerController.deleteAddress);

router
  .route("/:id/addresses/:addressId/default")
  .patch(restrictTo("customer"), customerController.setDefaultAddress);

module.exports = router;
