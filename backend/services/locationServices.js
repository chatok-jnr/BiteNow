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
  const dLat = toRed(lat2 - lat1);
  const dLon = toRed(lon2 - lon1);

  //haversine formula
  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRed(lat1)) *
      Math.cos(toRed(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  //calculate degree on radius
  const degree = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));

  const distance = R * degree;

  return distance;
};

const toRed = (val) => {
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
      const [restLat, restLon] = restaurant.restaurant_location.coordinates;
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
    throw err;
  }
};
