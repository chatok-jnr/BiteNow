const mongoose = require("mongoose");
const RestaurantOwner = require("./../models/restaurantOwnerModel");

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
exports.deleteRestaurantOwner = async (req, res) => {
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
    await RestaurantOwner.findByIdAndDelete(ownerID);
    res.status(200).json({
      status: "success",
      message: "Restaurant owner deleted succesfully",
    });
  } catch (err) {
    res.status();
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid restaurant owner ID",
      });
    }
    res.status(500).json({
      status: "fail",
      message: "Failed to delete restaurant owner",
    });
  }
};
