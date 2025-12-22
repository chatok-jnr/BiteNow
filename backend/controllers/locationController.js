const locationService = require("./../services/locationServices");
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
      });
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
    if (!customer || !customer.customer_location) {
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

    if (!rider || !rider.rider_location) {
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
      .populate("restaurant_id", "restaurant_location")
      .populate("customer_id", "customer_location");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    const restaurantCoords =
      order.restaurant_id.restaurant_location.coordinates;
    const customerCoords = order.customer_id.customer_location.coordinates;

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
      .populate("rider_id, rider_location rider_name")
      .populate("customer_id, customer_location")
      .populate("restaurant_id, restaurant_location");
    if (!order) {
      return res.status(404).json({
        status: "error",
        messageP: "Order not found",
      });
    }

    if (!order.rider_id) {
      return res.status(404).json({
        status: "error",
        messageP: "Rider not found",
      });
    }

    const riderLocation = order.rider_id.rider_location;
    if (!riderLocation) {
      return res.status(404).json({
        status: "error",
        messageP: "Rider location not available",
      });
    }

    const [riderLat, riderLon] = riderLocation.coordinates;
    const [customerLat, customerLon] =
      order.customer_id.customer_location.coordinates;

    const distanceToCustomer = await locationService.calculateDistance(
      riderLat,
      riderLon,
      customerLat,
      customerLon
    );

    res.status(200).json({
      status: "success",
      data: {
        rider: {
          id: order.rider_id,
          name: order.rider_name,
          location: {
            latitude: riderLat,
            longitude: riderLon,
          },
        },
        distanceToCustomer: distanceToCustomer.toFixed(2),
        orderStatus: order.order_status,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
};
