const mongoose = require("mongoose");
const Restaurant = require("./../models/restaurantModel");

const foodSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Restaurant",
    },
    food_image: {
      url: {
        type: String,
        default: null,
      },
      altText: {
        type: String,
        default: "Rider image",
      },
      public_id: {
        type: String,
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    food_name: {
      type: String,
      required: [true, "A food must have a name"],
      trim: true,
      minlength: [2, "Food name must be at least 2 characters"],
      maxlength: [100, "Food name cannot exceed 100 characters"],
    },
    food_description: {
      type: String,
      required: [true, "A food must have a description"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    food_price: {
      type: Number,
      required: [true, "A food must have a price"],
      min: [50, "Price must be at least 50"],
      max: [10000, "Price cannot exceed 10,000"],
    },
    food_quantity: {
      type: Number,
      required: [true, "Food must have a quantity"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    discount_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tags: {
      type: [String],
      trim: true,
    },
    average_rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual
foodSchema.virtual("discounted_price").get(function () {
  return this.food_price - (this.food_price * this.discount_percentage) / 100;
});

foodSchema.virtual("in_stock").get(function () {
  return this.food_quantity > 0;
});

// Check if food can be ordered
foodSchema.methods.canBeOrdered = function (quantity) {
  return this.is_available && this.food_quantity >= quantity;
};

// Stock++
foodSchema.methods.restock = function (quantity) {
  this.food_quantity += quantity;
  if (this.food_quantity > 0) this.is_available = true;
  return this.food_quantity;
};

// checking if this is the owner
foodSchema.methods.amIAuthorized = async function (ownerId) {
  const restaurant = await Restaurant.findById(this.restaurant_id);

  return restaurant.owner_id.equals(ownerId);
};

// Update Quantitiy after order
foodSchema.methods.updateQuantity = function (quantity) {
  if (this.food_quantity >= quantity) {
    this.food_quantity -= quantity;

    if (this.food_quantity === 0) {
      this.is_available = false;
    }
    return true;
  }
  return false;
};

//Find available food by restaurant
foodSchema.statics.findAvailableByRestaurant = function (restaurantId) {
  return this.find({
    restaurant_id: restaurantId,
    is_available: true,
    food_quantity: { $gt: 0 },
  });
};

//Food by price range
foodSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    food_price: { $gte: minPrice, $lte: maxPrice },
    is_available: true,
  });
};

//Discounted Food
foodSchema.statics.discountedFood = function () {
  return this.find({
    discount_percentage: { $gt: 0 },
    is_available: true,
  });
};

const Food = mongoose.model("Food", foodSchema);
module.exports = Food;
