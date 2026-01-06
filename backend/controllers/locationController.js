const locationService = require("./../services/locationServices");
const socketService = require("./../services/socketService");
const Customer = require("./../models/customerModel");
const Order = require("./../models/orderModel");
const Rider = require("./../models/riderModel");

//update the current location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "customer") {
      await Customer.findByIdAndUpdate(userId, {
        customer_location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastLocationUpdate: new Date(),
      });
    } else if (userRole === "rider") {
      await Rider.findByIdAndUpdate(userId, {
        rider_location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        lastLocationUpdate: new Date(),
        rider_last_active_at: new Date(),
      });

      const activeOrders = await Order.find({
        rider_id: userId,
        order_status: { $in: ["out_for_delivery", "ready_for_pickup"] },
      }).populate("customer_id", "customer_location customer_name");

      for (const order of activeOrders) {
        if (
          !order.customer_id.location ||
          !order.customer_id.location.coordinates
        ) {
          continue;
        }

        const [customerLat, customerLon] =
          order.customer_id.location.coordinates;

        const distance = await locationService.calculateDistance(
          latitude,
          longitude,
          customerLat,
          customerLon
        );

        //assume rider speed is 30kmh
        const etaMinutes = Math.round((distance / 30) * 60);

        //emit socket.io
        socketService.emitRiderLocationUpdate(
          order._id,
          { latitude, longitude },
          etaMinutes
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: "Location updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
//get nearby restaurant for customers
exports.getNearByReataurants = async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxDistance } = req.query;

    const customer = await Customer.findById(userId);
    if (!customer || !customer.customer_location || !customer.customer_location.coordinates) {
      return res.status(404).json({
        status: "error",
        message: "Customer location not found",
      });
    }

    const [longitude, latitude] = customer.customer_location.coordinates;

    const nearbyRestaurants = await locationService.findNearestRestaurants(
      latitude,
      longitude,
      maxDistance ? parseFloat(maxDistance) : 10
    );

    res.status(200).json({
      status: "success",
      results: nearbyRestaurants.length,
      data: nearbyRestaurants,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
};
//get nearby orders for riders
exports.getNearByOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxDistance } = req.query;

    const rider = await Rider.findById(userId);

    if (!rider || !rider.rider_location || !rider.rider_location.coordinates) {
      res.status(404).json({
        status: "error",
        message: "Rider location not found",
      });
    }
    const [longitude, latitude] = rider.rider_location.coordinates;

    const nearbyOrders = await locationService.findNearestOrders(
      latitude,
      longitude,
      maxDistance ? parseFloat(maxDistance) : 15
    );

    res.status(200).json({
      status: "success",
      results: nearbyOrders.length,
      data: nearbyOrders,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
};
//get delivery route from customer to restaurant
exports.getDeliveryRoutes = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("restaurant_id", "restaurant_address restaurant_name")
      .populate("customer_id", "customer_name");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }
    if(!order.customer_location || !order.restaurant_location) {
      return res.status(400).json({
        status: 'error',
        message: 'Order locations not set. Cannot calculate route.'
      })
    }

    const restaurantCoords =
      order.restaurant_location.coordinates;
    const customerCoords = order.customer_location.coordinates;

    const route = await locationService.getDirections(
      restaurantCoords,
      customerCoords
    );

    res.status(200).json({
      status: "success",
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      origin: {
        coordinates: restaurantCoords,
      },
      destination: {
        coordinates: customerCoords,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
};
//track rider location for specific order
exports.trackRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("rider_id, rider_location rider_name rider_contact_info rider_stats")
      .populate("customer_id, customer_name")
      .populate("restaurant_id, restaurant_name");
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    if (!order.rider_id) {
      return res.status(404).json({
        status: "error",
        message: "Rider not assigned yet. Please wait while we find a rider...",
        orderStatus: order.order_status
      });
    }

    const riderLocation = order.rider_id.rider_location;
    if (!riderLocation || !riderLocation.coordinates) {
      return res.status(404).json({
        status: "error",
        messageP: "Rider location not available yet. They may be updating their GPS...",
      });
    }

    const [riderLat, riderLon] = riderLocation.coordinates;

    if(!order.customer_location || !order.customer_location.coordinates) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer location not set for this order'
      })
    }

    const [customerLat, customerLon] =
      order.customer_location.coordinates;

    const distanceToCustomer = await locationService.calculateDistance(
      riderLat,
      riderLon,
      customerLat,
      customerLon
    );

    //get route
    const route = await locationService.getDirections(
      [riderLon, riderLat],
      [customerLon, customerLat]
    );

    res.status(200).json({
      status: "success",
      data: {
        order: {
          id: order._id,
          orderId: order.order_id,
          status: order.order_status,
          restaurant: order.restaurant_id.restaurant_name,
          estimatedDeliveryTime: order.estimated_delivery_time,
          deliveryAddress: order.delivery_address
        },
        rider: {
          id: order.rider_id._id,
          name: order.rider_id.rider_name,
          phone: order.rider_id.rider_contact_info.emergency_contact,
          rating: order.rider_id.rider_stats.average_rating,
          totalDeliveries: order.rider_id.rider_stats.total_deliveries,
          location: {
            latitude: riderLat,
            longitude: riderLon,
          },
        },
        tracking: {
          distanceToCustomer: `${distanceToCustomer.toFixed(2)} km`,
          estimatedTime: `${route.duration} minutes`,
          route: route.geometry,
        },
        websocket: {
          message: "Connect to Socket.IO and emit 'order:track' with this orderId for live updates",
          event: "rider:location:update"
        }
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
};
