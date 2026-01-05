const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  announcement:{
    title:{
      type:String,
      required:true
    },
    message:{
      type:String,
      required:true
    }
  },
  admin_id:{
    type:mongoose.Types.ObjectId,
    ref:'Admin'
  },
  target:{
    user_type:{
      type:String,
      enum:['ALL', 'ALL_CUSTOMER', 'ALL_RESTAURANT_OWNER', 'ALL_RIDER', 'CUSTOMER', 'OWNER', 'RIDER'],
      required:true
    },
    user_id:{
      type: mongoose.Types.ObjectId,
    }
  }
}, {
  timestamps:true
});

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;