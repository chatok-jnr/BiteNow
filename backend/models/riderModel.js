const mongoose = require("mongoose");
const User_infos = require("./../models/userModel");
const { verify } = require("jsonwebtoken");

const riderSchema = new mongoose.Schema(
  {
    rider_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User_infos",
    },
    rider_name: {
      type: String,
      required: [true, "A rider must have a name"],
      trim: true,
      maxLength: [100, "Rider name cannot exceed 100 characters"],
    },
    rider_location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      last_update: Date,
    },
    rider_status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Suspended",
        "Active",
        "Inactive",
      ],
      default: "Panding",
    },
    rider_type: {
      type: String,
      enum: ["Bike", "Bicycle", "Walking"],
      default: "Bicycle",
    },
    rider_documents: {
      nid_front: {
        url: String,
        verified: Boolean,
        required: true,
      },
      nid_back: {
        url: String,
        verified: Boolean,
        required: true,
      },
      driving_license: {
        url: String,
        verified: Boolean,
      },
      vehicle_registration: {
        url: String,
        verified: Boolean,
      },
      porfile_photo: {
        url: String,
        verified: Boolean,
      },
    },
    rider_contact_info: {
      enemergency_contact: {
        type: String,
        required: true,
      },
      alternative_phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    rider_availability: {
      enum: ["Available", "Busy", "Offline", "OnBreak"],
      default: "Offline",
    },
    rider_stats: {
      total_deliveries: {
        type: Number,
        default: 0,
      },
      completed_deliveries: {
        type: Number,
        default: 0,
      },
      cancelled_deliveries: {
        type: Number,
        default: 0,
      },
      average_rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      total_rating_count: {
        type: Number,
        default: 0,
      },
      total_earnings: {
        type: Number,
        default: 0,
      },
      online_hours: {
        type: Number,
        default: 0,
      },
    },
    rider_settings: {
      max_delivery_distance: {
        type: Number,
        enum: ["Km", "m"],
        default: 10,
      },
      preferred_working_hours: {
        start: String, // "09:00"
        end: String, // "21:00"
      },
    },

    rider_rejection_reason: String,

    // Timestamps
    rider_approved_at: Date,
    rider_last_active_at: Date,
    rider_created_at: {
      type: Date,
      default: Date.now,
    },
    rider_updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "rider_created_at",
      updatedAt: "rider_updated_at",
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//indexes
riderSchema.index({
  "rider_location.coordinates": "2dsphere",
});
riderSchema.index({
  rider_status: 1,
});
riderSchema.index({
  rider_availability: 1,
});

//virtual function
riderSchema.virtual("Completion_rate").get(function () {
  if (this.rider_stats.total_deliveries === 0) return 0;
  return (
    (this.rider_stats.completed_deliveries /
      this.rider_stats.total_deliveries) *
    100
  );
});
riderSchema.virtual("earning_display").get(function () {
  return `${this.rider_stats.total_earnings.toFixed(2)}`;
});

riderSchema.virtual("status_color").get(function () {
  switch (this.rider_status) {
    case "Pending":
      return "orange";
    case "Approved":
      return "green";
    case "Rejected":
      return "red";
    case "Suspended":
      return "gray";
    case "Active":
      return "blue";
    case "Inactive":
      return "yellow";
    default:
      return "black";
  }
});

//pre-save middlewere
riderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Model
const Rider = mongoose.model("Rider", riderSchema);
module.exports = Rider;
