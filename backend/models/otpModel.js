const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
    required: true
  },
  user_type:{
    type:String,
    enum:['rider', 'customer', 'restaurant_owner'],
    required: true
  },
  otp: {
    type: String,
    required: true
  }, 
  expiresAt: {
    type:Date,
    required: true
  }
}, {
  timestamps:true
})

const Otp_infos = mongoose.model('Otp_infos', otpSchema);

module.exports = Otp_infos;