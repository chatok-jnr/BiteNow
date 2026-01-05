const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Customer = require('../models/customerModel');
const RestaurantOwner = require('../models/restaurantOwnerModel');
const Rider = require('../models/riderModel');
const jwt = require('jsonwebtoken');

// Customer Google OAuth Strategy
passport.use('google-customer',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/google/customer/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        let customer = await Customer.findOne({ customer_email: email });

        if (customer) {
          return done(null, { ...customer.toObject(), role: 'customer' });
        } else {
          customer = await Customer.create({
            customer_name: name,
            customer_email: email,
            customer_photo: photo,
            customer_phone: '',
            customer_birth_date: new Date(),
            customer_gender: 'Other',
            customer_address: '',
            customer_password: Math.random().toString(36).slice(-8),
            isGoogleAuth: true,
          });

          return done(null, { ...customer.toObject(), role: 'customer' });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Restaurant Owner Google OAuth Strategy
passport.use('google-restaurant',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/google/restaurant/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let restaurantOwner = await RestaurantOwner.findOne({ restaurant_owner_email: email });

        if (restaurantOwner) {
          return done(null, { ...restaurantOwner.toObject(), role: 'restaurant' });
        } else {
          restaurantOwner = await RestaurantOwner.create({
            restaurant_owner_name: name,
            restaurant_owner_email: email,
            restaurant_owner_phone: '',
            restaurant_owner_gender: 'Other',
            restaurant_owner_dob: new Date(),
            restaurant_owner_address: '',
            restaurant_owner_password: Math.random().toString(36).slice(-8),
            restaurant_owner_status: 'Pending',
            isGoogleAuth: true,
          });

          return done(null, { ...restaurantOwner.toObject(), role: 'restaurant' });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Rider Google OAuth Strategy
passport.use('google-rider',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/google/rider/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let rider = await Rider.findOne({ rider_email: email });

        if (rider) {
          return done(null, { ...rider.toObject(), role: 'rider' });
        } else {
          rider = await Rider.create({
            rider_name: name,
            rider_email: email,
            rider_address: '',
            rider_gender: 'Other',
            rider_date_of_birth: new Date(),
            rider_password: Math.random().toString(36).slice(-8),
            rider_status: 'Pending',
            rider_contact_info: {
              emergency_contact: '',
              alternative_phone: '',
            },
            isGoogleAuth: true,
          });

          return done(null, { ...rider.toObject(), role: 'rider' });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, { id: user._id || user.id, role: user.role });
});

// Deserialize user from the session
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.role === 'customer') {
      user = await Customer.findById(data.id);
    } else if (data.role === 'restaurant') {
      user = await RestaurantOwner.findById(data.id);
    } else if (data.role === 'rider') {
      user = await Rider.findById(data.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
