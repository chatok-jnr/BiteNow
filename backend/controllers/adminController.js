const Customer = require('./../models/customerModel');
const Rider = require('./../models/riderModel');
const RestaurantOwner = require('./../models/restaurantOwnerModel');
const Restaurant = require('./../models/restaurantModel');
const AuditLogs = require('./../models/auditLogs');
const Order = require('./../models/orderModel');
const Admin = require('./../models/adminModel');
const Food = require('./../models/foodModel');
const Announcement = require('./../models/announcementModel');

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
    const admin = await Admin.countDocuments();

    const last4audit = await AuditLogs.find()
      .populate({
        path:'actor.id',
        select:'admin_name'
      })
      .sort('-createdAt')
      .limit(4);

    res.status(200).json({
      status:'success',
      pending_order:order,
      pending_owner:owner,
      pending_rider:rider,
      no_of_customer: customer,
      no_of_restaurant_owner: res_owner,
      no_of_riders: riders,
      no_of_restaurant: restaurant,
      no_of_admin: admin,
      last4audit
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//-------------------------------------------------------
//Get all customer
exports.getAllCustomer = async(req, res) => {
  try{  
    const customer = await Customer.find();
    if(!customer) {
      return res.status(404).json({
        status:'failed',
        message:'Customer not found'
      });
    }

    res.status(200).json({
      status:'success',
      customer
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Ban | Unban customer
exports.banOrUnabnCustomer = async (req, res) => {
  try{

    const {reasson, customer_status} = req.body;

    if(!reasson || !customer_status) {
      return res.status(400).json({
        status:'failed',
        message:'reasson | customer_status is required'
      });
    }

    const customer = await Customer.findById(req.params.id);
    if(!customer) {
      return res.status(404).json({
        status:'failed',
        message:`Customer with this ${req.params.id} id not found`
      }); 
    }

    if(customer_status === customer.customer_status) {
      return res.status(400).json({
        status:'failed',
        message:`Customer current status is ${customer.customer_status}`
      });
    }

    const updCustomer = await Customer.findByIdAndUpdate(req.params.id, {
                        customer_status:customer_status
                        }, {
                          runValidators:true
                        });

    const auditLogs = await AuditLogs.create({
                        actor:{
                          id:req.user._id,
                          ip_address:req.ip
                        },
                        target:{
                          id:req.params.id,
                          user_type:'Customer'
                        },
                        action:(customer_status === 'Suspended'?'CUSTOMER_BAN':'CUSTOMER_UNBAN'),
                        reasson:reasson
                      });

    res.status(200).json({
      status:'success',
      message:`Customer new status is ${customer_status}`
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Delete Customer
exports.deleteCustomer = async (req, res) => {
  try{
    const {reasson} = req.body;
    if(!reasson) {
      return res.status(400).json({
        status:'failed',
        message:`To perform a this operation you have to enter a reasson`
      });
    }

    const customer = await Customer.findById(req.params.id);
    if(!customer) {
      return res.status(404).json({
        status:'failed',
        message:`Customer with ${req.params.id} is not found`
      });
    }

    const dltUser = await Customer.findByIdAndDelete(req.params.id);
    const auditLogs = await AuditLogs.create({
                        actor:{
                          id:req.user._id,
                          ip_address:req.ip
                        },
                        target:{
                          id:req.params.id,
                          user_type:'Customer'
                        }, 
                        action:'CUSTOMER_DELETE',
                        reasson:reasson
                      });
    
    res.status(204).json({
      status:'success'
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//-------------------------------------------------------
//Get all Restaurant Owner
exports.getAllOwner = async (req, res) => {
  try{
    let owners = await RestaurantOwner.find();
    if(!owners) {
      return res.status(404).json({
        status:'failed',
        message:'Owner not found'
      });
    } 

    for(let i = 0; i < owners.length; i++) {
      const my_restaurant = await Restaurant.find({"owner_id":owners[i].id})
        .select('restaurant_name');
      owners[i] = owners[i].toObject();
      owners[i].restaurants = my_restaurant;
    }

    res.status(200).json({
      status:'success',
      owners
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
        status:'conflict',
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

//Ban | UnBan Restaurant_owner
exports.banOrUnbanOwner = async (req, res) => {
  try{
    const {reasson, owner_status} = req.body;
    if(!reasson || !owner_status) {
      return res.status(400).json({
        status:'failed',
        message:`reasson | owner_status is missing`
      });
    }

    const owner = await RestaurantOwner.findById(req.params.id);
    if(!owner) {
      return res.status(404).json({
        status:'failed',
        message:`Owner with this ${req.params.id} id not found`
      });
    }

    if(owner_status === owner.restaurant_owner_status || 
      owner.restaurant_owner_status === 'Pending'
    ) {
      return res.status(403).json({
        status:'failed',
        message:`Owner current status is ${owner.restaurant_owner_status}`
      });
    }

    await RestaurantOwner.findByIdAndUpdate(req.params.id, {
      restaurant_owner_status:(owner_status === 'Suspended'?'Suspended':'Approved')
    }, {
      runValidators:true
    });

    await AuditLogs.create({
      actor:{
        id:req.user._id,
        ip_address:req.ip
      },
      target:{
        id:req.params.id,
        user_type:'RestaurantOwner'
      },
      action: (owner_status === 'Suspended'?'OWNER_BAN':'OWNER_UNBAN'),
      reasson:reasson
    });

    res.status(200).json({
      status:'success',
      message:`Owner status changed to ${owner_status}`
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Delete Restaurant Owner
exports.deleteOwner = async(req, res) => {
  try{
    const owner = await RestaurantOwner.findById(req.params.id);
    if(!owner) {
      return res.status(404).json({
        status:'failed',
        message:`user not found with ${req.params.id} this id`
      });
    }

    await Restaurant.deleteMany({
      owner_id:req.params.id
    });

    await RestaurantOwner.findByIdAndDelete(req.params.id);
    await AuditLogs.create({
      actor:{
        id:req.user._id,
        ip_address:req.ip
      },
      targe:{
        id:req.params.id,
        user_type:'RestaurantOwner'
      },
      action:'OWNER_DELETE',
      reasson:req.body.reasson
    });

    res.status(204).json({
      status:'no content'
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//---------------------------------------------------------
//Get all restaurant
exports.getAllRestaurant = async (req, res) => {
  try{
    const restaurant = await Restaurant.find();

    if(!restaurant) {
      return res.status(404).json({
        status:'failed',
        message:'restaurant not found'
      });
    }

    res.status(200).json({
      status:'success',
      restaurant
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

// Accept | Reject Restaurnat
exports.acceptOrRejectRestaurant = async (req, res) => {
  try{
    const {reasson, restaurant_status} = req.body;
    if(!reasson || !restaurant_status) {
      return res.status(400).json({
        status:'failed',
        message:'reasson | restaurant_status missing'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant) {
      return res.status(404).json({
        status:'failed',
        message:`Restaurant with this ${req.params.id} id is not found`
      });
    }

    if(restaurant.restaurant_status !== 'Pending') {
      return res.status(400).json({
        status:'failed',
        message:`This Restaurant Current status is ${restaurant.restaurant_status}`
      });
    }

    if(restaurant_status === 'Rejected') {
      await Restaurant.findByIdAndDelete(req.params.id);
    } else {
      await Restaurant.findByIdAndUpdate(req.params.id, {
            restaurant_status:restaurant_status
          }, {
            runValidators:true
          });
    }

    await AuditLogs.create({
            actor:{
              id:req.user._id,
              ip_address:req.ip
            },
            target:{
              id:req.params.id,
              user_type:'Restaurant'
            },
            action:(restaurant_status === 'Accepted'?'RESTAURANT_APPROVE':'RESTAURANT_REJECT'),
            reasson:reasson
          });
    res.status(200).json({
      status:'success',
      message:`Restaurant Status Set to ${restaurant_status} successfully`
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

// Ban | Unban Restaurant
exports.banUnbanRestaurant = async(req, res) => {
  try{
    const {reasson, restaurant_status} = req.body;
    if(!reasson || !restaurant_status) {
      return res.status(400).json({
        status:'failed',
        message:'reasson | restaurant_status missing'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant) {
      return res.status(404).json({
        status:'failed',
        message:`Restaurant with this ${req.params.id} id is not found`
      });
    }

    if(restaurant.restaurant_status === 'Pending' || restaurant.restaurant_status === restaurant_status) {
      return res.status(400).json({
        status:'failed',
        message:`This Restaurant Current status is ${restaurant.restaurant_status}`
      });
    }

    await Restaurant.findByIdAndUpdate(req.params.id, {
            restaurant_status:restaurant_status
          }, {
            runValidators:true
          });

    await AuditLogs.create({
            actor:{
              id:req.user._id,
              ip_address:req.ip
            },
            target:{
              id:req.params.id,
              user_type:'Restaurant'
            },
            action:(restaurant_status === 'Accepted'?'RESTAURANT_UNBAN':'RESTAURANT_BAN'),
            reasson:reasson
          });
    res.status(200).json({
      status:'success',
      message:`Restaurant Status Set to ${restaurant_status} successfully`
    });
  } catch(err) {
    res.status(400).jsonn({
      status:'failed',
      message:err.message
    });
  }
}

// Delete Restaurant
exports.deleteRestaurant = async(req, res) => {
  try{
    const {reasson} = req.body;
    if(!reasson) {
      return res.status(400).json({
        status:'failed',
        message:'reasson missing'
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if(!restaurant) {
      return res.status(404).json({
        status:'failed',
        message:`Restaurant with this ${req.params.id} id is not found`
      });
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    await Food.deleteMany({restaurant_id:req.params.id});
    
    await AuditLogs.create({
            actor:{
              id:req.user._id,
              ip_address:req.ip
            },
            target:{
              id:req.params.id,
              user_type:'Restaurant'
            },
            action:'RESTAURANT_DELETE',
            reasson:reasson
          });

    res.status(204).json({
      status:'success',
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//---------------------------------------------------------
//Get all Rider
exports.getRider = async(req, res) => {
  try{
    const riders = await Rider.find()
    .select('-rider_location');

    if(!riders) {
      return res.status(404).json({
        status:'failed',
        message:'Riders not found'
      });
    }

    res.status(200).json({
      status:'success',
      riders
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    })
  }
}

//Approve or Reject Rider
exports.approveOrRejectRider = async (req, res) => {
  try{
    const {rider_status, reasson} = req.body;
    const admin_ip = req.ip;

    const rider = await Rider.findById(req.params.id);
    if(!rider) {
      return res.stats(404).json({
        status:'failed',
        message:`User with this ${req.params.id} id is not found`
      });
    }

    if(rider.rider_status === rider_status || rider.rider_status != 'Pending' ) {
      return res.status(409).json({
        status:'conflict',
        message:`Current status is ${rider.rider_status} that's why we can't set it to ${rider_status}`
      });
    }
    
    const updRider = await Rider.findByIdAndUpdate(req.params.id, {
      'rider_status':rider_status
    }, {
      runValidators:true
    });

    await AuditLogs.create({
      actor:{
        id:req.user._id,
        ip_address:admin_ip
      },
      target:{
        id:req.params.id,
        user_type:'Rider'
      },
      action:(rider_status === 'Approved'?'RIDER_APPROVE':'RIDER_REJECT'),
      reasson:reasson
    });

    res.status(200).json({
      status:'success',
      message:`Rider status set to ${rider_status}`
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Ban or Unban Rider
exports.banUnbanRider = async (req, res) => {
  try{

    const {reasson, rider_status} = req.body;
    if(!reasson) {
      return res.status(403).json({
        status:'failed',
        message:err.message
      });
    }

    const rider = await Rider.findById(req.params.id);

    if(!rider) {
      return res.status(404).json({
        status:'not found',
        message:`Rider with this ${req.params.id} not found`
      });
    }

    console.log(`rider_status = ${rider_status}   ${rider.rider_status}`);

    if(rider_status === rider.rider_status || 
      rider.rider_status === 'Pending'
    ) {
      return res.status(400).json({
        status:'failed',
        message:`Current status is ${rider.rider_status}`
      });
    }

    await Rider.findByIdAndUpdate(req.params.id, {
      rider_status:rider_status
    }, {
      runValidators:true
    })

    await AuditLogs.create({
      actor:{
        id:req.user._id,
        ip_address:req.ip
      }, 
      target:{
        id:req.params.id,
        user_type:'Rider'
      },
      action:(rider_status === 'Suspended'?'RIDER_BAN':'RIDER_UNBAN'),
      reasson:reasson
    })

    res.status(200).json({
      status:'success',
      message:`New Rider Status is ${rider_status}`
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Delete Rider
exports.deleteRider = async (req, res) => {
  try{

    if(!req.body.reasson) {
      return res.status(403).json({
        status:'failed',
        message:`Without any reasson you can't perfom this operation`
      });
    }

    const rider = await Rider.findById(req.params.id);
    if(!rider) {
      return res.status(404).json({
        status:'failed',
        message:`Rider with this ${req.params.id} no longer exist`
      });
    }

    const dltRider = await Rider.findByIdAndDelete(req.params.id);
    if(!dltRider) {
      return res.status(400).json({
        status:'failed',
        message:'Failed to delete the rider'
      });
    }

    await AuditLogs.create(
      {
        actor:{
          id:req.user._id,
          ip_address:req.ip
        },
        target:{
          id:req.params.id,
          user_type:'Rider',
        },
        action:'RIDER_DELETE',
        reasson:req.body.reasson
      }
    );

    res.status(204).json({
      status:'deleted'
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//----------------------------------------------------------

//Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {title, message, user_type, reasson} = req.body;

    if(!title || !message || !user_type || !reasson) {
      return res.status(400).json({
        status:'failed',
        message:`title, message, user_type & reasson required`
      });
    } else if(user_type === 'CUSTOMER' || user_type === 'OWNER' || user_type === 'RIDER') {
      if(!req.body.user_id) {
        return res.status(400).json({
          status:'failed',
          message:`User Id required`
        });
      }

      let user;
      if(user_type === 'CUSTOMER') {
        user = await Customer.findById(req.body.user_id);
      } else if(user_type === 'RIDER') {
        user = await Rider.findById(req.body.user_id);
      } else if(user_type === 'OWNER') {
        user = await RestaurantOwner.findById(req.body.user_id);
      }

      if(!user) {
        return res.status(404).json({
          status:'failed',
          message:`User with this ${req.user_id} id is not found`
        });
      }
    }

    await Announcement.create({
            'announcement.title':title,
            'announcement.message':message,
            'admin_id':req.user._id,
            'target.user_type':user_type,
            'target.user_id':req.body.user_id || null
          });

    let auditTarget;
    if(user_type === 'CUSTOMER' || user_type === 'ALL_CUSTOMER') auditTarget = 'Customer';
    else if(user_type === 'RIDER' || user_type === 'ALL_RIDER') auditTarget = 'Rider';
    else if(user_type === 'OWNER' || user_type === 'ALL_RESTAURANT_OWNER') auditTarget = 'RestaurantOwner';
    else if(user_type === 'ALL') auditTarget = 'All';

    await AuditLogs.create({
            actor:{
              id:req.user._id,
              ip_address:req.ip
            }, 
            target:auditTarget,
            action:'ANNOUNCEMENT',
            reasson:reasson
          });

    res.status(200).json({
      status:'success',
      message:'Announcement Sent successfully'
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Get all announcement
exports.getAnnouncement = async (req, res) => {
  try {

    const announcement = await Announcement.find().sort('-createdAt');
    res.status(200).json({
      status:'success',
      announcement
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Admin
exports.getAllAdmin = async (req, res) => {
  try{
    let admins = await Admin.find().select('-admin_password');

    if(!admins) {
      return res.status(404).json({
        status:'failed',
        message:'admin not found'
      });
    }

    for(let i = 0; i < admins.length; i++) {
      admins[i] = admins[i].toObject();
      const myActions = await AuditLogs.find({
        "actor.id":req.user._id
      }).select('action target.user_type');
      admins[i].myActions = myActions
    }

    res.status(200).json({
      status:'success',
      admins
    });
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//GET all audit logs
exports.getAllAuditLogs = async(req, res) => {
  try{
    const logs = await AuditLogs.find().populate('actor.id', 'admin_name');
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
