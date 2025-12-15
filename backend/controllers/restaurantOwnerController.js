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
      restaurant_owner_status: "Pending",
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
    // Authorization check
    if (restaurantOwner._id.toString() !== userID.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this restaurant owner",
      });
    }
    // allowed fields
    const allowedUpdates = [
      "restaurant_owner_name",
      "restaurant_owner_phone",
      "restaurant_owner_gender",
      "restaurant_owner_dob",
      "restaurant_owner_address",
    ];

    const update = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        update[key] = req.body[key];
      }
    });

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid fields to update",
      });
    }

    Object.assign(restaurantOwner, update);
    await restaurantOwner.save();

    res.status(200).json({
      status: "success",
      message: "Restaurant owner updated successfully",
      data: {
        restaurantOwner,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
