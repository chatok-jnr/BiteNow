const Cart = require('./../models/cartModel');
const Food = require('./../models/foodModel');

// Get or Create Cart
exports.getOrCreateCart = async (req, res) => {
  try {
    const { restaurant_id } = req.body;
    
    if (!restaurant_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Restaurant ID is required'
      });
    }

    // Get user_id from auth middleware (for authenticated users) or guest session
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    const cart = await Cart.findOrCreateCart(user_id, restaurant_id, guest_session_id);
    
    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {

    console.log()

    const { food_id, quantity = 1 } = req.body;
    
    if (!food_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Food ID is required'
      });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: 'failed',
        message: 'Quantity must be a positive integer'
      });
    }

    // Get food to check availability and get restaurant
    const food = await Food.findById(food_id);
    if (!food) {
      return res.status(404).json({
        status: 'failed',
        message: 'Food not found'
      });
    }

    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    console.log(`Guest ID = ${guest_session_id}`);

    // Check if user/guest has ANY active cart first
    let cart;
    if (user_id) {
      cart = await Cart.findOne({
        user_id,
        is_active: true
      });
    } else {
      cart = await Cart.findOne({
        guest_session_id,
        is_active: true
      });
    }

    // If cart exists, verify it's for the same restaurant
    if (cart && cart.restaurant_id.toString() !== food.restaurant_id.toString()) {
      return res.status(400).json({
        status: 'failed',
        message: 'Cannot add items from different restaurants to the same cart. Please clear your current cart first.'
      });
    }

    // Create new cart if none exists
    if (!cart) {
      const cartData = {
        restaurant_id: food.restaurant_id
      };
      
      if (user_id) {
        cartData.user_id = user_id;
      } else {
        cartData.guest_session_id = guest_session_id;
      }

      cart = await Cart.create(cartData);
    }

    // Add item to cart
    await cart.addItem(food_id, quantity);
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: { cart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { food_id, quantity = 'all' } = req.body;
    
    if (!food_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Food ID is required'
      });
    }

    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    let cart;
    if (user_id) {
      cart = await Cart.findOne({
        user_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    } else {
      cart = await Cart.findOne({
        guest_session_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    }

    if (!cart) {
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found'
      });
    }

    cart.removeItem(food_id, quantity);
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    let cart;
    if (user_id) {
      cart = await Cart.findActiveByUser(user_id);
    } else {
      cart = await Cart.findActiveByGuest(guest_session_id);
    }

    if (!cart) {
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    let cart;
    if (user_id) {
      cart = await Cart.findOne({
        user_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    } else {
      cart = await Cart.findOne({
        guest_session_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    }

    if (!cart) {
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found'
      });
    }

    cart.clearCart();
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: { cart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Migrate guest cart to user account (called after login/register)
exports.migrateGuestCart = async (req, res) => {
  try {
    const { guest_session_id } = req.body;
    
    if (!guest_session_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Guest session ID is required'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        status: 'failed',
        message: 'User must be authenticated to migrate cart'
      });
    }

    const user_id = req.user._id;
    const migratedCart = await Cart.migrateGuestCart(guest_session_id, user_id);

    if (!migratedCart) {
      return res.status(200).json({
        status: 'success',
        message: 'No guest cart to migrate',
        data: { cart: null }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Guest cart migrated successfully',
      data: { cart: migratedCart }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};