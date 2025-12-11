const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User_infos = require('./../models/userModel')
const OTP = require('./../models/otpModel');
const sendEmail = require('./../utils/sendEmail');

exports.createUser = async (req, res) => {
  try {
    // Extract and validate input
    const requiredFields = ['user_name', 'user_email', 'user_phone', 'gender', 'user_birth_date', 'user_password', 'user_address'];
    const missingFields = [];

    // Check each required field
    requiredFields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field.replace('user_', ''));
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error', // Industry standard: 'error' not 'Failed'
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Prepare user data
    const userData = {
      user_name: req.body.user_name,
      user_email: req.body.user_email, 
      user_phone: req.body.user_phone,
      gender: req.body.gender,
      user_birth_date: req.body.user_birth_date,
      user_address: req.body.user_address,
      user_password: req.body.user_password, 
      user_role: req.body.user_role || 'Customer'
    };

    const newUser = await User_infos.create(userData);

    // OTP-------------------------------------------------------------------------------------
    const otp = Math.floor(1000 + Math.random() * 90000).toString();
    await OTP.create({
      email: req.body.user_email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    const htmlTemplate = `
      <h2>Your verification code</h2>
      <p style = "font-size:22px"><b>${otp}</b></p>
      <p>This code will expire in 5 minute</p>
    `
    await sendEmail(req.body.user_email, "Verify you account", htmlTemplate);
    // OTP-------------------------------------------------------------------------------------

    res.status(200).json({ 
      status: 'success', 
      message: 'To Active your Account please Enter the otp send to your Email address',
    });

  } catch (err) {
    let statusCode = 500;
    let message = 'Internal server error';
    
    // specific error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.code === 11000) {
      statusCode = 409; // Conflict for duplicates
      message = 'Email or phone number already exists';
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid data format';
    } else {
      // Log unexpected errors (for debugging, not sent to client)
      console.error('User creation error:', err);
    }

    res.status(statusCode).json({
      status: 'error',
      message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const {email, otp} = req.body;

    const record = await OTP.find({email})
    .sort({createdAt:-1})
    .limit(1);

    if(!record) {
      return res.status(400).json({
        status:'failed',
        message:'Otp not found'
      });
    }

    if(record.expiresAt < Date.now()) {
      return res.status(400).json({
        status:'failed',
        message:'Otp expired'
      });
    }

    if(record[0].otp !== otp) {
      return res.status(400).json({
        status:'failed',
        message:'Invalid Otp'
      });
    }

    const newUser = await User_infos.findOneAndUpdate(
      {
        user_email:email
      },
      {
        is_verified: true,
        user_status:"Active"
      }
    );

    await OTP.deleteOne({email});

    // Generating JWT token
    const token = jwt.sign(
      {
        id: newUser._id, // Use 'id' not '_id' for standard JWT claims
        role: newUser.user_role,
        email: newUser.user_email
      },
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      name: newUser.user_name,
      email: newUser.user_email,
      phone: newUser.user_phone,
      gender: newUser.gender,
      birth_date: newUser.user_birth_date,
      address: newUser.user_address,
      role: newUser.user_role,
      status: newUser.user_status,
      createdAt: newUser.createdAt,
      verified: newUser.is_verified
    };

    res.status(200).json({
      status: 'success',
      message: 'Account Activated Successfully',
      token,
      data: {
        user: userResponse
      }
    });

  } catch(error) {
    res.status(400).json({
      status:"failed",
      message:error.message
    });
  }
}

exports.newOtp = async(req, res) => {
  try {

    const email = req.body.email;

    const record = await OTP.find({email})
    .sort({createdAt: -1})
    .limit(1);

    if(!record) {
      return res.status(400).json({
        status:'failed',
        message:'Invalid Email address'
      });
    }

    const lastUpdate = record[0];

    if(lastUpdate.expiresAt >= Date.now()) {
      return res.status(400).json({
        status:'failed',
        message:'You can request for a new code only if the last one expired'
      })
    } 

    const nOtp = Math.floor(1000 + Math.random() * 90000).toString();

    await OTP.findOneAndUpdate(
      {
        email:lastUpdate.email, otp: lastUpdate.otp
      },
      {
        otp:nOtp,
        expiresAt: Date.now() + 5 * 60 * 1000
      }
    )

    const htmlTemplate = `
      <h1>Your New Otp is ${nOtp}</h1>
      <p>Expires in 5 minute</p>
    `
    await sendEmail(email, "New Otp", htmlTemplate);
    res.status(200).json({
      status:'success',
      message:'new otp sent',
      data:{
        nOtp
      }
    })
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

exports.loginUser = async (req, res) => {
  try {

    //get the email and password from the bdoy
    const {user_email, user_password} = req.body;
  
    // Checking if email and password are provided
    if(!user_email || !user_password) {
      return res.status(400).json({
        status:'failed',
        message:'Please provide email and password'
      })
    }

    // looking for the account in database
    const user = await User_infos.findOne({
      user_email: user_email.toLowerCase().trim()
    })
    .select('+user_password +user_status');

    //if user is not available in database
    if(!user) {
      await bcrypt.compare(user_password, '$2b$10$fak3h4shf0rt1m1ng4tt4ck.1234567890123456789012');

      return res.status(401).json({
        status:'failed',
        message:'Invalid email or password'
      });
    }

    // if user is supended 
    if(user.user_status !== 'Active') {
      return res.status(403).json({
        status:'failed',
        message: user.user_status === 'Suspended'
        ?'Your Account is suspended Please contact support'
        :'Your account is not active.'
      });
    }   

    //checking if the password is correct
    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    // if password is not correct
    if(!isPasswordValid) {
      return res.status(401).json({
        status:'failed',
        message:'Invalid email or password'
      });
    }

    // Generate jwt token
    const token = jwt.sign(
      {
        id:user._id,
        email:user.user_email,
        role:user.user_role,
        name:user.user_name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'BiteNow',
        audience: 'BiteNow-Client'
      }
    )

    // last login
    user.lastLogin = new Date();
    await user.save({validateBeforeSave:false});

    //prepare user response without sensetive data
    const userResponse = {
      _id:user._id,
      user_name:user.user_name,
      user_email:user.user_email,
      user_phone:user.user_phone,
      user_birth_date:user.user_birth_date,
      user_address:user.user_address,
      user_role:user.user_role,
      user_status:user.user_status,
      lastLogin:user.lastLogin,
      createdAt:user.createdAt,
      updatedAt:user.updatedAt
    };

    // if everything is ok 
    res.status(200).json({
      status:'success',
      message:'Login successfully',
      token,
      data:{
        user:userResponse
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    
    // Handle specific error types
    let statusCode = 500;
    let message = 'An error occurred during login';
    
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Invalid input data';
    } else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token configuration';
    } else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token has expired';
    }
    
    res.status(statusCode).json({
      status: 'failed',
      message
    });
  }
}