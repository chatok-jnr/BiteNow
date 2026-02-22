const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: [true, "A customer must have a name"],
      trim: true,
    },
    customer_email: {
      type: String,
      required: [true, "A customer must have an e-mail"],
      lowercase: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/.test(email);
        },
        message: "Please enter a valid email",
      },
    },
    customer_phone: {
      type: String,
      required: function () {
        return !this.isGoogleAuth; // Not required for Google auth users
      },
      //unique: true,
      sparse: true, // Allow multiple null values
    },
    customer_birth_date: {
      type: Date,
      required: function () {
        return !this.isGoogleAuth;
      },
    },
    customer_gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: function () {
        return !this.isGoogleAuth;
      },
    },
    customer_status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
    customer_address: {
      type: String,
      required: function () {
        return !this.isGoogleAuth;
      },
    },
    customer_password: {
      type: String,
      required: function () {
        return !this.isGoogleAuth;
      },
      minlength: [6, "A password length must be 6 or more"],
      select: false,
    },
    isGoogleAuth: {
      type: Boolean,
      default: false,
    },
    customer_photo: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },
    customer_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },
    customer_image: {
      url: {
        type: String,
        default: null,
      },
      altText: {
        type: String,
        default: "Customer image",
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
    customer_is_verified: {
      type: Boolean,
      default: true,
    },
    saved_addresses: [
      {
        label: {
          type: String,
          required: [true, "Address label is required"],
          trim: true,
        },
        address: {
          type: String,
          required: [true, "Address is required"],
          trim: true,
        },
        latitude: {
          type: Number,
          required: [true, "Latitude is required"],
        },
        longitude: {
          type: Number,
          required: [true, "Longitude is required"],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    passwordChangedAt: Date,
    // passwordResetToken: String,
    // passwordResetExpires: Date
  },
  {
    timestamps: true,
  },
);

// Hashing the password before saving
customerSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("customer_password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.customer_password = await bcrypt.hash(this.customer_password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Save the time of the last change of a password
customerSchema.pre("save", function (next) {
  // Only update timestamp if password was modified and customer is not new
  if (!this.isModified("customer_password") || this.isNew) return next();

  // Set timestamp (1 second in past to ensure tokens issued before still work)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Password comparison method
customerSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.customer_password);
  } catch (error) {
    throw error;
  }
};

//Check if password was changed after token was issued
customerSchema.methods.changedPasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changeTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // Return true if token was issued before password change
    return JWTTimestamps < changeTimestamps;
  }
  return false;
};

/*
The password reset generator
we will build it in future, because for this we need an 
email system where the reset token will be sent to customer using email
*/

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
