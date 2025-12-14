const mongoose = require("mongoose");
const User_infos = require("./../models/userModel");

const restaurantSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User_infos", // Use string reference instead of model variable
    },
    restaurant_name: {
      type: String,
      required: [true, "A restaurant must have a name"],
      trim: true,
      maxLength: [100, "Restaurant name cannot exceed 100 characters"],
    },

    restaurant_location: {
      type: String,
      required: [true, "A restaurant must have a location"],
      trim: true,
    },

    restaurant_address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // For geospatial queries
      },
    },

    restaurant_status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Suspended"],
      default: "Pending",
    },

    restaurant_commissionRate: {
      type: Number,
      default: 0.25,
      min: 0,
      max: 1,
      set: (v) => Math.round(v * 100) / 100, // Round to 2 decimal places
    },

    restaurant_total_revenue: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => Math.round(v * 100) / 100,
    },

    restaurant_total_sales: {
      type: Number,
      default: 0,
      min: 0,
    },

    restaurant_description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },

    restaurant_contact_info: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      website: String,
    },

    restaurant_category: [
      {
        type: String,
        trim: true,
      },
    ], // e.g., ["Italian", "Pizza", "Fine Dining"]

    restaurant_opening_hours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },

    restaurant_rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (v) => Math.round(v * 10) / 10, // Round to 1 decimal
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    restaurant_images: [
      {
        url: String,
        altText: String,
        isPrimary: Boolean,
      },
    ],

    restaurant_created_at: {
      type: Date,
      default: Date.now,
    },

    restaurant_updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "restaurant_created_at",
      updatedAt: "restaurant_updated_at",
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Add indexes for sorting
restaurantSchema.index({
  "restaurant_address.city": 1,
  "restaurant_rating.average": -1,
});
restaurantSchema.index({ restaurant_category: 1 });
restaurantSchema.index({ restaurant_created_at: -1 });

// Virtual function for better user experience
//formatted commission percentage
restaurantSchema.virtual("commissionPercentage").get(function () {
  return `${(this.restaurant_commissionRate * 100).toFixed(2)}%`;
});
//for rating showing
restaurantSchema.virtual("ratingDisplay").get(function () {
  return `${
    this.restaurant_rating?.average || 0
  }/5 (${this.restaurant_rating?.count || 0} reviews)`;
});
//for status color
restaurantSchema.virtual("statusColor").get(function () {
  switch (this.restaurant_status) {
    case "Accepted":
      return "green";
    case "Pending":
      return "orange";
    case "Rejected":
      return "red";
    case "Suspended":
      return "gray";
    default:
      return "black";
  }
});
//for address
restaurantSchema.virtual("fullAddress").get(function () {
  const addr = this.restaurant_address;

  if (!addr) return "No address!";

  return `${addr.city || ""}, ${addr.street || ""}, ${addr.state || ""}, ${
    addr.zipCode || ""
  }`.trim();
});

// Pre-save middleware to update timestamps
restaurantSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;

/*
{
  "owner_id": "6939c2dfd0c1a267ba3bf248",
  "restaurant_name": "TazaBazar Restora",
  "restaurant_location": "Dhaka"
}
*/
