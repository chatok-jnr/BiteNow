const jwt = require("jsonwebtoken");
const User_infos = require("./../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2. Or get token from cookies (for web apps)
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // 3. Check if token exists
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // 4. Verify token (FIXED: JWT_SECRET not JWT_SECRECT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Check if user still exists
    const currentUser = await User_infos.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "failed",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 6. Check if user changed password after token was issued
    // Make sure your model has this method!
    if (
      currentUser.changedPasswordAfter &&
      currentUser.changedPasswordAfter(decoded.iat)
    ) {
      return res.status(401).json({
        status: "failed",
        message: "User recently changed password. Please log in again.",
      });
    }

    // 7. Check if account is active
    if (currentUser.user_status !== "Active") {
      return res.status(403).json({
        status: "failed",
        message: "Your account is not active.",
      });
    }

    // 8. Grant access
    req.user = currentUser;
    res.locals.user = currentUser; // For views if using templates

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token. Please log in again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "failed",
        message: "Your token has expired. Please log in again.",
      });
    }

    if (
      error.name === "TypeError" &&
      error.message.includes("Cannot read properties of undefined")
    ) {
      return res.status(401).json({
        status: "failed",
        message: "No authorization token provided.",
      });
    }

    console.error("Auth middleware error:", error.message);

    return res.status(500).json({
      status: "failed",
      message: "Something went wrong with authentication.",
    });
  }
};

/*
after creating all roles
we have to implement
the role restriction middleware
*/

/*
const authMiddleware = require('./../middleware/authMiddleware');
express.use(authMiddleware.protect)
*/
