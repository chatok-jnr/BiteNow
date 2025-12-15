const jwt = require('jsonwebtoken');
const Admin = require('./../models/adminModel');
const Customer = require('./../models/customerModel');
const RestaurantOwner = require('./../models/restaurantOwnerModel');
const Rider = require('./../models/riderModel');

exports.protect = async (req, res, next) => {

  let token;
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if(!token) {
    return res.status(401).json({message: 'You are not looged in'});
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    let user = 
      (await Customer.findById(decode.id)) ||
      (await Rider.findById(decode.id)) ||
      (await Admin.findById(decode.id)) ||
      (await RestaurantOwner.findById(decode.id));

    if(!user) {
      return res.status(401).json({
        status:'failed',
        message:'User no longer exists.'
      });
    }

    req.user = user;
    req.user.role = user.role;

    next();
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
};

//restrictTo middleware: check user role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return res.status(403).json({
        message:'You do not have permission to perform this action'
      });
    }
    next();
  }
}