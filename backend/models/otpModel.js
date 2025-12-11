const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:{
    type:String,
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