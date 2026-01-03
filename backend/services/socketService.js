const { getIO } = require("./../configuration/socket");

//emit orer status update
exports.emitOrderStatusUpdate = (orderId, status, additionalData = {}) => {
  try {
    const io = getIO();

    io.to(`order: ${orderId}`).emit("order:status:update", {
      oderId,
      status,
      message: getStatusMessage(status),
      ...additionalData,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Socket emit error", err);
  }
};

//emit rider assigned notification
exports.emitRiderAssigned = (orderId, customerId, riderData) => {
  try {
    const io = getIO();
    io.to(`user: ${customerId}`).emit("order:rider:assigned", {
      orderId,
      rider: {
        id: riderData._id,
        name: riderData.rider_name,
        phone: riderData.rider_contact_info.emergency_contact,
        rating: riderData.ridar_status?.average_rating || 0,
        total_deliveries: riderData.rider_status?.total_deliveries || 0,
        image: riderData.rider_image?.url || null,
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Socket emit error:", err);
  }
};

//emit new order alert to nearby rider
exports.emitNewOrderAlert = (nearbyRiderIds, orderData) => {
  try {
    const io = getIO();
    nearbyRiderIds.forEach((riderId) => {
      io.to(`user: ${riderId}`).emit("order:new:nearby", {
        orderId: orderData._id,
        restaurant: {
          id: orderData.restaurant_id._id,
          name: orderData.restaurant_id.restaurant_name,
          location: orderData.restaurant_location,
        },
        delivery: {
          address: orderData.delivery_address,
          location: orderData.customer_location,
        },
        order: {
          items: orderData.items.length,
          subtotal: orderData.subtotal,
          deliveryCharge: orderData.delivery_charge,
          totalAmount: orderData.total_amount,
        },
        distance: orderData.distance,
        estimatedEarnings: orderData.delivery_charge,
        timestamp: new Date(),
      });
    });
  } catch (err) {
    console.error("Socket emit error", err);
  }
};

//emit real time location update
exports.emitRiderLocationUpdate = (orderId, location, eta) => {
  try {
    const io = getIO();

    io.to(`order: ${orderId}`).emit("rider:location:update", {
      orderId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      eta: eta,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Socket emit error: ", err);
  }
};

//emit order delivered notification
exports.emitOrderDelivered = (orderId, customerId, deliveryDetails) => {
  try {
    const io = getIO();

    io.to(`user: ${customerId}`).emit("order:delivered", {
      orderId,
      deliveredAt: deliveryDetails.delivered_at,
      deliveryTime: deliveryDetails.deliveryTime,
      message: "Your oder has been delivered! Enjoy your meal",
      timestamp: new Date(),
    });

    io.to("admin").emit("order:completed", {
      oderId,
      customerId,
      completeAt: new Date(),
    });
  } catch (err) {
    console.error("Socket emit error", err);
  }
};

//emit payment status update
exports.emitPaymentStatusUpdate = (orderId, customerId, paymentStatus) => {
  try {
    const io = getIO();
    io.to(`user: ${customerId}`).emit("payment:status:update", {
      orderId,
      paymentStatus,
      message:
        paymentStatus === "paid" ? "Payment received" : "Payment pending",
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Socket emit error", err);
  }
};

//Status message
const getStatusMessage = (status) => {
  const message = {
    pending: "Order placed successfully! Waiting for confirmation",
    look_rider: "Looking for a nearby rider to deliver your order",
    preparing: "Restaurant is preparing your delicious food",
    ready_for_pickup: "Order is ready! Waiting for rider pickup",
    out_for_delivery: "Rider is on the way to deliver your order",
    delivered: "Order delivered! Bon appétit!",
    cancelled: "Order has been cancelled",
  };
  return message[status] || "Order status updated";
};
