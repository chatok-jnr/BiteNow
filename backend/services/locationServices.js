const mbxClient = require("@mapbox/mapbox-sdk");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxDirections = require("@mapbox/mapbox-sdk/services/directions");

//initialize mapbox client
const baseClient = mbxClient({
  accessToken: process.env.MAPBOX_ACCESS_TOKEN,
});
const geocodingService = mbxGeocoding(baseClient);
const directionsService = mbxDirections(baseClient);

//Calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  //haversine formula
  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  //calculate degree on radius
  const degree = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));

  const distance = R * degree;

  return distance;
};

const toRad = (val) => {
  return (val * Math.PI) / 180;
};

//convert address to coordinates
const geocodeAddress = async (address) => {
  try {
    const res = await geocodingService
      .forwardGeocode({
        query: address,
        limit: 1,
      })
      .send();

    if (res.body.features.length > 0) {
      const [longitude, latitude] = res.body.features[0].center;
      return { latitude, longitude };
    }

    throw new Error("Address not found");
  } catch (err) {
    console.error("Geocoding error:", err);
    throw err;
  }
};

//convert coordinate to human readable address
const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await geocodingService.reverseGeocode({
      query: [longitude, latitude],
      limit: 1,
    });

    if (res.body.features.length > 0) {
      return res.body.features[0].place_name;
    }

    throw new Error("Location not found");
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    throw err;
  }
};

//show nearest restaurant to the customer
const findNearestRestaurants = async (
  customerLat,
  customerLon,
  maxDistance = 10
) => {
  try {
    //get all restaurants from the database
    const Restaurant = require("./../models/restaurantModel");
    const restaurants = await Restaurant.find({
      restaurant_status: "Accepted",
      "restaurant_location.coordinates": {
        $exists: true,
      },
    });

    //calculate distance for each restaurant
    const restaurantsWithDistance = restaurants.map((restaurant) => {
      const [restLon, restLat] = restaurant.restaurant_location.coordinates;
      const distance = calculateDistance(
        customerLat,
        customerLon,
        restLat,
        restLon
      );

      return {
        ...restaurant.toObject(),
        distance: distance.toFixed(2),
      };
    });

    //filter by max distance and sort by nearest
    const nearbyRestaurants = restaurantsWithDistance
      .filter((r) => r.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    return nearbyRestaurants;
  } catch (err) {
    console.error("Error finding nearest restaurants:", err);
    throw err;
  }
};

//Calculate nearby orders from riders
const findNearestOrders = async (riderLat, riderLon, maxDistance = 15) => {
  try {
    const Order = require("./../models/orderModel");

    const orders = await Order.find({
      order_status: "look_rider",
      rider_id: null,
      'restaurant_location.coordinates': {$exists: true},
      'customer_location.coordinates': {$exists: true},
    })
      .populate("restaurant_id", "restaurant_name restaurant_address")
      .populate("customer_id", "customer_name customer_phone");

    //calculate distance rider to restaurant and restaurant to customer
    const ordersWithDistance = orders.map((order) => {
      const [restLon, restLat] =
        order.restaurant_location.coordinates;
      const [cusLat, cusLon] = order.customer_location.coordinates;
      const d1 = calculateDistance(riderLat, riderLon, restLat, restLon);
      const d2 = calculateDistance(restLat, restLon, cusLat, cusLon);
      const distance = d1 + d2;

      return {
        ...order.toObject(),
        distanceFromRider: distance.toFixed(2),
        distanceToRestaurant: d1.toFixed(2),
        distanceToCustomer: d2.toFixed(2),
      };
    });

    //filter and sort
    const nearbyOrders = ordersWithDistance
      .filter((o) => o.distanceFromRider <= maxDistance)
      .sort((a, b) => a.distanceFromRider - b.distanceFromRider);

    return nearbyOrders;
  } catch (err) {
    console.error("Error finding nearest orders:", err);
    throw err;
  }
};

//finding best directions
const getDirections = async (origin, destination) => {
  try {
    const res = await directionsService
      .getDirections({
        profile: "driving",
        waypoints: [{ coordinates: origin }, { coordinates: destination }],
        geometries: "geojson",
      })
      .send();

    if (res.body.routes.length > 0) {
      const route = res.body.routes[0];
      return {
        distance: (route.distance / 1000).toFixed(2), //convert meter to Km
        duration: Math.round(route.duration / 60), //convert second to minute
        geometry: route.geometry,
      };
    }
    throw new Error("No route found");
  } catch (err) {
    console.error("Directions error:", err);
    throw err;
  }
};

module.exports = {
  calculateDistance,
  geocodeAddress,
  reverseGeocode,
  findNearestRestaurants,
  findNearestOrders,
  getDirections,
};
