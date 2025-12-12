const express = require("express");
const authMiddleware = require("./../middleware/authMiddleware");
const riderController = require("./../controllers/riderController");

const router = express.Router();

router.post("/register", riderController.registerRider);

module.exports = router;
