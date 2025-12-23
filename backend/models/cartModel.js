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
    required: false,
    ref: 'Customer',
    default: null
  },
  guest_session_id: {
    type: String,
    required: false,
    default: null
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

// Validation: Either user_id or guest_session_id must be present
cartSchema.pre('validate', function(next) {
  if (!this.user_id && !this.guest_session_id) {
    next(new Error('Either user_id or guest_session_id is required'));
  } else {
    next();
  }
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
    .populate('items.food_id', 'food_name food_price discount_percentage food_image')
    .populate('restaurant_id', 'restaurant_name');
};

cartSchema.statics.findActiveByGuest = function(guestSessionId) {
  return this.findOne({
    guest_session_id: guestSessionId,
    is_active: true,
    expires_at: { $gt: new Date() }
  })
    .populate('items.food_id', 'food_name food_price discount_percentage food_image')
    .populate('restaurant_id', 'restaurant_name');
};

//Create Cart
cartSchema.statics.findOrCreateCart = async function(userId, restaurantId, guestSessionId = null) {
  const query = {
    restaurant_id: restaurantId,
    is_active: true,
    expires_at: { $gt: new Date() }
  };

  if (userId) {
    query.user_id = userId;
  } else if (guestSessionId) {
    query.guest_session_id = guestSessionId;
  } else {
    throw new Error('Either userId or guestSessionId is required');
  }

  let cart = await this.findOne(query)
    .populate('items.food_id', 'food_name food_price discount_percentage food_image')
    .populate('restaurant_id', 'restaurant_name');

  if (!cart) {
    const cartData = {
      restaurant_id: restaurantId
    };
    
    if (userId) {
      cartData.user_id = userId;
    } else {
      cartData.guest_session_id = guestSessionId;
    }

    cart = await this.create(cartData);
    
    // Populate the newly created cart
    await cart.populate('items.food_id', 'food_name food_price discount_percentage food_image');
    await cart.populate('restaurant_id', 'restaurant_name');
  }

  return cart;
};

// Migrate guest cart to user account
cartSchema.statics.migrateGuestCart = async function(guestSessionId, userId) {
  console.log('🔍 Looking for guest cart:', { guestSessionId, userId });
  
  const guestCart = await this.findOne({
    guest_session_id: guestSessionId,
    is_active: true,
    expires_at: { $gt: new Date() }
  })
    .populate('items.food_id', 'food_name food_price discount_percentage food_image')
    .populate('restaurant_id', 'restaurant_name');

  console.log('📦 Guest cart found:', {
    found: !!guestCart,
    cartId: guestCart?._id,
    itemCount: guestCart?.items?.length || 0,
    restaurantId: guestCart?.restaurant_id
  });

  if (!guestCart) {
    console.log('⚠️ No guest cart to migrate');
    return null; // No guest cart to migrate
  }

  // Check if user already has an active cart
  const userCart = await this.findOne({
    user_id: userId,
    is_active: true,
    expires_at: { $gt: new Date() }
  })
    .populate('items.food_id', 'food_name food_price discount_percentage food_image')
    .populate('restaurant_id', 'restaurant_name');

  console.log('👤 User cart found:', {
    found: !!userCart,
    cartId: userCart?._id,
    itemCount: userCart?.items?.length || 0,
    restaurantId: userCart?.restaurant_id
  });

  if (userCart) {
    // If user has a cart from a different restaurant, deactivate guest cart
    if (userCart.restaurant_id.toString() !== guestCart.restaurant_id.toString()) {
      console.log('⚠️ Different restaurants - keeping user cart, deactivating guest cart');
      guestCart.is_active = false;
      await guestCart.save();
      return userCart; // Keep user's existing cart
    } else {
      console.log('✅ Same restaurant - merging carts');
      // Same restaurant, merge items
      for (const guestItem of guestCart.items) {
        const existingItemIndex = userCart.items.findIndex(item => 
          item.food_id.toString() === guestItem.food_id.toString()
        );

        if (existingItemIndex > -1) {
          // Add quantities
          console.log(`  Merging item ${guestItem.food_id}: ${userCart.items[existingItemIndex].quantity} + ${guestItem.quantity}`);
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
          userCart.items[existingItemIndex].total_price = 
            userCart.items[existingItemIndex].quantity * 
            (userCart.items[existingItemIndex].price_at_time - 
             (userCart.items[existingItemIndex].price_at_time * userCart.items[existingItemIndex].discount_at_time / 100));
        } else {
          // Add new item
          console.log(`  Adding new item ${guestItem.food_id}`);
          userCart.items.push(guestItem);
        }
      }
      userCart.calculateTotal();
      await userCart.save();
      
      // Deactivate guest cart
      guestCart.is_active = false;
      await guestCart.save();
      
      console.log('✅ Merged cart:', { itemCount: userCart.items.length });
      return userCart;
    }
  } else {
    console.log('🔄 No user cart - converting guest cart to user cart');
    // User has no cart, convert guest cart to user cart
    guestCart.user_id = userId;
    guestCart.guest_session_id = null;
    await guestCart.save();
    
    // Populate the cart before returning
    await guestCart.populate('items.food_id', 'food_name food_price discount_percentage food_image');
    await guestCart.populate('restaurant_id', 'restaurant_name');
    
    console.log('✅ Converted cart:', { cartId: guestCart._id, itemCount: guestCart.items.length });
    return guestCart;
  }
};

const Cart = new mongoose.model('Cart', cartSchema);
module.exports = Cart;