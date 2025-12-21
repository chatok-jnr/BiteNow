const express = require('express');
const Food = require('./../controllers/foodController');

const {protect, restrictTo} = require('./../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(Food.getAllFood) // All Food in the platform
  .post(restrictTo('restaurant_owner'), Food.createFood); // Create a new food

router
  .route('/price')
  .get(Food.getFoodByPriceRange); // Get Food by price range

router
  .route('/discounted')
  .get(Food.getDiscountedFood); // Get Food by discount

router
  .route('/restaurant/:restaurantId')
  .get(Food.getFoodByRestaurant); // Get food by a specific restaurnat

router
  .route('/:id/restock')
  .patch(restrictTo('restaurant_owner'), Food.restockFood); // Increase the curretn stock of a specifi food

router  
  .route('/:id')
  .get(Food.getFood) // Get a specific food
  .patch(restrictTo('restaurant_owner'), Food.updateFood) // update a specific food data
  .delete(restrictTo('restaurant_owner'), Food.deleteFood); // delte a specific food
  
module.exports = router;