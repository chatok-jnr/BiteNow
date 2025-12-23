const Order = require('./../models/orderModel');
const Food = require('./../models/foodModel');
const Cart = require('./../models/cartModel');
const mongoose = require('mongoose');

// Create Order from Cart
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { delivery_address, payment_method, special_instructions } = req.body;
    
    // In real app, get user_id from auth middleware
    const user_id = req.user._id;

    // Get active cart
    const cart = await Cart.findOne({
      user_id,
      is_active: true,
      expires_at: { $gt: new Date() }
    }).session(session);

    if (!cart) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'failed',
        message: 'No active cart found'
      });
    }

    if (cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'failed',
        message: 'Cart is empty'
      });
    }

    // Validate stock availability and prepare order items
    const orderItems = [];
    
    for (const cartItem of cart.items) {
      const food = await Food.findById(cartItem.food_id).session(session);
      
      if (!food) {
        await session.abortTransaction();
        return res.status(404).json({
          status: 'failed',
          message: `Food item ${cartItem.food_id} not found`
        });
      }

      if (!food.canBeOrdered(cartItem.quantity)) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'failed',
          message: `Not enough stock for ${food.food_name}. Available: ${food.food_quantity}, Requested: ${cartItem.quantity}`
        });
      }

      // Update food quantity
      const updated = food.updateQuantity(cartItem.quantity);
      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'failed',
          message: `Failed to update quantity for ${food.food_name}`
        });
      }
      
      await food.save({ session });

      // Prepare order item
      orderItems.push({
        food_id: cartItem.food_id,
        food_name: food.food_name,
        quantity: cartItem.quantity,
        unit_price: cartItem.price_at_time,
        discount_percentage: cartItem.discount_at_time,
        total_price: cartItem.total_price
      });
    }

    // Create order
    const order = await Order.create([{
      customer_id: req.user._id,
      restaurant_id: cart.restaurant_id,
      items: orderItems,
      subtotal: cart.subtotal,
      delivery_charge: cart.delivery_charge,
      total_amount: cart.total_amount,
      delivery_address,
      special_instructions,
      estimated_delivery_time: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    }], { session });

    // Deactivate cart
    cart.is_active = false;
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: { order: order[0] }
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  } finally {
    session.endSession();
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    // In real app, get user_id from auth middleware
    const user_id = req.user._id;
    
    const orders = await Order.find({customer_id:user_id})
      .populate('restaurant_id', 'name')
      .populate('items.food_id', 'food_name');

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Get Order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant_id', 'name address phone')
      .populate('items.food_id', 'food_name');

    if (!order) {
      return res.status(404).json({
        status: 'failed',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Update Order Status (for restaurant/admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'failed',
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'failed',
        message: 'Order not found'
      });
    }

    await order.updateStatus(status);

    res.status(200).json({
      status: 'success',
      message: 'Order status updated',
      data: { order }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'failed',
        message: 'Order not found'
      });
    }

    await order.cancelOrder();

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err.message
    });
  }
};

// Get list of all order of a restaurant
exports.getOrderByRestaurant = async (req, res) => {

  try{
    const {restaurantId} = req.params;
    const myOrder = await Order.find({restaurant_id:restaurantId})
    .populate('restaurant_id', 'restaurant_name restaurant_address restaurant_location');

    if(!myOrder) {
      return res.status(404).json({
        status:'failed',
        message:'No order found for your restaurant'
      });
    };

    res.status(200).json({
      status:'success',
      data:{
        myOrder
      }
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      messge:err.message
    });
  }
}

// Update by Restaurant
exports.updateOrderStatusByRestaurant = async(req, res) => {
  try{
    const orderId = req.params.orderId;

    const resp = await Order.findById(orderId).populate('restaurant_id', 'owner_id');

    const owner_id = resp.restaurant_id.owner_id.toString();
    const userId = req.user._id.toString();
    
   if(owner_id != userId) {
    return res.status(400).json({
      status:'failed',
      message:'You are not authorized to do these changes'
    });
   }

    const updOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        order_status:req.body.order_status,
      },
      {
        new: true,
        runValidators:true
      }
    );

    if(!updOrder) {
      return res.status(404).json({
        status:'failed',
        message:'Order not found or you don\'t have permission'
      });
    }

    res.status(200).json({
      status:'success',
      message:'status changed successfully',
      data:{
        updOrder
      }
    });
  } catch(err) {
    res.status(400).json({
      status:'faield',
      message:err.message
    });
  }
};

//Get the order list which is requred rider
exports.getLookForRider = async(req, res) => {
  try {
    const needRider = await Order.find({'order_status':'look_rider'})
    .sort('-createdAt')
    .populate('restaurant_id', 'restaurant_address restaurant_name restaurant_location');

    if(!needRider) {
      return res.status(500).json({
        status:'failed',
        message:'Internal server problem or No one needs any rider right now'
      });
    }

    res.status(200).json({
      status:'success',
      data: {
        needRider
      }
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

// Rider Accepting Order
exports.availableToDeliver = async (req, res) => {
  try{

    const pin1 = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const pin2 = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    const acceptRide = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        order_status:'preparing',
        rider_pin: pin1,
        customer_pin: pin2
      },
      {
        new:true,
        runValidators:true
      }
    ).populate('restaurant_id', 'restaurant_address');

    const riderResponse = {
      delivery_address: acceptRide.delivery_address,
      pickup_addresss: acceptRide.restaurant_id.restaurant_address,
      items:acceptRide.items,
      subtotal:acceptRide.subtotal,
      deliver_charge:acceptRide.delivery_charge,
      total:acceptRide.total_amount,
      payment_status:acceptRide.payment_status,
      order_status:acceptRide.order_status,
      estimated_delivery_time:acceptRide.estimated_delivery_time,
      rider_pin:acceptRide.rider_pin
    };

    res.status(200).json({
      status:'Accepted',
      data:{
        riderResponse
      }
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Verify Rider Pin
exports.verifyRider = async (req, res) => {
  try{
    const {order_id, rider_otp} = req.body;
    if(!order_id || !rider_otp) {
      return res.status(400).json({
        status:'failed',
        message:'Required orderId + riderOtp'
      });
    }

    const orderInfo = await Order.findById(order_id)
    .select('+rider_pin');

    if(!orderInfo) {
      return res.status(404).json({
        status:'failed',
        message:`No order found with this id: ${order_id}`
      });
    }

    const areYouRider = (orderInfo.rider_pin === rider_otp);

    if(!areYouRider) {
      return res.status(400).json({
        status:'failed',
        message:'Wrong Pin Number'
      });
    }

    await Order.findByIdAndUpdate(order_id, {
      order_status:'out_for_delivery'
    });

    res.status(200).json({
      status:'success',
      message:"He is Our Rider"
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  } 
}

//Verify Customer Pin
exports.verifyCustomer = async (req, res) => {
  try{
    const {order_id, customer_pin} = req.body;
    if(!order_id || !customer_pin) {
      return res.status(400).json({
        status:'failed',
        message:'Missing orderId or customer pin'
      });
    }

    const order = await Order.findById(order_id)
    .select('+customer_pin');

    if(order.customer_pin !== customer_pin) {
      return res.status(400).json({
        status:'failed',
        message:'Wrong Pin NUmber'
      });
    }

    await Order.findByIdAndUpdate(order_id, {
      order_status:'delivered',
      payment_status:'paid'
    });

    await Restaurant.findByIdAndUpdate(order.restaurant_id, {
      restaurant_total_revenue:order.subtotal,
     // restaurant_total_sales: 
    });

    res.status(200).json({
      status:'success',
      message:'Delivered Successfully'
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}