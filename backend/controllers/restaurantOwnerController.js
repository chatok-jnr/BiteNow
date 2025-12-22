const mongoose = require("mongoose");
const RestaurantOwner = require("./../models/restaurantOwnerModel");
const {
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
  docUploadHelper,
  docDeleteHelper,
  docsDeleteHelper,
} = require("./../utils/cloudinary");

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

    //remove image from cloudinary
    if (
      restaurantOwner.restaurant_owner_image &&
      restaurantOwner.restaurant_owner_image.public_id
    ) {
      await imageDeleteHelper(restaurantOwner.restaurant_owner_image.public_id);
    }

    //remove all documents from cloudinary
    if (
      restaurantOwner.restaurant_owner_documents &&
      restaurantOwner.restaurant_owner_documents.length > 0
    ) {
      const publicIds = restaurantOwner.restaurant_owner_documents.map(
        (doc) => doc.public_id
      );
      await docsDeleteHelper(publicIds);
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

//for image
//upload restaurant owner profile picture
exports.uploadOwnerImage = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.user._id;

    const restaurantOwner = await RestaurantOwner.findById(ownerId);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }
    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload profile picture for this restaurant owner",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const newImage = imageUploadHelper(
      req.file,
      restaurantOwner.restaurant_owner_name
    );

    //upload new image
    restaurantOwner.restaurant_owner_image = newImage;
    await restaurantOwner.save();

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
//delete restaurant owner profile picture
exports.deleteOwnerImage = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.user._id;
    const restaurantOwner = await RestaurantOwner.findById(ownerId);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }

    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to delete profile picture from this restaurant owner",
      });
    }

    // Check if images array exists
    if (
      !restaurantOwner.restaurant_owner_image ||
      !restaurantOwner.restaurant_owner_image.public_id
    ) {
      return res.status(400).json({
        status: "error",
        message: "No display picture found for this restaurant owner",
      });
    }

    //delete image from cloudinary
    await imageDeleteHelper(restaurantOwner.restaurant_owner_image.public_id);
    //remove from database
    restaurantOwner.restaurant_owner_image = undefined;

    await restaurantOwner.save();

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
//update restaurant owner profile picture
exports.updateOwnerImage = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.user._id;

    const restaurantOwner = await RestaurantOwner.findById(ownerId);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }

    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to update profile picture for this restaurant owner",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    if (
      !restaurantOwner.restaurant_owner_image ||
      !restaurantOwner.restaurant_owner_image.public_id
    ) {
      return res.status(400).json({
        status: "error",
        message: "No existing profile picture to update. Use upload instead.",
      });
    }

    const oldPublicId = restaurantOwner.restaurant_owner_image.public_id;

    //update the image
    const newImage = await imageUpdationHelper(
      req.file,
      restaurantOwner.restaurant_owner_name,
      oldPublicId
    );

    //save image
    restaurantOwner.restaurant_owner_image = newImage;
    await restaurantOwner.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture updated successfully",
      data: {
        image: restaurantOwner.restaurant_owner_image,
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
//upload restaurant owner documents
exports.uploadOwnerDocs = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.user._id;

    const restaurantOwner = await RestaurantOwner.findById(ownerId);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }
    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload documents for this restaurant owner",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an documents",
      });
    }

    const newDocuments = docUploadHelper(
      req.files,
      restaurantOwner.restaurant_owner_name
    );

    //Add new documents
    restaurantOwner.restaurant_owner_documents.push(...newDocuments);
    await restaurantOwner.save();

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
//delete restaurant owner multiple documents
exports.deleteOwnerDocs = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.user._id;
    const restaurantOwner = await RestaurantOwner.findById(ownerId);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }

    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to delete documents from this restaurant owner",
      });
    }

    // Check if documents array exists
    if (
      !restaurantOwner.restaurant_owner_documents ||
      restaurantOwner.restaurant_owner_documents.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "No documents found for this restaurant owner",
      });
    }

    //delete documents from cloudinary
    const publicIds = restaurantOwner.restaurant_owner_documents.map(
      (doc) => doc.public_id
    );
    await docsDeleteHelper(publicIds);
    //remove from database
    restaurantOwner.restaurant_owner_documents = [];

    await restaurantOwner.save();

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
//delete restaurant owner single document
exports.deleteOwnerDoc = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const userId = req.user._id;
    const restaurantOwner = await RestaurantOwner.findById(id);
    if (!restaurantOwner) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant owner not found!",
      });
    }

    if (restaurantOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to delete document from this restaurant owner",
      });
    }
    //find the documents
    const docIndex = restaurantOwner.restaurant_owner_documents.findIndex(
      (doc) => doc._id.toString() === docId.toString()
    );

    if (docIndex === -1) {
      return res.status(400).json({
        status: "error",
        message: "Document not found for this restaurant owner",
      });
    }
    const deleteDoc = restaurantOwner.restaurant_owner_documents[docIndex];

    //delete document from cloudinary
    await docDeleteHelper(deleteDoc.public_id);
    //remove from database
    restaurantOwner.restaurant_owner_documents.splice(docIndex, 1);

    await restaurantOwner.save();

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
