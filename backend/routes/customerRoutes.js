const Customer = require('./../controllers/customerController');
const express = require('express');

const {restrictTo, protect} = require('./../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router
  .route('/:id')
  .get(restrictTo('customer'), Customer.getMe)
  .patch(restrictTo('customer'), Customer.updMyData)

module.exports = router;
