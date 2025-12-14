const mongoose = require('mongoose');

const User = require('./../models/userModel');
const Restaurant = require('./../models/restaurantModel');
const Food = require('./../models/foodModel');

const orderItemSchema = new mongoose.Schema({
  food_id:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'Food'
  },
  food_name:String,
  quantity:{
    type:Number,
    required:true
  },
  unit_price:Number,
  discount_percentage:Number,
  total_price:Number
}, {
  timestamps:true
});

const orderSchema = new mongoose.Schema({
  order_id:{
    type: String,
    unique: true
  },
  user_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  restaurant_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Restaurant',
    required: true
  },
  rider_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  items:[orderItemSchema],
  subtotal:Number,
  delivery_charge: Number,
  total_amount: Number,
  delivery_address:{
    street: String,
    city: String,
    state: String,
    zip_code: String,
    country: String
  },
  payment_status:{
    type: String,
    enum:['pending', 'paid'],
    default:'pending'
  },
  order_status:{
    type:String,
    enum:['pending', 'look_rider', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default:'pending'
  },
  estimated_delivery_time:Date,
  delivered_at:Date,
  special_instruction: String,
  is_active:{
    type: Boolean,
    default: true
  }
}, {
  timestamps:true
});

// Generate Unique ID
orderSchema.pre('save', async function(next) {
  if(!this.order_id) {
    const date = new Date();
    const timestamps = date.getTime();
    const random = Math.floor(Math.random() * 100);
    this.order_id = `ORD-${timestamps}-${random}`;
  }
  next();
});

// Estimated Delivery time -> Defautl: 45 minute
orderSchema.virtual('default_estimated_delivery_time').get(function() {
  const deliveryTime = new Date(this.createdAt);
  deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
  return deliveryTime;
});

//Methods

// Cancell Order
orderSchema.methods.cancelOrder = async function() {
  if(this.order_status === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }

  this.order_status = 'cancelled';
  return this.save();
}

// Update Status
orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[this.order_status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.order_status} to ${newStatus}`);
  }

  this.order_status = newStatus;
  
  if (newStatus === 'delivered') {
    this.delivered_at = new Date();
  }
  
  return this.save();
};

//Static

// find order by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user_id: userId }).sort('-createdAt');
};

// find order by restaurant
orderSchema.statics.findByRestaurant = function(restaurantId) {
  return this.find({ restaurant_id: restaurantId }).sort('-createdAt');
};

// find by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ order_status: status }).sort('-createdAt');
};

// Restaurant Revenue
orderSchema.statics.getRevenueByRestaurant = async function(restaurantId, startDate, endDate) {
  const matchStage = {
    restaurant_id: new mongoose.Types.ObjectId(restaurantId),
    order_status: 'delivered',
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total_amount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$total_amount' }
      }
    }
  ]);

  return result[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;