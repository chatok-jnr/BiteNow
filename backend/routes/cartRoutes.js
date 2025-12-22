const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Use optional protect for cart operations (allows both authenticated and guest users)
router.use(authMiddleware.optionalProtect);

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

// Migrate guest cart to user account (requires authentication)
router
  .route('/migrate')
  .post(authMiddleware.protect, cartController.migrateGuestCart);

module.exports = router;