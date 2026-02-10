const Order = require("./../models/orderModel");
const Food = require("./../models/foodModel");
const Cart = require("./../models/cartModel");
const mongoose = require("mongoose");
const Restaurant = require("./../models/restaurantModel");
const Rider = require("./../models/riderModel");
const Customer = require("./../models/customerModel");

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
      expires_at: { $gt: new Date() },
    }).session(session);

    if (!cart) {
      await session.abortTransaction();
      return res.status(404).json({
        status: "failed",
        message: "No active cart found",
      });
    }

    if (cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        status: "failed",
        message: "Cart is empty",
      });
    }

    // Validate stock availability and prepare order items
    const orderItems = [];

    for (const cartItem of cart.items) {
      const food = await Food.findById(cartItem.food_id).session(session);

      if (!food) {
        await session.abortTransaction();
        return res.status(404).json({
          status: "failed",
          message: `Food item ${cartItem.food_id} not found`,
        });
      }

      if (!food.canBeOrdered(cartItem.quantity)) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "failed",
          message: `Not enough stock for ${food.food_name}. Available: ${food.food_quantity}, Requested: ${cartItem.quantity}`,
        });
      }

      // Update food quantity
      const updated = food.updateQuantity(cartItem.quantity);
      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          status: "failed",
          message: `Failed to update quantity for ${food.food_name}`,
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
        total_price: cartItem.total_price,
      });
    }

    // Get customer and restaurant locations
    const customer = await Customer.findById(req.user._id).session(session);
    const restaurant = await Restaurant.findById(cart.restaurant_id).session(
      session,
    );

    // Prepare location data
    const orderData = {
      customer_id: req.user._id,
      restaurant_id: cart.restaurant_id,
      items: orderItems,
      subtotal: cart.subtotal,
      delivery_charge: cart.delivery_charge,
      total_amount: cart.total_amount,
      delivery_address,
      special_instructions,
      estimated_delivery_time: new Date(Date.now() + 45 * 60000), // 45 minutes from now
    };

    // Add customer location if available
    if (
      customer &&
      customer.customer_location &&
      customer.customer_location.coordinates
    ) {
      orderData.customer_location = {
        type: "Point",
        coordinates: customer.customer_location.coordinates,
      };
    }

    // Add restaurant location if available
    if (
      restaurant &&
      restaurant.restaurant_location &&
      restaurant.restaurant_location.coordinates
    ) {
      orderData.restaurant_location = {
        type: "Point",
        coordinates: restaurant.restaurant_location.coordinates,
      };
    }

    // Create order
    const order = await Order.create([orderData], { session });

    // Deactivate cart
    cart.is_active = false;
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: { order: order[0] },
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({
      status: "failed",
      message: err.message,
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

    const orders = await Order.find({ customer_id: user_id })
      .populate(
        "restaurant_id",
        "restaurant_name restaurant_image restaurant_address restaurant_contact_info",
      )
      .populate("items.food_id", "food_name food_image food_price")
      .populate("rider_id", "rider_name rider_contact_info rider_stats")
      .select("-rider_pin")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { orders },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Get Order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant_id", "name address phone")
      .populate("items.food_id", "food_name");

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Update Order Status (for restaurant/admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: "failed",
        message: "Status is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    await order.updateStatus(status);

    res.status(200).json({
      status: "success",
      message: "Order status updated",
      data: { order },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    await order.cancelOrder();

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Get list of all order of a restaurant
exports.getOrderByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const myOrder = await Order.find({ restaurant_id: restaurantId }).populate(
      "restaurant_id",
      "restaurant_name restaurant_address restaurant_location",
    );

    if (!myOrder) {
      return res.status(404).json({
        status: "failed",
        message: "No order found for your restaurant",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        myOrder,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      messge: err.message,
    });
  }
};

// Update by Restaurant
exports.updateOrderStatusByRestaurant = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const resp = await Order.findById(orderId).populate(
      "restaurant_id",
      "owner_id",
    );

    if (!resp) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    if (!resp.restaurant_id || !resp.restaurant_id.owner_id) {
      return res.status(400).json({
        status: "failed",
        message: "Restaurant information not found for this order",
      });
    }

    const owner_id = resp.restaurant_id.owner_id.toString();
    const userId = req.user._id.toString();

    if (owner_id != userId) {
      return res.status(400).json({
        status: "failed",
        message: "You are not authorized to do these changes",
      });
    }

    const updOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        order_status: req.body.order_status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updOrder) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found or you don't have permission",
      });
    }

    res.status(200).json({
      status: "success",
      message: "status changed successfully",
      data: {
        updOrder,
      },
    });
  } catch (err) {
    console.error("Error in updateOrderStatusByRestaurant:", err);
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Get the order list which is requred rider
exports.getLookForRider = async (req, res) => {
  try {
    const needRider = await Order.find({
      order_status: { $in: ["look_rider", "preparing"] },
      $or: [{ rider_id: { $exists: false } }, { rider_id: null }],
    })
      .sort("-createdAt")
      .populate(
        "restaurant_id",
        "restaurant_address restaurant_name restaurant_location",
      )
      .populate("customer_id", "name phone");

    res.status(200).json({
      status: "success",
      data: {
        needRider,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Get My Order List(rider)
exports.getMyOrderList = async (req, res) => {
  try {
    const riderId = req.user._id;
    let myOrder = await Order.find({
      rider_id: riderId,
      order_status: {
        $in: ["ready_for_pickup", "preparing", "out_for_delivery", "delivered"],
      },
    })
      .select("-customer_pin")
      .populate(
        "restaurant_id",
        "restaurant_name restaurant_address restaurant_image",
      )
      .populate("customer_id", "name phone")
      .sort("-createdAt");

    res.status(200).json({
      status: "success",
      myOrder,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "err.message",
    });
  }
};

// Rider Accepting Order
exports.availableToDeliver = async (req, res) => {
  try {
    const rider = await Rider.findById(req.user._id);
    if (rider.rider_status !== "Approved") {
      res.status(403).json({
        status: "failed",
        message: "Your account is either not approved yet or banned",
      });
    }

    const pin1 = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const pin2 = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    const acceptRide = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        rider_id: req.user._id,
        rider_pin: pin1,
        customer_pin: pin2,
        order_status: "preparing",
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("restaurant_id", "restaurant_address");

    const riderResponse = {
      delivery_address: acceptRide.delivery_address,
      pickup_addresss: acceptRide.restaurant_id.restaurant_address,
      items: acceptRide.items,
      subtotal: acceptRide.subtotal,
      deliver_charge: acceptRide.delivery_charge,
      total: acceptRide.total_amount,
      payment_status: acceptRide.payment_status,
      order_status: acceptRide.order_status,
      estimated_delivery_time: acceptRide.estimated_delivery_time,
      rider_pin: acceptRide.rider_pin,
    };

    res.status(200).json({
      status: "Accepted",
      data: {
        riderResponse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// // For Rider Completed order
// exports.successFullyDelivered = async (req, res) => {
//   try{
//     const rider_id = req.user._id;
//     const list = await Order.find({
//       rider_id:rider_id,
//       order_status:'delivered'
//     });

//     if(!list) {
//       res.status(404).json({
//         status:'failed',
//         message:'Not found'
//       });
//     }

//     res.status(200).json({
//       status:'success',
//       completed_list:list
//     });
//   } catch(err) {
//     res.status(400).json({
//       status:'failed',
//       message:err.message
//     });
//   }
// };

//Verify Rider Pin (Restaurant Side)
exports.verifyRider = async (req, res) => {
  try {
    const { order_id, rider_otp } = req.body;

    if (!order_id || !rider_otp) {
      return res.status(400).json({
        status: "failed",
        message: "Required orderId + riderOtp",
      });
    }

    // Find order with restaurant and rider_pin information
    const orderInfo = await Order.findById(order_id)
      .select("+rider_pin")
      .populate("restaurant_id", "owner_id restaurant_name");

    if (!orderInfo) {
      return res.status(404).json({
        status: "failed",
        message: `No order found with this id: ${order_id}`,
      });
    }

    // Verify restaurant ownership (for restaurant owner access)
    if (req.user && req.user._id) {
      if (!orderInfo.restaurant_id || !orderInfo.restaurant_id.owner_id) {
        return res.status(400).json({
          status: "failed",
          message: "Restaurant information not found for this order",
        });
      }

      const owner_id = orderInfo.restaurant_id.owner_id.toString();
      const userId = req.user._id.toString();

      if (owner_id !== userId) {
        return res.status(403).json({
          status: "failed",
          message: "You are not authorized to verify riders for this order",
        });
      }
    }

    // Verify rider PIN (convert to number for comparison)
    const areYouRider = orderInfo.rider_pin === parseInt(rider_otp);

    if (!areYouRider) {
      return res.status(400).json({
        status: "failed",
        message: "Wrong Pin Number",
      });
    }

    // Update order status to out_for_delivery
    const updatedOrder = await Order.findByIdAndUpdate(
      order_id,
      { order_status: "out_for_delivery" },
      { new: true },
    );

    res.status(200).json({
      status: "success",
      message: "Rider verified successfully. Order is now out for delivery",
      data: {
        order: updatedOrder,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Verify Customer Pin
exports.verifyCustomer = async (req, res) => {
  try {
    const { order_id, customer_pin } = req.body;
    if (!order_id || !customer_pin) {
      return res.status(400).json({
        status: "failed",
        message: "Missing orderId or customer pin",
      });
    }

    const order = await Order.findById(order_id).select("+customer_pin");

    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found",
      });
    }

    // Verify customer PIN (convert to number for comparison)
    if (order.customer_pin !== parseInt(customer_pin)) {
      return res.status(400).json({
        status: "failed",
        message: "Wrong Pin Number",
      });
    }

    await Order.findByIdAndUpdate(order_id, {
      order_status: "delivered",
      payment_status: "paid",
    });

    await Restaurant.findByIdAndUpdate(order.restaurant_id, {
      restaurant_total_revenue: order.subtotal,
      // restaurant_total_sales:
    });

    res.status(200).json({
      status: "success",
      message: "Delivered Successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Migration: Update existing orders with missing location coordinates
exports.migrateOrderLocations = async (req, res) => {
  try {
    // Find orders without location coordinates
    const orders = await Order.find({
      $or: [
        { customer_location: { $exists: false } },
        { restaurant_location: { $exists: false } },
        { "customer_location.coordinates": { $exists: false } },
        { "restaurant_location.coordinates": { $exists: false } },
      ],
    });

    let updated = 0;
    let failed = 0;
    const errors = [];

    for (const order of orders) {
      try {
        const updateData = {};

        // Get customer location if missing
        if (!order.customer_location || !order.customer_location.coordinates) {
          const customer = await Customer.findById(order.customer_id);
          if (
            customer &&
            customer.customer_location &&
            customer.customer_location.coordinates
          ) {
            updateData.customer_location = {
              type: "Point",
              coordinates: customer.customer_location.coordinates,
            };
          }
        }

        // Get restaurant location if missing
        if (
          !order.restaurant_location ||
          !order.restaurant_location.coordinates
        ) {
          const restaurant = await Restaurant.findById(order.restaurant_id);
          if (
            restaurant &&
            restaurant.restaurant_location &&
            restaurant.restaurant_location.coordinates
          ) {
            updateData.restaurant_location = {
              type: "Point",
              coordinates: restaurant.restaurant_location.coordinates,
            };
          }
        }

        // Update order if we have data
        if (Object.keys(updateData).length > 0) {
          await Order.findByIdAndUpdate(order._id, updateData);
          updated++;
        }
      } catch (err) {
        failed++;
        errors.push({ orderId: order._id, error: err.message });
      }
    }

    res.status(200).json({
      status: "success",
      message: `Migration completed. Updated: ${updated}, Failed: ${failed}, Total: ${orders.length}`,
      data: {
        updated,
        failed,
        total: orders.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err.message,
    });
  }
};
