const jwt = require('jsonwebtoken');
const User_infos = require('./../models/userModel');

exports.protect = async (req, res, next) => {
  
  next();
}