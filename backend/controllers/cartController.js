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
    const { food_id, quantity = 1 } = req.body;
    
    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    console.log('🛒 Add to Cart Request:', {
      food_id,
      quantity,
      user_id: user_id ? user_id.toString() : null,
      guest_session_id,
      isAuthenticated: req.isAuthenticated,
      hasUser: !!req.user,
      hasGuestSession: !!req.guestSessionId,
      authHeader: req.headers.authorization ? 'Present' : 'None',
      guestHeader: req.headers['x-guest-session-id'] || 'None'
    });
    
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

    // Validate restaurant_id (MongoDB ObjectId should be 24 characters)
    const restaurantIdString = food.restaurant_id.toString();
    if (restaurantIdString.length !== 24) {
      console.error('❌ CORRUPTED RESTAURANT ID DETECTED:', {
        foodId: food_id,
        foodName: food.food_name,
        restaurantId: food.restaurant_id,
        restaurantIdLength: restaurantIdString.length
      });
      return res.status(500).json({
        status: 'failed',
        message: 'Data integrity error: Invalid restaurant ID. Please contact support.'
      });
    }

    console.log('✅ Restaurant ID validated:', {
      restaurantId: restaurantIdString,
      length: restaurantIdString.length
    });

    // Check if user/guest has ANY active cart first
    let cart;
    if (user_id) {
      console.log('🔍 Looking for cart by user_id:', user_id.toString());
      cart = await Cart.findOne({
        user_id,
        is_active: true
      });
    } else {
      console.log('🔍 Looking for cart by guest_session_id:', guest_session_id);
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
    
    console.log('🗑️ Remove from Cart Request:', {
      food_id,
      quantity,
      user_id: req.user ? req.user._id.toString() : null,
      guest_session_id: req.guestSessionId || null
    });
    
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
      console.log('🔍 Looking for cart by user_id');
      cart = await Cart.findOne({
        user_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    } else {
      console.log('🔍 Looking for cart by guest_session_id');
      cart = await Cart.findOne({
        guest_session_id,
        is_active: true,
        expires_at: { $gt: new Date() }
      });
    }

    if (!cart) {
      console.log('❌ No active cart found');
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found'
      });
    }

    console.log('📦 Cart found, items before removal:', cart.items.length);

    // Use try-catch for removeItem to handle "item not found" error
    try {
      cart.removeItem(food_id, quantity);
      await cart.save();
      console.log('✅ Item removed, items after removal:', cart.items.length);
    } catch (removeError) {
      console.log('❌ Error in removeItem:', removeError.message);
      return res.status(400).json({
        status: 'failed',
        message: removeError.message || 'Failed to remove item from cart'
      });
    }

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

// Clear Cart - Deletes all carts for the user/guest
exports.clearCart = async (req, res) => {
  try {
    // Get user_id or guest_session_id
    const user_id = req.user ? req.user._id : null;
    const guest_session_id = req.guestSessionId || null;
    
    let deleteResult;
    
    if (user_id) {
      // Delete ALL active carts for this user
      deleteResult = await Cart.deleteMany({
        user_id,
        is_active: true
      });
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} cart(s) for user:`, user_id.toString());
    } else {
      // Delete ALL active carts for this guest session
      deleteResult = await Cart.deleteMany({
        guest_session_id,
        is_active: true
      });
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} cart(s) for guest:`, guest_session_id);
    }

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found to delete'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Cart${deleteResult.deletedCount > 1 ? 's' : ''} deleted successfully`,
      data: { 
        deletedCount: deleteResult.deletedCount 
      }
    });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
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