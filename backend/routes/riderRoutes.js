const express = require("express");
const authMiddleware = require("./../middleware/authMiddleware");
const riderController = require("./../controllers/riderController");

const router = express.Router();

router.post("/register", riderController.registerRider);
router.get("/all", riderController.getAllRiders);
router.get("/:id", riderController.getRiderById);
router.patch("/:id", authMiddleware.protect, riderController.updateRider);
router.delete("/:id", authMiddleware.protect, riderController.deleteRider);

module.exports = router;
