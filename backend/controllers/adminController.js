const Customer = require('./../models/customerModel');
const Rider = require('./../models/riderModel');
const RestaurantOwner = require('./../models/restaurantOwnerModel');
const Restaurant = require('./../models/restaurantModel');
const AuditLogs = require('./../models/auditLogs');
const Order = require('./../models/orderModel');

//GET all audit logs
exports.getAllAuditLogs = async(req, res) => {
  try{
    const logs = await AuditLogs.find();
    if(!logs) {
      return res.status(404).json({
        status:'failed',
        message:'No audit logs found'
      });
    }

    res.status(200).json({
      status:'success',
      data: logs
    });
  } catch(err) {
    res.status(400).json({
      status:'success',
      message:err.message
    });
  }
}

//Get All Pending no
exports.getCount = async (req, res) => {
  try{
    const order = await Order.countDocuments({'order_status':'pending'});
    const owner = await RestaurantOwner.countDocuments({'restaurant_owner_status':'Pending'});
    const rider = await Rider.countDocuments({'rider_status':'Pending'});
    const customer = await Customer.countDocuments();
    const res_owner = await RestaurantOwner.countDocuments(); 
    const riders = await Rider.countDocuments(); 
    const restaurant = await Restaurant.countDocuments();

    res.status(200).json({
      status:'success',
      pending_order:order,
      pending_owner:owner,
      pending_rider:rider,
      no_of_customer: customer,
      no_of_restaurant_owner: res_owner,
      no_of_riders: riders,
      no_of_restaurant: restaurant
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}



//Approve or Reject Restaurant Owner
exports.approveOrRejectOwner = async (req, res) => {
  try{
    const {owner_status, reasson} = req.body;
    const admin_id = req.user._id;
    const admin_ip = req.ip;

    if(!owner_status || !admin_id || !admin_ip || !reasson) {
      return res.status(403).json({
        status:'failed',
        message:'admin id, ip, owner status or reasson is missing'
      });
    }

    const owner = await RestaurantOwner.findById(req.params.id);

    if(!owner) {
      return res.status(404).json({
        status:"success",
        message:`User with ${req.params.id} this id is not found`
      });
    }

    if(owner.restaurant_owner_status === owner_status || 
      owner.restaurant_owner_status === 'Suspended' ||
      owner.restaurant_owner_address === 'Rejected'
    ) {
      return res.status(409).json({
        stats:'conflict',
        message:`User Current status is ${owner.restaurant_owner_status}`
      });
    }

    const updOwner = await RestaurantOwner.findByIdAndUpdate(req.params.id, {
      restaurant_owner_status:owner_status
    }, {
      runValidators:true
    });

    const auditLogs = await AuditLogs.create({
      actor:{
        id:admin_id,
        ip_address:admin_ip
      }, 
      target:{
        id:req.params.id,
        user_type:'RestaurantOwner'
      },
      action:(owner_status == 'Approved'?'OWNER_APPROVE':"OWNER_REJECT"),
      reasson:reasson
    });

    res.status(200).json({
      status:'success',
      message:`Owner status set to ${owner_status} successfully`
    });

  } catch(err) {
    res.status(400).json({
      status:'success',
      message:err.message
    });
  }
}
