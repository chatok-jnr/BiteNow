// controllers/cartController.js
const Cart = require('./../models/cartModel');
const Food = require('./../models/foodModel');
const mongoose = require('mongoose');

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

    // Get user_id from auth middleware
    const user_id = req.user._id;
    
    const cart = await Cart.findOrCreateCart(user_id, restaurant_id);
    
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
    
    if (!food_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Food ID is required'
      });
    }

    // Parse quantity if it's a string
    const parsedQuantity = typeof quantity === 'string' ? Number(quantity) : quantity;

    // Validate quantity is a positive integer
    const isValidNumber = typeof parsedQuantity === 'number' && !isNaN(parsedQuantity);
    const isPositive = parsedQuantity > 0;
    const isInteger = Number.isInteger(parsedQuantity);
    
    if (!isValidNumber || !isPositive || !isInteger) {
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

    // Get user_id from auth middleware
    const user_id = req.user._id;
    
    // Find or create cart for this restaurant
    let cart = await Cart.findOne({
      user_id,
      restaurant_id: food.restaurant_id,
      is_active: true
    });

    if (!cart) {
      cart = await Cart.create({
        user_id,
        restaurant_id: food.restaurant_id
      });
    } else if (cart.restaurant_id.toString() !== food.restaurant_id.toString()) {
      return res.status(400).json({
        status: 'failed',
        message: 'Cannot add items from different restaurants to the same cart'
      });
    }

    // Add item to cart
    await cart.addItem(food_id, parsedQuantity);
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

    // Get user_id from auth middleware
    const user_id = req.user._id;
    
    const cart = await Cart.findOne({
      user_id,
      is_active: true,
      expires_at: { $gt: new Date() }
    });

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
    // Get user_id from auth middleware
    const user_id = req.user._id;
    
    const cart = await Cart.findActiveByUser(user_id);

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
    // Get user_id from auth middleware
    const user_id = req.user._id;
    
    const cart = await Cart.findOne({
      user_id,
      is_active: true,
      expires_at: { $gt: new Date() }
    });

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