const mongoose = require("mongoose");
const Rider = require("./../models/riderModel");
const {
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
  docUploadHelper,
  docDeleteHelper,
  docsDeleteHelper,
} = require("./../utils/cloudinary");

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

    //Step 03: Filter and sort out Data from raw data
    const riders = await Rider.find(filter)
      .sort({ "rider_stats.average_rating": -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -rider_password");

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
    const rider = await Rider.findById(req.params.id).select("-rider_password");

    //check
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found",
      });
    }

    //step 02 => Check data validity. Who can see the data?
    if (rider.rider_status !== "Approved" && req.user.role !== "admin") {
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

    if (rider._id.toString() !== userID.toString()) {
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
      return res.status(400).json({
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
      rider._id.toString() !== userID.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete this rider",
      });
    }

    //delete image from cloudinary
    if (rider.rider_image && rider.rider_image.public_id) {
      await imageDeleteHelper(rider.rider_image.public_id);
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

//upload rider profile picture
exports.uploadRiderImage = async (req, res) => {
  try {
    const riderId = req.params.id;
    const userId = req.user._id;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }
    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload profile picture for this rider",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const newImage = imageUploadHelper(req.file, rider.rider_name);

    //Add new images to existing images
    rider.rider_image = newImage;
    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture uploaded successfully",
      data: {
        images: newImage,
      },
    });
  } catch (err) {
    if (req.file) {
      await imageDeleteHelper(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to upload profile picture",
      error: err.message,
    });
  }
};
//delete rider profile picture
exports.deleteRiderImage = async (req, res) => {
  try {
    const riderId = req.params.id;
    const userId = req.user._id;
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }

    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to delete profile picture from this rider",
      });
    }

    // Check if images array exists
    if (!rider.rider_image || !rider.rider_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No display picture found for this rider",
      });
    }

    //delete image from cloudinary
    await imageDeleteHelper(rider.rider_image.public_id);
    //remove from database
    rider.rider_image = undefined;

    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete profile picture",
      error: err.message,
    });
  }
};
//update rider profile picture
exports.updateRiderImage = async (req, res) => {
  try {
    const riderId = req.params.id;
    const userId = req.user._id;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }

    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to update profile picture for this rider",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    if (!rider.rider_image || !rider.rider_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No existing profile picture to update. Use upload instead.",
      });
    }

    const oldPublicId = rider.rider_image.public_id;

    //update the image
    const newImage = await imageUpdationHelper(
      req.file,
      rider.rider_name,
      oldPublicId
    );

    //save image
    rider.rider_image = newImage;
    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture updated successfully",
      data: {
        image: rider.rider_image,
      },
    });
  } catch (err) {
    if (req.file) {
      await imageDeleteHelper(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to update profile picture",
      error: err.message,
    });
  }
};

//for documents
//upload rider documents
exports.uploadRiderDocs = async (req, res) => {
  try {
    const riderId = req.params.id;
    const userId = req.user._id;

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }
    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to upload documents for this rider",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an documents",
      });
    }

    const newDocuments = docUploadHelper(req.files, rider.rider_name);

    //Add new images to existing images
    rider.rider_documents.push(...newDocuments);
    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Documents uploaded successfully",
      data: {
        documents: newDocuments,
      },
    });
  } catch (err) {
    if (req.files) {
      await docsDeleteHelper(req.files.map((file) => file.filename));
    }
    res.status(500).json({
      status: "error",
      message: "Failed to upload documents",
      error: err.message,
    });
  }
};
//delete rider multiple documents
exports.deleteRiderDocs = async (req, res) => {
  try {
    const riderId = req.params.id;
    const userId = req.user._id;
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }

    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete documents from this rider",
      });
    }

    // Check if documents array exists
    if (!rider.rider_documents || rider.rider_documents.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No documents found for this rider",
      });
    }

    //delete documents from cloudinary
    const publicIds = rider.rider_documents.map((doc) => doc.public_id);
    await docsDeleteHelper(publicIds);
    //remove from database
    rider.rider_documents = [];

    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Documents deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete documents",
      error: err.message,
    });
  }
};
//delete rider single document
exports.deleteRiderDoc = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const userId = req.user._id;
    const rider = await Rider.findById(id);
    if (!rider) {
      return res.status(404).json({
        status: "error",
        message: "Rider not found!",
      });
    }

    if (rider._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete document from this rider",
      });
    }
    //find the documents
    const docIndex = rider.rider_documents.findIndex(
      (doc) => doc._id.toString() === docId.toString()
    );

    if (docIndex === -1) {
      return res.status(400).json({
        status: "error",
        message: "Document not found for this rider",
      });
    }
    const deleteDoc = rider.rider_documents[docIndex];

    //delete document from cloudinary
    await docDeleteHelper(deleteDoc.public_id);
    //remove from database
    rider.rider_documents.splice(docIndex, 1);

    await rider.save();

    res.status(200).json({
      status: "success",
      message: "Document deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete document",
      error: err.message,
    });
  }
};
