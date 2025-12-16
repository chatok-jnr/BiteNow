const mongoose = require("mongoose");
const RestaurantOwner = require("./../models/restaurantOwnerModel");
const Restaurant = require("./../models/restaurantModel");
const { cloudinary } = require("./../utils/cloudinary");

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
      .populate(
        "owner_id",
        "restaurant_owner_name restaurant_owner_phone restaurant_owner_email"
      )
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
      .populate(
        "owner_id",
        "restaurant_owner_name restaurant_owner_email restaurant_owner_phone"
      )
      .select("-__v");

    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found!",
      });
    }

    if (
      // replace
      restaurant.restaurant_status !== "Accepted"
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
      .populate("owner_id", "restaurant_owner_name")
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
//restricted
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
    const owner = await RestaurantOwner.findById(owner_id);
    if (!owner) {
      return res.status(404).json({
        status: "fail",
        message: "Owner not found",
      });
    }

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
      message: err.message,
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
    const ownerID = req.user._id;

    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found!",
      });
    }

    //check for authorized user
    if (restaurant.owner_id.toString() !== ownerID.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this restaurant",
      });
    } //

    //allowed field for update
    const allowedUpdates = [
      "restaurant_name",
      "restaurant_location",
      "restaurant_address",
      "restaurant_description",
      "restaurant_contact_info",
      "restaurant_category",
      "restaurant_opening_hours",
      "restaurant_image",
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
    const ownerID = req.user._id;

    const restaurant = await Restaurant.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json({
        status: "fail",
        message: "Restaurant not found",
      });
    }

    //chech user is authorized or not
    if (restaurant.owner_id.toString() !== ownerID.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this restaurant",
      });
    }

    //delete all images from the cloudinary
    if (restaurant.restaurant_image && restaurant.restaurant_image.length > 0) {
      for (const image of restaurant.restaurant_image) {
        if (image.public_id) {
          cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    //Delete restaurant
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
//for image
//upload image
exports.uploadRestaurantImage = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const ownerID = req.user._id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant not found!",
      });
    }

    if (restaurant.owner_id.toString() !== ownerID.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to upload images for this restaurant",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const newImage = {
      url: req.file.path, //cloudinary url
      altText: `${restaurant.restaurant_name} - Image ${
        restaurant.restaurant_image.length + 1
      }`,
      public_id: req.file.filename, //cloudinary public id for deletion
    };

    //Add new images to existing images
    restaurant.restaurant_image.push(newImage);
    await restaurant.save();

    res.status(200).json({
      status: "success",
      message: "Image uploaded successfully",
      data: {
        images: newImage,
      },
    });
  } catch (err) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to upload image",
      error: err.message,
    });
  }
};
//Delete restaurent image
exports.deleteRestaurantImage = async (req, res) => {
  try {
    const { id, imgId } = req.params;
    const ownerID = req.user._id;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant not found!",
      });
    }

    if (restaurant.owner_id.toString() !== ownerID.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete images from this restaurant",
      });
    }

    // Check if images array exists
    if (
      !restaurant.restaurant_image ||
      !Array.isArray(restaurant.restaurant_image)
    ) {
      return res.status(400).json({
        status: "error",
        message: "No images found for this restaurant",
      });
    }

    const imageIndex = restaurant.restaurant_image.findIndex(
      (img) => img._id.toString() === imgId.toString()
    );
    if (imageIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Image not found",
      });
    }
    const imageToDelete = restaurant.restaurant_image[imageIndex];

    //delete from cloudinary
    if (imageToDelete.public_id) {
      await cloudinary.uploader.destroy(imageToDelete.public_id);
    }
    //remove from database
    restaurant.restaurant_image.splice(imageIndex, 1);
    //if deleted image was primary, set first image as primary
    if (imageToDelete.isPrimary && restaurant.restaurant_image.length > 0) {
      restaurant.restaurant_image[0].isPrimary = true;
    }

    await restaurant.save();

    res.status(200).json({
      status: "success",
      message: "Image deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete image",
      error: err.message,
    });
  }
};
//Update image
exports.updateRestaurantImage = async (req, res) => {
  try {
    const { id, imgId } = req.params;
    const ownerID = req.user._id;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        status: "error",
        message: "Restaurant not found!",
      });
    }

    if (restaurant.owner_id.toString() !== ownerID.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to update images for this restaurant",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const imageIndex = restaurant.restaurant_image.findIndex(
      (img) => img._id.toString() === imgId.toString()
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "Image not found",
      });
    }

    const oldImage = restaurant.restaurant_image[imageIndex];
    //delete old image from cloudinary
    if (oldImage.public_id) {
      cloudinary.uploader.destroy(oldImage.public_id);
    }
    //delete from database
    restaurant.restaurant_image.splice(imageIndex, 1);

    //update the new image
    restaurant.restaurant_image[imageIndex] = {
      utl: req.file.path,
      altText: `${restaurant.restaurant_name} - Image ${imageIndex + 1}`,
      public_id: req.file.filename,
    };

    await restaurant.save();

    res.status(200).json({
      status: "success",
      message: "Image updated successfully",
      data: {
        image: restaurant.restaurant_image[imageIndex],
      },
    });
  } catch (err) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to update image",
      error: err.message,
    });
  }
};
