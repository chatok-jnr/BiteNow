const jwt = require('jsonwebtoken');
const User_infos = require('./../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    //get token from the header
    let token = req.headers.authorization.split(' ')[1];

    // if there is no token
    if(!token) {
      return res.status(401).json({
        status:'failed',
        message:'You are not logged in, please log in again to get access'
      });
    }

    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRECT);

    // check if user still exist
    const currentUser = await User_infos.findById(decode.id);
    if(!currentUser) {
      return res.status(401).json({
        status:'failed',
        message:'User with this token is no longer exist'
      });
    }

    // check if user changed password after token was issued
    if(currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decode.iat)) {
      return res.status(401).json({
        status:'failed',
        message:'User recently changed password, please login again'
      });
    }

    // check if acount is active
    if(currentUser.status !== 'Active') {
      return res.status(400).json({
        status:'failed',
        message:'Your accont is no longer active'
      });
    }

    // Grant request
    req.user = currentUser;
    req.local.user = currentUser

    next();
  } catch(error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'failed',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    return res.status(500).json({
      status: 'failed',
      message: 'Something went wrong with authentication.'
    });
  }
}

/*
after creating all roles
we have to implement
the role restriction middleware
*/

/*
const authMiddleware = require('./../middleware/authMiddleware');
express.use(authMiddleware.protect)
*/