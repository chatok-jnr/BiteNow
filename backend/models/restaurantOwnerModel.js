const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const restaurantOwnerSchema = new mongoose.Schema(
  {
    restaurant_owner_name: {
      type: String,
      required: [true, "A restaurant owner must have a name"],
      trim: true,
      maxLength: [100, "Restaurant owner name cannot exceed 100 characters"],
    },
    restaurant_owner_phone: {
      type: String,
      trim: true,
      required: true,
    },
    restaurant_owner_email: {
      type: String,
      required: [true, "A restaurant owner must have an e-mail"],
      lowercase: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/.test(email);
        },
        message: "Please enter a valid email",
      },
    },
    restaurant_owner_password: {
      type: String,
      required: true,
      minlength: [6, "A password length must be 6 or more"],
      select: false,
    },
  //  passwordChangeAt: Date(),
    restaurant_owner_gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    restaurant_owner_status: {
      type: String,
      enum: ["Pending", "Active", "Suspended"],
      default:"Pending"
    },
    restaurant_owner_is_verified:{
      type:Boolean,
      default:false
    },
    restaurant_owner_dob: {
      type: Date,
      required: true,
    },
    role:{
      type:String,
      enum:['restaurant_owner'],
      default:'restaurant_owner'
    },
    restaurant_owner_address: {
      type: String,
      required: [true, "A Restaurant owner must have a address"],
      trim: true,
      maxLength: [50, "Restaurant owner address cannot exceed 50 characters"],
    },
    restaurant_owner_last_active_at: Date,
  },
  {
    timestamps: {
      createdAt: "restaurant_owner_created_at",
      updatedAt: "restaurant_owner_updated_at",
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
restaurantOwnerSchema.pre("save", async function (next) {
  if (!this.isModified("restaurant_owner_password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    //hash the password
    this.restaurant_owner_password = await bcrypt.hash(this.restaurant_owner_password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
//save the time of the last change password
restaurantOwnerSchema.pre("save", function (next) {
  // Only update timestamp if password was modified and user is not new
  if (!this.isModified("restaurant_owner_password") || this.isNew)
    return next();

  // Set timestamp (1 second in past to ensure tokens issued before still work)
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

// Password comparison method
restaurantOwnerSchema.methods.comparePassword = async function (
  candidatePassword
) {
  try {
    return await bcrypt.compare(
      candidatePassword,
      this.restaurant_owner_password
    );
  } catch (error) {
    throw error;
  }
};
//Check if password was changed after token was issued
restaurantOwnerSchema.methods.changedPasswordAfter = function (JWTTimestamps) {
  if (this.passwordChangeAt) {
    const changeTimestamps = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    // Return true if token was issued before password change
    return JWTTimestamps < changeTimestamps;
  }
  return false;
};

//virtuals

restaurantOwnerSchema.virtual("status_color").get(function () {
  switch (this.restaurant_owner_status) {
    case "Active":
      return "green";
    case "Suspended":
      return "red";
    case "Pending":
      return "gray";
    default:
      return "black";
  }
});

const RestaurantOwner = mongoose.model("RestaurantOwner", restaurantOwnerSchema);
module.exports = RestaurantOwner;