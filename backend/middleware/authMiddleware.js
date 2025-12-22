const jwt = require('jsonwebtoken');
const Admin = require('./../models/adminModel');
const Customer = require('./../models/customerModel');
const RestaurantOwner = require('./../models/restaurantOwnerModel');
const Rider = require('./../models/riderModel');
const GuestSession = require('./../models/guestSessionModel');

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

// Optional protect - allows both authenticated users and guests
exports.optionalProtect = async (req, res, next) => {
  let token;
  
  console.log('🔐 optionalProtect middleware:', {
    authHeader: req.headers.authorization || 'None',
    guestHeader: req.headers['x-guest-session-id'] || 'None',
    url: req.originalUrl
  });
  
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('📝 Token found:', token ? `${token.substring(0, 20)}...` : 'Empty');
  }

  // If token exists, try to authenticate
  if(token) {
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully:', { userId: decode.id });

      let user = 
        (await Customer.findById(decode.id)) ||
        (await Rider.findById(decode.id)) ||
        (await Admin.findById(decode.id)) ||
        (await RestaurantOwner.findById(decode.id));

      if(user) {
        req.user = user;
        req.user.role = user.role;
        req.isAuthenticated = true;
        console.log('✅ User authenticated:', { userId: user._id.toString(), role: user.role });
      } else {
        console.log('⚠️ Token valid but user not found');
        req.isAuthenticated = false;
      }
    } catch(err) {
      // Token invalid, continue as guest
      console.log('❌ Token verification failed:', err.message);
      req.isAuthenticated = false;
    }
  } else {
    // No token, check for guest session
    console.log('ℹ️ No token provided');
    req.isAuthenticated = false;
  }

  // Handle guest session
  if (!req.isAuthenticated) {
    const guestSessionId = req.headers['x-guest-session-id'];
    
    console.log('👤 Processing as guest, session ID:', guestSessionId || 'Will create new');
    
    if (guestSessionId) {
      try {
        // Find or create guest session
        const guestSession = await GuestSession.findOrCreate(guestSessionId);
        req.guestSessionId = guestSession.session_id;
        console.log('✅ Guest session set:', req.guestSessionId);
      } catch(err) {
        console.log('❌ Guest session error:', err.message);
        return res.status(400).json({
          status: 'failed',
          message: 'Invalid guest session'
        });
      }
    } else {
      // Generate a new guest session ID and inform client
      const { v4: uuidv4 } = require('crypto').randomUUID ? 
        { v4: () => require('crypto').randomUUID() } : 
        require('uuid');
      const newGuestSessionId = require('crypto').randomUUID();
      
      try {
        await GuestSession.findOrCreate(newGuestSessionId);
        req.guestSessionId = newGuestSessionId;
        res.setHeader('X-Guest-Session-Id', newGuestSessionId);
      } catch(err) {
        return res.status(500).json({
          status: 'failed',
          message: 'Failed to create guest session'
        });
      }
    }
  }

  next();
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