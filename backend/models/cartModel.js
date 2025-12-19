const mongoose = require('mongoose');
const Food = require('./foodModel');
const Customer = require('./customerModel');
const Restaurant = require('./restaurantModel');

const cartItemSchema = new mongoose.Schema({
  food_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Food'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price_at_time: {
    type: Number,
    required: true
  },
  discount_at_time: {
    type: Number,
    default: 0
  },
  total_price: {
    type: Number,
    required: true
  }
}, {
  _id: true,
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'User_infos'
  },
  restaurant_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Restaurant'
  },
  items:[cartItemSchema],
  subtotal: {
    type:Number,
    default:0
  },
  delivery_charge:{
    type: Number,
    default: 50,
    required: true
  },
  total_amount:{
    type:Number,
    default: 0
  }, 
  expires_at:{
    type: Date,
    default: () => new Date(Date.now() + 24*60*60*1000)
  },
  is_active:{
    type:Boolean,
    default: true
  }
}, {
  timestamps: true
});



//Methods

// Calculate Total cost
cartSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total_price, 0);
  this.total_amount = this.subtotal + this.delivery_charge;
  return this;
};

// Add item
cartSchema.methods.addItem = async function(foodId, quantity) {
  const food = await Food.findById(foodId);
  if(!food) {
    throw new Error(`There is no food with the given id: ${foodId}`);
  }

  if(!food.canBeOrdered(quantity)) {
    throw new Error(`Not Enough stock for ${food.food_name} Available: ${food.food_quantity}`);
  }

  // Check if item already exists in cart
  const existingItemIndex = this.items.findIndex(item => 
    item.food_id.toString() === foodId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].total_price = 
      this.items[existingItemIndex].quantity * 
      (this.items[existingItemIndex].price_at_time - 
       (this.items[existingItemIndex].price_at_time * this.items[existingItemIndex].discount_at_time / 100));
  } else {
    // Add new item
    this.items.push({
      food_id: foodId,
      quantity,
      price_at_time: food.food_price,
      discount_at_time: food.discount_percentage,
      total_price: quantity * food.discounted_price
    });
  }

  this.calculateTotal();
  return this;
};

// Remove Item
cartSchema.methods.removeItem = function(foodId, quantity = 'all') {
  const itemIndex = this.items.findIndex(item => 
    item.food_id.toString() === foodId.toString()
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  if (quantity === 'all' || this.items[itemIndex].quantity <= quantity) {
    // Remove entire item
    this.items.splice(itemIndex, 1);
  } else {
    // Reduce quantity
    this.items[itemIndex].quantity -= quantity;
    this.items[itemIndex].total_price = 
      this.items[itemIndex].quantity * 
      (this.items[itemIndex].price_at_time - 
       (this.items[itemIndex].price_at_time * this.items[itemIndex].discount_at_time / 100));
  }

  this.calculateTotal();
  return this;
};

// Clear Cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.total_amount = this.delivery_charge;
  return this;
};

//Static
cartSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({
    user_id: userId,
    is_active: true,
    expires_at: { $gt: new Date() }
  })
    .populate('items.food_id', 'food_name food_price discount_percentage')
    .populate('restaurant_id', 'restaurant_name');
};

//Create Cart
cartSchema.statics.findOrCreateCart = async function(userId, restaurantId) {
  let cart = await this.findOne({
    user_id: userId,
    restaurant_id: restaurantId,
    is_active: true,
    expires_at: { $gt: new Date() }
  })
    .populate('items.food_id', 'food_name food_price discount_percentage')
    .populate('restaurant_id', 'restaurant_name');

  if (!cart) {
    cart = await this.create({
      user_id: userId,
      restaurant_id: restaurantId
    });
    
    // Populate the newly created cart
    await cart.populate('items.food_id', 'food_name food_price discount_percentage');
    await cart.populate('restaurant_id', 'restaurant_name');
  }

  return cart;
};

const Cart = new mongoose.model('Cart', cartSchema);
module.exports = Cart;