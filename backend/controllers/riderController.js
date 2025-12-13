const mongoose = require("mongoose");
const User_infos = require("./../models/userModel");
const Rider = require("./../models/riderModel");

//register rider
exports.registerRider = async (req, res) => {
  try {
    //requird fields
    const requiredFields = [
      "rider_id",
      "rider_name",
      "rider_address",
      "nid_no",
      "emergency_contact",
      "email",
    ];
    const missingFields = [];
    requiredFields.forEach((fields) => {
      if (!req.body[fields]) {
        missingFields.push(fields.replace("rider_", ""));
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing requird fields: ${missingFields.join(", ")}`,
      });
    }
    //check if user exists
    const existUser = await User_infos.findById(req.body.rider_id);
    if (!existUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    //check if rider exists
    const existRider = await Rider.findOne({ rider_id: req.body.rider_id });
    if (existRider) {
      return res.status(400).json({
        status: "error",
        message: "This user is already registered as a rider",
      });
    }

    //prepare riderdata
    const riderData = {
      rider_id: req.body.rider_id,
      rider_name: req.body.rider_name,
      rider_address: req.body.rider_address,
      rider_status: "Pending",
      rider_type: req.body.rider_type || "Bicycle",
      rider_documents: {
        nid_no: req.body.nid_no,
      },
      rider_contact_info: {
        emergency_contact: req.body.emergency_contact,
        alternative_phone: req.body.alternative_phone || "",
        email: req.body.email,
      },
      rider_availability: "Offline",
      rider_settings: {
        max_delivery_distance: req.body.max_delivery_distance || 10,
        distance_unit: req.body.distance_unit || "Km",
      },
    };
    if (req.body.profile_photo) {
      riderData.rider_documents.profile_photo = {
        url: req.body.profile_photo,
      };
    }

    if (
      req.body.rider_settings &&
      req.body.rider_settings.working_hours &&
      req.body.rider_settings.working_hours.start &&
      req.body.rider_settings.working_hours.end
    ) {
      riderData.rider_settings.working_hours = {
        start: req.body.rider_settings.working_hours.start,
        end: req.body.rider_settings.working_hours.end,
      };
    }

    //create new rider
    const newRider = await Rider.create(riderData);
    res.status(201).json({
      status: "success",
      message: "Rider registration submitted successfully",
      data: newRider,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message || "Failed to register as rider",
    });
  }
};
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
    //by type
    if (req.query.type) {
      filter.rider_type = req.query.type;
    }
    // by availability
    if (req.query.availability) {
      filter.rider_availability = req.query.availability;
    }

    //sorting data
    let sort = {};

    //by rating
    if (req.query.sort === "Rating") {
      sort = { "rider_stats.average_rating": -1 }; //for highest rating
    }
    //by distance
    if (req.query.sort === "distance") {
      sort = { "rider_settings.max_delivery_distance": -1 };
    }

    //Step 03: Filter and sort out Data from raw data
    const riders = await Rider.find(filter)
      .populate("rider_id", "user_name user_email user_phone")
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
    const rider = await Rider.findById(req.params.id)
      .populate("rider_id", "user_name user_phone user_email")
      .select("-__v");

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
      "rider_address",
      "rider_type",
      "rider_documents.nid_no",
      "rider_documents.profile_photo.url",
      "rider_contact_info.emergency_contact",
      "rider_contact_info.alternative_phone",
      "rider_contact_info.email",
      "rider_availability",
      "rider_settings.max_delivery_distance",
      "rider_settings.distance_unit",
      "rider_settings.working_hours.start",
      "rider_settings.working_hours.end",
      "rider_rejection_reason",
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
