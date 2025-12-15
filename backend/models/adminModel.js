const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  admin_name:{
    type:String,
    required:true,
    min:5,
    max:50
  },
  admin_email:{
    type:String,
    required:true,
    unique:true,
    min:10,
    max:100,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,24})+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  admin_phone:{
    type:String,
    unique:true,
    required:true,
    min:9,
    max:20
  },
  admin_dob:{
    type:Date,
    required:true,
  },
  admin_password:{
    type:String,
    required:true,
  },
  admin_gender:{
    type:String,
    required:true,
    enum:['Male', 'Female']
  },
  admin_is_verified:{
    type:Boolean,
    default:false
  },
  admin_address:{
    type:String
  },
  role:{
    type:String,
    enum:['admin'],
    default:'admin'
  },
  admin_photo:{
    type:String,
  }
}, {
  timestamps:true
});

// Save the encrypted password if its changed
adminSchema.pre('save', async function(next){
  if(!this.isModified('admin_password')) return next();
  try{
    const salt = await bcrypt.genSalt(10);
    this.admin_password = await bcrypt.hash(this.admin_password, salt);
    next();
  } catch(error) {
    next(error);
  }
}); 


// Check if the password is correct
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try{
    return await bcrypt.compare(candidatePassword, this.admin_password);
  } catch(error){
    throw error
  }
}

// generate a jwt token for the user
adminSchema.methods.jwtToken = function() {
  const token = jwt.sign({
      id:this._id,
      email:this.admin_email,
      role:'admin'
    },
    process.env.JWT_SECRET,
    {
      expiresIn:process.env.JWT_EXPIRES_IN || '7d',
      issuer:'BIteNow',
      audience:'BiteNow-admin'
    }
  )

  return token;
}

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;