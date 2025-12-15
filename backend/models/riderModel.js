const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const riderSchema = new mongoose.Schema(
  {
    rider_name: {
      type: String,
      required: [true, "A rider must have a name"],
      trim: true,
      maxLength: [100, "Rider name cannot exceed 100 characters"],
    },
    rider_email: {
      type: String,
      required: [true, "A rider must have an e-mail"],
      lowercase: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/.test(email);
        },
        message: "Please enter a valid email",
      },
    },
    rider_password: {
      type: String,
      required: true,
      minlength: [6, "A password length must be 6 or more"],
      select: false,
    },
    rider_is_verified: {
      type: Boolean,
      default: false,
    },
    rider_pass_change_at: Date,
    rider_date_of_birth: {
      type: Date,
      required: true,
    },
    rider_gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    rider_address: {
      type: String,
      required: [true, "A rider must have a address"],
      trim: true,
      maxLength: [50, "Rider address cannot exceed 50 characters"],
    },
    rider_status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Suspended"],
      default: "Pending",
    },
    rider_documents: {
      nid_no: {
        type: String,
        required: [true, "The rider must have national validation"],
      },
      profile_photo: {
        url: String,
      },
    },
    rider_contact_info: {
      emergency_contact: {
        type: String,
        required: true,
      },
      alternative_phone: {
        type: String,
        default: "",
      },
    },
    rider_stats: {
      total_deliveries: {
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
    },
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

//Hash the password befor save
riderSchema.pre("save", async function (next) {
  if (!this.isModified("rider_password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    //hash the password
    this.rider_password = await bcrypt.hash(this.rider_password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
//save the time of the last change password
riderSchema.pre("save", function (next) {
  // Only update timestamp if password was modified and user is not new
  if (!this.isModified("rider_password") || this.isNew) return next();

  // Set timestamp (1 second in past to ensure tokens issued before still work)
  this.rider_pass_change_at = Date.now() - 1000;
  next();
});

// Password comparison method
riderSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.rider_password);
  } catch(error) {
    throw error;
  }
}
//Check if password was changed after token was issued
riderSchema.methods.changedPasswordAfter = function(JWTTimestamps) {
  if (this.rider_pass_change_at) {
    const changeTimestamps = parseInt(
      this.rider_pass_change_at.getTime() / 1000, 
      10
    );
    // Return true if token was issued before password change
    return JWTTimestamps < changeTimestamps;
  }
  return false;
}

//indexes
riderSchema.index({
  rider_status: 1,
});

//virtual function
riderSchema.virtual("Completion_rate").get(function () {
  if (this.rider_stats.total_deliveries === 0) return 0;
  return (
    (this.rider_stats.total_deliveries /
      (this.rider_stats.total_deliveries +
        this.rider_stats.cancelled_deliveries)) *
    100
  );
});
riderSchema.virtual("earning_display").get(function () {
  return `${this.rider_stats.total_deliveries.toFixed(2) * 50}`;
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
    default:
      return "black";
  }
});

// Model
const Rider = mongoose.model("Rider", riderSchema);
module.exports = Rider;
