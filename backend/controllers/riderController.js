const mongoose = require("mongoose");
const User_infos = require("./../models/userModel");
const Rider = require("./../models/riderModel");

//GetAll riders
exports.getAllRiders = async (req, res) => {
  try {
    //Step 01 -> Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //Step 02 -> Data filtering and sorting

    //filtering data
    const filter = {};
    //by status
    if (req.query.status) {
      filter.rider_status = req.query.status;
    }

    //sorting data
    let sort = {};

    //by rating
    if (req.query.sort === "Rating") {
      sort = { "rider_stats.average_rating": -1 }; //for highest rating
    }

    //Step 03: Filter and sort out Data from raw data
    const riders = await Rider.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const totalRider = await Rider.countDocuments(filter);

    res.status(200).json({
      status: "success",
      page,
      limit,
      totalPages: Math.ceil(totalRider / limit),
      results: riders.length,
      data: {
        riders,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Error fetching riders",
    });
  }
};
//GetRiderById
exports.getRiderById = async (req, res) => {
  try {
    //Step 01 => Find and check the data
    //find
    const rider = await Rider.findById(req.params.id);

    //check
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: err.message || "Rider not found",
      });
    }

    //step 02 => Check data validity. Who can see the data?
    if (
      rider.rider_status !== "Approved" &&
      !(req.user && req.user.user_role === "Admin")
    ) {
      return res.status(403).json({
        status: "error",
        message: "This rider is not available!",
      });
    }

    //step 03 => show the data
    res.status(200).json({
      status: "success",
      data: {
        rider,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: err.message || "Not found data",
    });
  }
};
//update rider
exports.updateRider = async (req, res) => {
  try {
    //Step 01 => Find data
    const riderID = req.params.id;
    const userID = req.user._id;

    const rider = await Rider.findById(riderID);

    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found",
      });
    }

    //step 02 => check for authorized user

    if (
      rider.rider_id.toString() !== userID.toString() &&
      req.user.user_role !== "Admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this rider",
      });
    }

    //step 03 => allowed field select
    const allowedUpdates = [
      "rider_name",
      "rider_email",
      "rider_password",
      "rider_date_of_birth",
      "rider_gender",
      "rider_address",
      "rider_documents.nid_no",
      "rider_documents.profile_photo.url",
      "rider_contact_info.emergency_contact",
      "rider_contact_info.alternative_phone",
    ];

    //step 04 => filter out and check valid update
    const update = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        update[key] = req.body[key];
      }
    });

    //check valid update
    if (Object.keys(update).length === 0) {
      return res.stutas(400).json({
        status: "error",
        message: "No valid fields to update",
      });
    }

    //Step 05 => update the rider and show data
    Object.assign(rider, update);
    await rider.save();
    res.status(200).json({
      status: "success",
      data: {
        rider,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid rider ID",
      });
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
      });
    }

    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
//delete rider
exports.deleteRider = async (req, res) => {
  try {
    //Step 01 => Find data
    const riderID = req.params.id;
    const userID = req.user._id;

    const rider = await Rider.findById(riderID);

    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found",
      });
    }

    //step 02 => check for authorized user

    if (
      rider.rider_id.toString() !== userID.toString() &&
      req.user.user_role !== "Admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update this rider",
      });
    }

    //Delete rider data
    await Rider.findByIdAndDelete(riderID);
    res.status(200).json({
      status: "success",
      message: "Rider deleted successfully",
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
      message: err.message || "Failed to delete rider",
    });
  }
};
