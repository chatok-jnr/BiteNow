const express = require("express");
const { protect, restrictTo } = require("./../middleware/authMiddleware");
const riderController = require("./../controllers/riderController");
const { riderUploader, riderDocUploader } = require("./../utils/cloudinary");

const router = express.Router();

router.use(protect);

router
  .route("/all")
  .get(restrictTo("rider", "admin"), riderController.getAllRiders);

router
  .route("/:id")
  .get(restrictTo("rider", "admin"), riderController.getRiderById)
  .patch(restrictTo("rider", "admin"), riderController.updateRider)
  .delete(restrictTo("rider", "admin"), riderController.deleteRider);

//image upload, delete, and update route
router
  .route("/:id/image")
  .post(
    restrictTo("rider"),
    riderUploader.single("image"),
    riderController.uploadRiderImage
  )
  .patch(
    restrictTo("rider"),
    riderUploader.single("image"),
    riderController.updateRiderImage
  )
  .delete(restrictTo("rider"), riderController.deleteRiderImage);

//for documents
router
  .route("/:id/docs")
  .post(
    restrictTo("rider"),
    riderDocUploader.array("doc", 5),
    riderController.uploadRiderDocs
  )
  .delete(restrictTo("rider"), riderController.deleteRiderDocs);

router
  .route("/:id/doc/:docId")
  .delete(restrictTo("rider"), riderController.deleteRiderDoc);

module.exports = router;
