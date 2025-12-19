const express = require('express');
const cartController = require('../controllers/cartController');
const {protect, restrictTo} = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all cart routes - user must be authenticated
router.use(protect);

// Get or create cart (for a specific restaurant)

// Get active cart
router
  .route('/')
  .get(restrictTo('customer'), cartController.getCart)
  .post(restrictTo('customer'), cartController.getOrCreateCart)
  .delete(restrictTo('customer'), cartController.clearCart);

// Add item to cart
router
  .route('/add')
  .post(restrictTo('customer'), cartController.addToCart);

// Remove item from cart
router
  .route('/remove')
  .post(restrictTo('customer'), cartController.removeFromCart);

module.exports = router;