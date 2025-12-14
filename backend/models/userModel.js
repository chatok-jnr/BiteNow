const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
  }, 
  user_email: {
    type: String,
    required: [true, 'A user must have an e-mail'],
    lowercase: true,
    unique: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  user_phone: {
    type: String,
    required: [true, 'A user must have an phone number'],
    unique: true
  },
  user_birth_date: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  user_status: {
    type: String,
    enum: ['Active', 'Suspended', 'Unverified'],
    default: 'Unverified'
  },
  user_role: {
    type: String,
    enum: ['Customer', 'Restaurant', 'Rider', 'Admin'],
    default: 'Customer'
  },
  is_rider:{
    type:Boolean,
    default: false
  },
  is_restaurant_owner:{
    type: Boolean,
    default: false
  },
  user_address: {
    type: String, 
    required: [true, 'A user must have an address']
  },
  user_password: {
    type: String,
    required: true,
    minlength: [6, 'A password length must be 6 or more'], 
    select: false
  },
  is_verified:{
    type:Boolean,
    default: false
  },
  passwordChangedAt: Date,
  // passwordResetToken: String,
  // passwordResetExpires: Date 
}, {
  timestamps: true
});

// Hashing the password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password was modified
  if (!this.isModified('user_password')) return next();

  try {

    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.user_password = await bcrypt.hash(this.user_password, salt);
    next();
  } catch(error) {
    next(error);
  }
});

// Save the time of the last change of a password
userSchema.pre('save', function(next) {
  // Only update timestamp if password was modified and user is not new
  if (!this.isModified('user_password') || this.isNew) return next();
  
  // Set timestamp (1 second in past to ensure tokens issued before still work)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.user_password);
  } catch(error) {
    throw error;
  }
}

//Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamps) {
  if (this.passwordChangedAt) {
    const changeTimestamps = parseInt(
      this.passwordChangedAt.getTime() / 1000, 
      10
    );
    // Return true if token was issued before password change
    return JWTTimestamps < changeTimestamps;
  }
  return false;
}

/*
The password reset generator
we will build it in future, because for this we need an 
email system where the reset token will be sent to user using email
*/

const User_infos = mongoose.model('User_infos', userSchema);
module.exports = User_infos;