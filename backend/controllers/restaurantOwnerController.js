const mongoose = require("mongoose");
const RestaurantOwner = require("./../models/restaurantOwnerModel");

exports.registerRestaurantOwner = async (req, res) => {
  try {
    const requiredFields = [
      "restaurant_owner_name",
      "restaurant_owner_phone",
      "restaurant_owner_email",
      "restaurant_owner_password",
      "restaurant_owner_gender",
      "restaurant_owner_dob",
      "restaurant_owner_address",
    ];
    const missingFields = [];
    requiredFields.forEach((fields) => {
      if (!req.body[fields]) {
        missingFields.push(fields.replace("restaurant_owner_", ""));
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing requird fields: ${missingFields.join(", ")}`,
      });
    }

    //prepare data
    const restaurantOwnerData = {
      restaurant_owner_name: req.body.restaurant_owner_name,
      restaurant_owner_phone: req.body.restaurant_owner_phone,
      restaurant_owner_email: req.body.restaurant_owner_email,
      restaurant_owner_password: req.body.restaurant_owner_password,
      restaurant_owner_gender: req.body.restaurant_owner_gender,
      restaurant_owner_status: "Offline",
      restaurant_owner_dob: req.body.restaurant_owner_dob,
      restaurant_owner_address: req.body.restaurant_owner_address,
    };

    const newRestaurantOwner = await RestaurantOwner.create(
      restaurantOwnerData
    );
    res.status(201).json({
      status: "success",
      message: "Restaurant owner registration submitted successfully",
      data: newRestaurantOwner,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message || "Failed to register as Restaurant owner",
    });
  }
};

exports.getAllRestaurantOwner = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.updateRestaurantOwner = async (req, res) => {
  try {
    const ownerID = req.params.id;
    const userID = req.user._id;

    const restaurantOwner = await RestaurantOwner.findById(ownerID);

    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Invalid request! Restaurant owner not found",
      });
    }
    
    //

  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
