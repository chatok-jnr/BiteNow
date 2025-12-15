const express = require('express');
const Food = require('./../controllers/foodController');

const router = express.Router();

router
  .route('/')
  .get(Food.getAllFood)
  .post(Food.createFood);

router
  .route('/price')
  .get(Food.getFoodByPriceRange);

router
  .route('/discounted')
  .get(Food.getDiscountedFood);

router
  .route('/restaurant/:restaurantId')
  .get(Food.getFoodByRestaurant);

router
  .route('/:id/restock')
  .patch(Food.restockFood);

router  
  .route('/:id')
  .get(Food.getFood)
  .patch(Food.updateFood)
  .delete(Food.deleteFood);
  
module.exports = router;