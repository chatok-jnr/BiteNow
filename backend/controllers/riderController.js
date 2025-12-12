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
//Getall riders
exports.getAllRiders = async (req, res) => {
  try {
    ;
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Invalid request",
    });
  }
};
