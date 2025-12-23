const mongoose = require("mongoose");
const Food = require("./../models/foodModel");
const Restaurant = require("./../models/restaurantModel");
const {
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
} = require("./../utils/cloudinary");

// All Food
exports.getAllFood = async (req, res) => {
  try {
    // Build Query
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    //Advancing Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Food.find(JSON.parse(queryStr));

    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else query = query.sort("-createdAt");

    //Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else query = query.select("-__v");

    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numFoods = await Food.countDocuments();
      if (skip >= numFoods) {
        return res.status(404).json({
          status: "failed",
          message: "The page you request doesn't exist",
        });
      }
    }

    query = query.skip(skip).limit(limit);

    //execute query
    const foods = await query;

    res.status(200).json({
      status: "success",
      data: {
        foods,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Single Food
exports.getFood = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid ID",
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: "failed",
        message: "No Food found with that id",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        food,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Add New Food
exports.createFood = async (req, res) => {
  try {
    console.log(`Debug = ${req.user._id}`);

    console.log(`Debug = ${req.user._id}`);

    const restaurantInfo = await Restaurant.findById(req.body.restaurant_id);
    const authorized = restaurantInfo.owner_id.equals(req.user._id);

    if (!authorized) {
      return res.status(403).json({
        message: "You are not the owner of this restaurant",
      });
    }

    const newFood = await Food.create({
      restaurant_id: req.body.restaurant_id,
      food_name: req.body.food_name,
      food_description: req.body.food_description,
      food_price: req.body.food_price,
      food_quantity: req.body.food_quantity || 0,
      discount_percentage: req.body.discount_percentage || 0,
      tags: req.body.tags || [],
    });

    return res.status(201).json({
      status: "success",
      message: "You food is added",
      data: {
        newFood,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Update Food
exports.updateFood = async (req, res) => {
  try {
    const targetFood = await Food.findById(req.params.id);

    const authorized = await targetFood.amIAuthorized(req.user._id);

    if (!authorized) {
      return res.status(400).json({
        status: "failed",
        message: "You are not Authorized to update this food",
      });
    }

    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({
        status: "failed",
        message: `Food is not found with that id ${req.params.id}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        food,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Delete Food
exports.deleteFood = async (req, res) => {
  try {
    const targetFood = await Food.findById(req.params.id);
    const authorized = await targetFood.amIAuthorized(req.user._id);

    if (!authorized) {
      return res.status(403).json({
        message: "This is not your product delete",
      });
    }

    const dltFood = await Food.findByIdAndDelete(req.params.id);

    if (!dltFood) {
      return res.status(404).json({
        status: "failed",
        message: `No found food with that id ${req.params.id}`,
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Restock Food
exports.restockFood = async (req, res) => {
  try {
    const quantity = req.body.quantity;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        status: "failed",
        message: "Quantity must be greated than 0",
      });
    }

    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        status: "failed",
        message: `Not found food with that id: ${req.params.id}`,
      });
    }

    const authorized = await food.amIAuthorized(req.user._id);

    if (!authorized) {
      return res.status(403).json({
        message: "This is not your product restock",
      });
    }

    const newQuantity = food.restock(quantity);
    await food.save();

    res.status(200).json({
      status: "success",
      message: "Restocked food successfully",
      data: {
        newstock: food.food_quantity,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//GEt food by restaurant
exports.getFoodByRestaurant = async (req, res) => {
  try {
    const foods = await Food.findAvailableByRestaurant(req.params.restaurantId);

    res.status(200).json({
      status: "success",
      data: {
        foods,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

// Get food by price range
exports.getFoodByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    console.log(minPrice);

    if (maxPrice < minPrice) [maxPrice, minPrice] = [minPrice, maxPrice];

    if (!minPrice || !maxPrice) {
      return res.status(400).json({
        status: "failed",
        message: "You have to give the min and max price",
      });
    }

    const food = await Food.findByPriceRange(
      parseFloat(minPrice),
      parseFloat(maxPrice)
    );

    if (!food) {
      return res.status(404).json({
        status: "failed",
        message: `There is no food available in this range ${minPrice} -> ${maxPrice}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        food,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Get discounted food
exports.getDiscountedFood = async (req, res) => {
  try {
    const food = await Food.discountedFood();

    if (!food) {
      return res.status(404).json({
        status: "failed",
        message: "Currently there is no food available with discount",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        food,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//image
//add display picture
exports.uploadFoodImage = async (req, res) => {
  try {
    const foodId = req.params.id;
    const userId = req.user._id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        status: "error",
        message: "Food not found!",
      });
    }
    const authorized = await food.amIAuthorized(userId);
    if (!authorized) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload display picture for this food",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const newImage = imageUploadHelper(req.file, food.food_name);

    //upload new image
    food.food_image = newImage;
    await food.save();

    res.status(200).json({
      status: "success",
      message: "Display picture uploaded successfully",
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
      message: "Failed to upload display picture",
      error: err.message,
    });
  }
};
//delete food diplay picture
exports.deleteFoodImage = async (req, res) => {
  try {
    const foodId = req.params.id;
    const userId = req.user._id;
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        status: "error",
        message: "Food not found!",
      });
    }

    const authorized = await food.amIAuthorized(userId);
    if (!authorized) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload display picture for this food",
      });
    }

    // Check if images array exists
    if (!food.food_image || !food.food_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No display picture found for this food",
      });
    }

    //delete image from cloudinary
    await imageDeleteHelper(food.food_image.public_id);
    //remove from database
    food.food_image = undefined;

    await food.save();

    res.status(200).json({
      status: "success",
      message: "Display picture deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete display picture",
      error: err.message,
    });
  }
};
//update food display picture
exports.updateFoodImage = async (req, res) => {
  try {
    const foodId = req.params.id;
    const userId = req.user._id;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        status: "error",
        message: "Food not found!",
      });
    }

    const authorized = await food.amIAuthorized(userId);
    if (!authorized) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload display picture for this food",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    if (!food.food_image || !food.food_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No existing display picture to update. Use upload instead.",
      });
    }

    const oldPublicId = food.food_image.public_id;

    //update the image
    const newImage = await imageUpdationHelper(
      req.file,
      food.food_name,
      oldPublicId
    );

    //save image
    food.food_image = newImage;
    await food.save();

    res.status(200).json({
      status: "success",
      message: "Display picture updated successfully",
      data: {
        image: food.food_image,
      },
    });
  } catch (err) {
    if (req.file) {
      await imageDeleteHelper(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to update display picture",
      error: err.message,
    });
  }
};
