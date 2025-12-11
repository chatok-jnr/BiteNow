const mongoose = require("mongoose");
const User_infos = require("./../models/userModel");
const Restaurant = require("./../models/restaurantModel");

//public
exports.getAllRestaurant = async (req, res) => {
  try {
    //get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //filter
    const filter = {};
    //filter by city for searching benefits
    if (req.query.city) {
      filter["restaurant_address.city"] = req.query.city;
    }
    //filter by status
    if (req.query.status) {
      filter.restaurant_status = req.query.status;
    } else {
      filter.restaurant_status = "Accepted";
    }
    //filter by category
    if (req.query.category) {
      filter.restaurant_category = { $in: [req.query.category] };
    }

    //sorting
    let sort = {};
    if (req.query.sort === "Rating") {
      sort = { "restaurant_rating.average": -1 };
    } else {
      sort = { restaurant_created_at: -1 };
    }

    //execute query
    const restaurants = await Restaurant.find(filter)
      .populate("owner_id", "user_name user_phone user_email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    //Restaurants count using filter
    const totalRestaurant = await Restaurant.countDocuments(filter);

    //send response
    res.status(200).json({
      status: "success",
      page,
      limit,
      totalRestaurant,
      totalPages: Math.ceil(totalRestaurant / limit),
      results: restaurants.length,
      data: {
        restaurants,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message || "Error fetching restaurants",
    });
  }
};
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("owner_id", "user_name user_email user_phone")
      .select("-__v");

    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found!",
      });
    }

    if (
      restaurant.restaurant_status !== "Accepted" &&
      !(req.user && req.user.user_role === "Admin")
    ) {
      return res.status(403).json({
        status: "fail",
        message: "This restaurant is not available!",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        restaurant,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid restaurant ID",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch restaurant",
    });
  }
};
exports.searchRestaurants = async (req, res) => {
  try {
    const { q, city, category } = req.query;
    if (!q && !city && !category) {
      return res.status(404).json({
        status: "fail",
        message: "Please provide search term, city, or category",
      });
    }

    const filter = {
      restaurant_status: "Accepted",
    };

    //search by name
    if (q) {
      filter.restaurant_name = { $regex: q, $options: "i" };
    }
    //search by city
    if (city) {
      filter["restaurant_address.city"] = { $regex: city, $options: "i" };
    }
    //search by category
    if (category) {
      filter.restaurant_category = { $in: [category] };
    }

    const restaurants = await Restaurant.find(filter)
      .populate("owner_id", "user_name")
      .limit(20)
      .select(
        "restaurant_name restaurant_location restaurant_address restaurant_rating restaurant_category"
      );

    res.status(200).json({
      status: "success",
      data: {
        restaurants,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "search failed",
    });
  }
};

//protected
exports.createRestaurant = async (req, res) => {
  try {
    //required field
    const { owner_id, restaurant_name, restaurant_location } = req.body;
    if (!owner_id || !restaurant_name || !restaurant_location) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please provide owner_id, restaurant_name, and restaurant_location",
      });
    }

    //verify owner
    const owner = await User_infos.findById(owner_id);
    if (!owner) {
      return res.status(404).json({
        status: "fail",
        message: "Owner not found",
      });
    }

    //owner role must be Restaurant
    if (owner.user_role !== "Restaurant") {
      return res.status(403).json({
        status: "fail",
        message: "User must have Restaurant role to create a restaurant",
      });
    }

    //create restaurant
    const newRestaurant = await Restaurant.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        restaurant: newRestaurant,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid data sent",
    });
  }
};
exports.getMyRestaurants = async (req, res) => {
  try {
    const owner_id = req.user._id;

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find restaurants owned by current user
    const restaurants = await Restaurant.find({ owner_id })
      .sort({ restaurant_created_at: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await Restaurant.countDocuments({ owner_id });

    res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      results: restaurants.length,
      data: {
        restaurants,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your restaurants",
    });
  }
};
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurantID = req.params.id;
    const userID = req.user._id; // FIXED: was req.User_infos._id

    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found!",
      });
    }

    //check for authorized user - UNCOMMENTED
    if (
      restaurant.owner_id.toString() !== userID.toString() &&
      req.user.user_role !== "Admin"
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this restaurant",
      });
    }

    //allowed field for update
    const allowedUpdates = [
      "restaurant_name",
      "restaurant_location",
      "restaurant_address",
      "restaurant_description",
      "restaurant_contact_info",
      "restaurant_category",
      "restaurant_opening_hours",
      "restaurant_images",
    ];

    //filter out which field are not allowed for update
    const update = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        update[key] = req.body[key];
      }
    });

    //check if there are any valid updates
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No valid fields to update",
      });
    }

    //update the restaurants
    Object.assign(restaurant, update);
    await restaurant.save();

    res.status(200).json({
      status: "success",
      data: {
        restaurant,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid restaurant ID",
      });
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
      });
    }

    res.status(500).json({
      status: "fail",
      message: "Failed to update the restaurant",
    });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurantID = req.params.id;
    const userID = req.user._id;

    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found",
      });
    }

    //chech user is authorized or not
    if (
      restaurant.owner_id.toString() !== userID.toString() &&
      req.user.user_role !== "Admin"
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this restaurant",
      });
    }

    //checkout delation of restaurant revenue and sales
    await Restaurant.findByIdAndDelete(restaurantID);
    res.status(200).json({
      status: "success",
      message: "Restaurant deleted successfully",
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid restaurant ID",
      });
    }
    res.status(500).json({
      status: "fail",
      message: "Failed to delete restaurant",
    });
  }
};
