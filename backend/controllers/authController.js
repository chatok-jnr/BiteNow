const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Admin = require("./../models/adminModel");
const Customer = require("../models/customerModel");
const Rider = require("./../models/riderModel");
const RestaurantOwner = require("./../models/restaurantOwnerModel");

const OTP = require("./../models/otpModel");
const sendEmail = require("./../utils/sendEmail");

//Customer
//Register
exports.createCustomer = async (req, res) => {
  try {
    const requiredFields = [
      "customer_name",
      "customer_email",
      "customer_phone",
      "customer_birth_date",
      "customer_gender",
      "customer_address",
      "customer_password",
    ];

    const missingFields = [];
    requiredFields.forEach((el) => {
      if (!req.body[el]) missingFields.push(el.replace("customer_", ""));
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: `Missing Required Fields: ${missingFields.join(", ")}`,
      });
    }

    const customerData = {
      customer_name: req.body.customer_name,
      customer_email: req.body.customer_email,
      customer_phone: req.body.customer_phone,
      customer_birth_date: req.body.customer_birth_date,
      customer_gender: req.body.customer_gender,
      customer_address: req.body.customer_address,
      customer_password: req.body.customer_password,
      customer_photo: req.body.customer_photo ? req.body.customer_photo : "",
      customer_location: {
        type: "Point",
        coordinates: req.body.coordinates,
      },
    };

    const newCustomer = await Customer.create(customerData);

    //Send otp
  //   const otp = Math.floor(1000 + Math.random() * 9000).toString();
  //   await OTP.create({
  //     email: req.body.customer_email,
  //     user_type: "customer",
  //     otp,
  //     expiresAt: Date.now() + 5 * 60 * 1000,
  //   });

  //   const htmlTemplate = `
  //   <h2>Your BiteNow Verification Code</h2>
  //   <p style = "font-size:22px>
  //   Your Customer account verification code is ${otp}</p>
  //   <p>This code will expires in 5 minutes</p>
  // `;
    
  //   // Try to send email, but don't fail the request if it fails
  //   let emailSent = true;
  //   try {
  //     await sendEmail(req.body.customer_email, "Verify your account", htmlTemplate);
  //   } catch (emailError) {
  //     console.error("Failed to send verification email:", emailError.message);
  //     emailSent = false;
  //   }

    res.status(201).json({
      status: "success",
      // message: emailSent 
      //   ? "To active your account please enter the verification code sent to you email address"
      //   : "Account created successfully. However, we couldn't send the verification email. Please contact support or try requesting a new OTP.",
      message:`Account Created`,
      data: {
        newCustomer,
      },
      //emailSent,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
//verify-account
// exports.verifyCustomerOtp = async (req, res) => {
//   try {
//     const { email, user_type, otp } = req.body;

//     const record = await OTP.find({ email, user_type })
//       .sort("-createdAt")
//       .limit(1);

//     if (!record) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Otp not found",
//       });
//     }

//     if (record[0].expiresAt < Date.now()) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Your otp has been expired please request for a new one",
//       });
//     }

//     if (record[0].otp !== otp) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Inavlid otp",
//       });
//     }

//     const newCustomer = await Customer.findOneAndUpdate(
//       {
//         customer_email: email,
//       },
//       {
//         customer_is_verified: true,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     await OTP.deleteMany({ email, user_type });

//     const token = jwt.sign(
//       {
//         id: newCustomer._id,
//         role: "customer",
//         email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//       }
//     );

//     res.status(201).json({
//       status: "success",
//       message: "Welcome to BiteNow",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };
//login
exports.loginCustomer = async (req, res) => {
  try {
    const { customer_email, customer_phone, customer_password } = req.body;
    
    // Check if password is provided
    if (!customer_password) {
      return res.status(400).json({
        status: "failed",
        message: "Please enter your password",
      });
    }

    // Check if either email or phone is provided
    if (!customer_email && !customer_phone) {
      return res.status(400).json({
        status: "failed",
        message: "Please enter your email or phone number",
      });
    }

    // Find customer by email or phone
    let customer;
    if (customer_email) {
      customer = await Customer.findOne({
        customer_email: customer_email,
      }).select("+customer_password +customer_status");
    } else if (customer_phone) {
      customer = await Customer.findOne({
        customer_phone: customer_phone,
      }).select("+customer_password +customer_status");
    }

    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: customer_email 
          ? "You entered a wrong email address"
          : "You entered a wrong phone number",
      });
    }

    const { customer_status } = customer;
    const isPasswordValid = await bcrypt.compare(
      req.body.customer_password,
      customer.customer_password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "You entered a wrong password",
      });
    }

    if (!customer.customer_is_verified) {
      return res.status(400).json({
        status: "failed",
        message: "Your account is not verified yet",
      });
    }

    if (customer_status !== "Active") {
      return res.status(400).json({
        status: "failed",
        message:
          "Your account has been suspended. Please contact the support team to learn more",
      });
    }

    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.customer_email,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: "BiteNow",
        audience: "BiteNow-customer",
      }
    );

    const customerResponse = {
      customer_id: customer._id,
      customer_name: customer.customer_name,
      customer_email: customer.customer_email,
      customer_phone: customer.customer_phone,
      customer_birth_date: customer.customer_birth_date,
      customer_gender: customer.customer_gender,
      customer_address: customer.customer_address,
      customer_photo: customer.customer_photo || "",
      customer_is_verified: customer.customer_is_verified,
    };

    res.status(200).json({
      status: "success",
      message: "Login successfully",
      token,
      data: {
        customer: customerResponse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Rider------------------------------------------------------
//Register
exports.createRider = async (req, res) => {
  try {
    const requiredFields = [
      "rider_name",
      "rider_address",
      "rider_password",
      "rider_date_of_birth",
      "emergency_contact",
      "rider_email",
      "rider_gender",
    ];

    const missingFields = [];
    requiredFields.forEach((el) => {
      if (!req.body[el]) {
        missingFields.push(el.replace("rider_", ""));
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: `Missing Required Fields: ${missingFields.join(", ")}`,
      });
    }

    const riderData = {
      rider_name: req.body.rider_name,
      rider_address: req.body.rider_address,
      rider_status: "Pending",
      rider_contact_info: {
        emergency_contact: req.body.emergency_contact,
        alternative_phone: req.body.alternative_phone || "",
      },
      rider_email: req.body.rider_email,
      rider_password: req.body.rider_password,
      rider_date_of_birth: req.body.rider_date_of_birth,
      rider_gender: req.body.rider_gender,
      rider_location: {
        type: "Point",
        coordinates: req.body.coordinates,
      },
    };

    const newRider = await Rider.create(riderData);

    // Send otp
    // const otp = Math.floor(1000 + Math.random() * 90000).toString();
    // await OTP.create({
    //   email: req.body.rider_email,
    //   user_type: "rider",
    //   otp,
    //   expiresAt: Date.now() + 5 * 60 * 1000,
    // });

    // const htmlTemplate = `
    //   <h2>Your BiteNow verification code</h2>
    //   <p style = "font-size:22px">
    //   Your Rider Account verification code is <b>${otp}</b>
    //   </p>
    //   <p>This code will Expire in 5 minute</p>
    // `;
    
    // // Try to send email, but don't fail the request if it fails
    // let emailSent = true;
    // try {
    //   await sendEmail(req.body.rider_email, "Verify your account", htmlTemplate);
    // } catch (emailError) {
    //   console.error("Failed to send verification email:", emailError.message);
    //   emailSent = false;
    // }

    res.status(201).json({
      status: "success",
      // message: emailSent 
      //   ? "To Active your account please enter the otp send to your email"
      //   : "Account created successfully. However, we couldn't send the verification email. Please contact support or try requesting a new OTP.",
      message:'Your Rider Account created successfully, Now wait for the Admin Approval',
      data: {
        newRider,
      },
      //emailSent,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
//Verify accounut
// exports.verifyRiderOtp = async (req, res) => {
//   try {
//     const { email, user_type, otp } = req.body;

//     const record = await OTP.find({ email, user_type })
//       .sort("-createdAt")
//       .limit(1);

//     if (!record) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Otp not found",
//       });
//     }

//     if (record[0].expiresAt < Date.now()) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Your otp has been expired please request for a new one",
//       });
//     }

//     if (record[0].otp !== otp) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Invalid Otp",
//       });
//     }

//     const newRider = await Rider.findOneAndUpdate(
//       {
//         rider_email: email,
//       },
//       {
//         rider_is_verified: true,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     await OTP.deleteMany({ email, user_type });

//     const token = jwt.sign(
//       {
//         id: newRider._id,
//         role: "rider",
//         email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
//     );

//     res.status(201).json({
//       status: "success",
//       message:
//         "If all is ok Admin will send a email to your about the confirmation of you as a rider",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };

//Login
exports.loginRider = async (req, res) => {
  try {
    const { rider_email, rider_password } = req.body;

    if (!rider_email || !rider_password) {
      return res.status(404).json({
        status: "failed",
        message: "Please provide the email and password",
      });
    }

    const rider = await Rider.findOne({ rider_email: rider_email }).select(
      "+rider_password +rider_status"
    );

    if (!rider) {
      return res.status(404).json({
        status: "failed",
        message: "You enterd a wrong email & password",
      });
    }

    if (rider.rider_status !== "Approved") {
      let msg = "Your rider request is not approved yet";
      if (rider.rider_status === "Rejected") {
        msg = "Your are not valid to become a rider";
      } else if (rider.rider_status === "Suspended") {
        msg =
          "Your account has been suspended. Please Contact the support team to learn more";
      }

      return res.status(400).json({
        status: "failed",
        message: msg,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      rider_password,
      rider.rider_password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        staus: "failed",
        message: "You enterd a wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: rider._id,
        email: rider_email,
        role: "rider",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: "BiteNow",
        audience: "BiteNow-rider",
      }
    );

    const riderResponse = {
      rider_id: rider._id,
      rider_name: rider.rider_name,
      rider_address: rider.rider_address,
      rider_status: "Approved",
      rider_documents: {
        nid_no: req.body.nid_no,
      },
      rider_contact_info: {
        emergency_contact: rider.emergency_contact,
        alternative_phone: rider.alternative_phone || "",
      },
      rider_email: rider.rider_email,
      rider_date_of_birth: rider.rider_date_of_birth,
      rider_gender: rider.rider_gender,
      rider_is_verified: rider.is_verified,
      rider_stats: rider.rider_stats,
    };

    res.status(200).json({
      status: "success",
      message: "Login successfully",
      token,
      data: {
        user: riderResponse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Restaurant Owner---------------------------------------------
//Register
exports.createRestaurantOwner = async (req, res) => {
  try {
    const requiredFields = [
      "restaurant_owner_name",
      "restaurant_owner_phone",
      "restaurant_owner_email",
      "restaurant_owner_password",
      "restaurant_owner_gender",
      "restaurant_owner_dob",
      "restaurant_owner_address",
    ];
    const missingFields = [];
    requiredFields.forEach((fields) => {
      if (!req.body[fields]) {
        missingFields.push(fields.replace("restaurant_owner_", ""));
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing requird fields: ${missingFields.join(", ")}`,
      });
    }

    //prepare data
    const restaurantOwnerData = {
      restaurant_owner_name: req.body.restaurant_owner_name,
      restaurant_owner_phone: req.body.restaurant_owner_phone,
      restaurant_owner_email: req.body.restaurant_owner_email,
      restaurant_owner_password: req.body.restaurant_owner_password,
      restaurant_owner_gender: req.body.restaurant_owner_gender,
      restaurant_owner_dob: req.body.restaurant_owner_dob,
      restaurant_owner_address: req.body.restaurant_owner_address,
    };

    const newRestaurantOwner = await RestaurantOwner.create(
      restaurantOwnerData
    );

    //Send otp
    // const otp = Math.floor(1000 + Math.random() * 90000).toString();
    // await OTP.create({
    //   email: req.body.restaurant_owner_email,
    //   user_type: "restaurant_owner",
    //   otp,
    //   expiresAt: Date.now() + 5 * 60 * 1000,
    // });

    // const htmlTemlate = `
    //   <h2>Your BiteNow Verification code</h2>
    //   <p>Your Restaurant owner verification code is ${otp}</p>
    //   <p>This code will expires in 5 minutes</p>
    // `;
    
    // // Try to send email, but don't fail the request if it fails
    // let emailSent = true;
    // try {
    //   await sendEmail(
    //     req.body.restaurant_owner_email,
    //     "Verify Your Restaurant Owner Account",
    //     htmlTemlate
    //   );
    // } catch (emailError) {
    //   console.error("Failed to send verification email:", emailError.message);
    //   emailSent = false;
    // }

    res.status(201).json({
      status: "success",
      // message: emailSent
      //   ? "To Active your account Enter the otp code send to your email address"
      //   : "Account created successfully. However, we couldn't send the verification email. Please contact support or try requesting a new OTP.",
      message:'Your Restauratn Owner Account created successfully',
      data: newRestaurantOwner,
      //emailSent,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message || "Failed to register as Restaurant owner",
    });
  }
};
// //Verify account
// exports.restaurantOwnerVerification = async (req, res) => {
//   try {

//     const { email, user_type, otp } = req.body;
//     if (!email || !user_type || !otp) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Please enter the email, user_type and otp",
//       });
//     }

//     const record = await OTP.find({ email: email, user_type: user_type })
//       .sort("-createdAt")
//       .limit(1);

//     if (record.length === 0) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Invalid email or user_type",
//       });
//     }

//     if (req.body.otp !== record[0].otp) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Invalid OTP",
//       });
//     }

//     await RestaurantOwner.findOneAndUpdate(
//       {
//         restaurant_owner_email: email,
//       },
//       {
//         restaurant_owner_is_verified: true,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     res.status(200).json({
//       status: "success",
//       message:
//         "Your Account is verified. Now Please wait for the admin approval",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };

//Login
exports.loginRestaurantOwner = async (req, res) => {
  try {
    const { restaurant_owner_email, restaurant_owner_password } = req.body;

    if (!restaurant_owner_email || !restaurant_owner_password) {
      return res.status(400).json({
        status: "failed",
        message: "Please enter the email and password",
      });
    }

    const restaurantOwner = await RestaurantOwner.findOne({
      restaurant_owner_email: restaurant_owner_email,
    }).select("+restaurant_owner_password +restaurant_owner_status");

    if (!restaurantOwner) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const pass = restaurantOwner.restaurant_owner_password;
    const sts = restaurantOwner.restaurant_owner_status;

    const isPasswordValid = await bcrypt.compare(
      restaurant_owner_password,
      pass
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "Wrong Password",
      });
    }
    

    if (sts !== "Approved") {
      let msg = "Your account is not acitve yet";
      if (sts === "Suspended")
        msg =
          "Your account has been suspended. To learn more please contatct the support team";
      return res.status(400).json({
        status: "failed",
        message: msg,
      });
    }

    const token = jwt.sign(
      {
        id: restaurantOwner._id,
        role: "restaurant",
        email: req.body.restaurant_owner_email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        issuer: "BiteNow",
        audience: "BiteNow-restaurant-owner",
      }
    );

    const ownerResponse = {
      id: restaurantOwner._id,
      restaurant_owner_name: restaurantOwner.restaurant_owner_name,
      restaurant_owner_phone: restaurantOwner.restaurant_owner_phone,
      restaurant_owner_email: restaurantOwner.restaurant_owner_email,
      restaurant_owner_gender: restaurantOwner.restaurant_owner_gender,
      restaurant_owner_dob: restaurantOwner.restaurant_owner_dob,
      restaurant_owner_address: restaurantOwner.restaurant_owner_address,
      restaurant_owner_status: restaurantOwner.restaurant_owner_status,
      restaurant_owner_is_verified:
        restaurantOwner.restaurant_owner_is_verified,
    };

    res.status(200).json({
      status: "success",
      message: "Login successfully",
      token,
      data: {
        ownerResponse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Admin---------------------------------------------------------
exports.createAdmin = async (req, res) => {
  try {
    const superAdmin = await Admin.findById(req.user._id);

    if(superAdmin.is_super === false) {
      return res.status(403).json({
        status:'failed',
        message:'Only super admin are authroized to perform this operation'
      });
    }

    const requiredFields = [
      "admin_name",
      "admin_email",
      "admin_phone",
      "admin_dob",
      "admin_password",
      "admin_gender",
    ];

    let missingFields = [];
    requiredFields.forEach((el) => {
      if (!req.body[el]) {
        missingFields.push(el.replace("admin_", ""));
      }
    });
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: `Missing Required Fields: ${missingFields.join(", ")}`,
      });
    }


    // Send OTP
    // const otp = Math.floor(1000 + Math.random() * 90000).toString();
    // const htmlTemplate = `
    //   <h2>Your Admin Account Verification OTP</h2>
    //   <p>Your otp is ${otp}</p>
    //   <p>This otp will expires in 5 minutes</p>
    // `;
    // await OTP.create({
    //   email: req.body.admin_email,
    //   user_type: "admin",
    //   otp,
    //   expiresAt: Date.now() + 5 * 60 * 1000,
    // });

    const adminData = {
      admin_name: req.body.admin_name,
      admin_email: req.body.admin_email,
      admin_phone: req.body.admin_phone,
      admin_dob: req.body.admin_dob,
      admin_password: req.body.admin_password,
      admin_gender: req.body.admin_gender,
      admin_address: req.body.admin_address || "",
      admin_photo: req.body.admin_photo || "",
    };
    // await sendEmail(
    //   req.body.admin_email,
    //   "Admin Account Verification Code",
    //   htmlTemplate
    // );
    const newAdmin = await Admin.create(adminData);
    if(!newAdmin) {
      return res.status(400).json({
        status:'failed',
        message:'Failed to create new admin'
      });
    }
    res.status(201).json({
      status: "Success",
      message: "New Admin Added successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
exports.adminLogin = async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;
    if (!admin_email || !admin_password) {
      return res.status(400).json({
        status: "failed",
        message: "Email & Password required",
      });
    }

    const admin = await Admin.findOne({ admin_email: admin_email });
    if (!admin) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid Email",
      });
    }

    const isPasswordValid = await admin.comparePassword(admin_password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "failed",
        message: "Password is wrong",
      });
    }

    if (admin.admin_is_verified === false) {
      return res.status(400).json({
        status: "failed",
        message: "Your account is not verified yet",
      });
    }

    const token = admin.jwtToken();

    const adminResponse = {
      admin_name: admin.admin_name,
      admin_email: admin.admin_email,
      admin_phone: admin.admin_phone,
      admin_dob: admin.admin_dob,
      admin_gender: admin.admin_gender,
      admin_address: admin.admin_address || "",
      role: admin.role,
      admin_photo: admin.admin_photo || "",
      is_super: admin.is_super || false,
    };

    res.status(200).json({
      status: "success",
      message: "Welcome back to BiteNow",
      token,
      data: {
        adminResponse,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};
exports.deleteAdmin = async (req, res) => {
  try{

    const {is_super} = await Admin.findById(req.user._id);
    if(!is_super) {
      return res.status(403).json({
        status:'failed',
        message:'You are not authorized to perform this operation'
      });
    }

    if(!req.body.target_id) {
      return res.status(400).json({
        status:'failed',
        message:'You need an target id to perfomr this opeartion'
      });
    }

    const targetUser = await Admin.findById(req.body.target_id);
    if(!targetUser) {
      return res.status(404).json({
        status:'failed',
        message:'No admin found with the given id'
      });
    }

    const dltAdmin = await Admin.findByIdAndDelete(req.body.target_id);
    if(!dltAdmin) {
      return res.status(400).json({
        status:'failed',
        message:'Failed to delete this admin'
      });
    }

    res.status(204).json({
      status:'no-content'
    });

  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
};

// exports.verifyAdmin = async (req, res) => {
//   try {
//     const { email, user_type, otp } = req.body;
//     if (!email || !user_type || !otp) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Please enter email, user_type and otp",
//       });
//     }

//     const record = await OTP.find({
//       email: email,
//       user_type: user_type,
//     })
//       .sort("-createdAt")
//       .limit(1);

//     if (record.length === 0) {
//       return res.status(404).json({
//         status: "failed",
//         message: "Wrong Data",
//       });
//     }

//     if (record[0].otp !== otp) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Wrong OTP",
//       });
//     }

//     if (record[0].expiresAt < Date.now()) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Otp has been expired please request for a new one",
//       });
//     }

//     await OTP.deleteMany({ email: email, user_type: user_type });
//     await Admin.findOneAndUpdate(
//       {
//         admin_email: email,
//       },
//       {
//         admin_is_verified: true,
//       }
//     );

//     res.status(200).json({
//       status: "success",
//       message: "You account is activated successfully",
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "success",
//       message: err.message,
//     });
//   }
// };

// exports.newOtp = async (req, res) => {
//   try {
//     const { email, user_type } = req.body;

//     const record = await OTP.find({ email, user_type })
//       .sort("-createdAt")
//       .limit(1);

//     if (!record) {
//       return res.status(400).json({
//         status: "failed",
//         message: "Invalid Email address",
//       });
//     }

//     const lastUpdate = record[0];

//     if (lastUpdate.expiresAt >= Date.now()) {
//       return res.status(400).json({
//         status: "failed",
//         message: "You can request for a new code only if the last one expired",
//       });
//     }

//     const nOtp = Math.floor(1000 + Math.random() * 90000).toString();

//     await OTP.findOneAndUpdate(
//       {
//         email: lastUpdate.email,
//         otp: lastUpdate.otp,
//       },
//       {
//         expiresAt: Date.now() + 5 * 60 * 1000,
//       }
//     );

//     const htmlTemplate = `
//       <h1>Your New Otp is ${nOtp}</h1>
//       <p>Expires in 5 minute</p>
//     `;
//     await sendEmail(email, "New Otp", htmlTemplate);
//     res.status(200).json({
//       status: "success",
//       message: "new otp sent",
//       data: {
//         nOtp,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: err.message,
//     });
//   }
// };

// Google OAuth Success Handler - Customer
exports.googleAuthSuccessCustomer = async (req, res) => {
  try {
    const customer = req.user;

    // Check customer status
    if (customer.customer_status !== "Active") {
      const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=account_suspended`;
      return res.redirect(errorUrl);
    }

    const token = jwt.sign(
      { 
        id: customer._id,
        email: customer.customer_email,
        role: "customer"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/google/success?token=${token}&userId=${customer._id}&role=customer`;
    res.redirect(redirectUrl);
  } catch (err) {
    const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`;
    res.redirect(errorUrl);
  }
};

// Google OAuth Success Handler - Restaurant Owner
exports.googleAuthSuccessRestaurant = async (req, res) => {
  try {
    const restaurantOwner = req.user;

    // Check restaurant owner status
    if (restaurantOwner.restaurant_owner_status !== "Approved") {
      let errorMsg = "account_not_approved";
      if (restaurantOwner.restaurant_owner_status === "Suspended") {
        errorMsg = "account_suspended";
      } else if (restaurantOwner.restaurant_owner_status === "Rejected") {
        errorMsg = "account_rejected";
      }
      const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=${errorMsg}`;
      return res.redirect(errorUrl);
    }

    const token = jwt.sign(
      { 
        id: restaurantOwner._id,
        email: restaurantOwner.restaurant_owner_email,
        role: "restaurant"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/google/success?token=${token}&userId=${restaurantOwner._id}&role=restaurant`;
        
    res.redirect(redirectUrl);
  } catch (err) {
    const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`;
    res.redirect(errorUrl);
  }
};

// Google OAuth Success Handler - Rider
exports.googleAuthSuccessRider = async (req, res) => {
  try {
    const rider = req.user;

    // Check rider status
    if (rider.rider_status !== "Approved") {
      let errorMsg = "account_not_approved";
      if (rider.rider_status === "Suspended") {
        errorMsg = "account_suspended";
      } else if (rider.rider_status === "Rejected") {
        errorMsg = "account_rejected";
      }
      const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=${errorMsg}`;
      return res.redirect(errorUrl);
    }

    const token = jwt.sign(
      { 
        id: rider._id,
        email: rider.rider_email,
        role: "rider"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/google/success?token=${token}&userId=${rider._id}&role=rider`;
    res.redirect(redirectUrl);
  } catch (err) {
    const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`;
    res.redirect(errorUrl);
  }
};

// Google OAuth Failure Handler
exports.googleAuthFailure = (req, res) => {
  const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`;
  res.redirect(errorUrl);
};
