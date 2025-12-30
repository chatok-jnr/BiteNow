const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  actor:{
    id:{
      type:mongoose.Types.ObjectId,
      ref:'Admin',
      required:true
    },
    ip_address:{
      type:String,
      required:true
    }
  },
  target:{
    id:{
      type:mongoose.Types.ObjectId
    },
    user_type:{
      type:String,
      enum:['Customer', 'RestaurantOwner', 'Rider', 'Restaurant', 'All'],
    }
  },
  action:{
    type:String, 
    required:true,
    enum:[
      'CUSTOMER_BAN', 'CUSTOMER_DELETE', 'CUSTOMER_UNBAN', 'CUSTOMER_PASS_RESET',
      'OWNER_APPROVE', 'OWNER_REJECT', 'OWNER_BAN', 'OWNER_UNBAN', 'OWNER_DELETE', 'OWNER_PASS_RESET',
      'RIDER_APPROVE', 'RIDER_REJECT', 'RIDER_BAN', 'RIDER_UNBAN', 'RIDER_DELETE', 'RIDER_PASS_RESET',
      'ANNOUNCEMENT'
    ]
  },
  reasson:{
    type:String,
    required:true
  }
}, {
  timestamps: true
});

const Audit_Logs = mongoose.model('Audit_Logs', auditSchema);
module.exports = Audit_Logs;