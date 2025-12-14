const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all cart routes - user must be authenticated
router.use(authMiddleware.protect);

// Get or create cart (for a specific restaurant)

// Get active cart
router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.getOrCreateCart)
  .delete(cartController.clearCart);

// Add item to cart
router
  .route('/add')
  .post(cartController.addToCart);

// Remove item from cart
router
  .route('/remove')
  .post(cartController.removeFromCart);

module.exports = router;