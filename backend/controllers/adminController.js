const Customer = require('./../models/customerModel');
const Rider = require('./../models/riderModel');
const RestaurantOwner = require('./../models/restaurantOwnerModel');
const Restaurant = require('./../models/restaurantModel');

//Update Rider
exports.updateRider = async (req, res) => {
  try{
    const {rider_status} = req.body;
    if(!rider_status) {
      return res.status(400).json({
        status:'failed',
        message:'Invalid field'
      });
    }

    await Rider.findByIdAndUpdate(req.params.id, {
      rider_status:rider_status
    });

    res.status(200).json({
      status:'success',
      message:'Rider status changed successfully'
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Update Restaurant Owner
exports.updateRestaurantOwner = async (req, res) => {
  try{
    const {restaurant_owner_status} = req.body;
    if(!restaurant_owner_status) {
      return res.status(400).json({
        status:'failed',
        message:'Invalid field'
      });
    }

    await RestaurantOwner.findByIdAndUpdate(req.params.id, {
      restaurant_owner_status:restaurant_owner_status
    });

    res.status(200).json({
      status:'success',
      message:'Restaurant Owner status changed successfully'
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Update Customer
exports.updateCustomer = async (req, res) => {
  try{
    const {customer_status} = req.body;
    if(!customer_status) {
      return res.status(400).json({
        status:'failed',
        message:'Invalid field'
      });
    }

    await Customer.findByIdAndUpdate(req.params.id, {
      customer_status:customer_status
    });

    res.status(200).json({
      status:'success',
      message:'Customer status changed successfully'
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}
