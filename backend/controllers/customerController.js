const Customer = require('./../models/customerModel');

//Get My personal Data
exports.getMe = async (req, res) => {
  try{

    console.log(`My first Cookiue = ${req.cookie}`);

    const areYouMe = (req.user._id.toString() === req.params.id.toString());
    if(!areYouMe) {
      return res.status(403).json({
        status:'failed',
        message:'You are not authorized to see this data'
      });
    }

    const customer = await Customer.findById(req.params.id);
    
    const userRespone = {
      id:req.params.id,
      name: customer.customer_name,
      email: customer.customer_email,
      phone: customer.customer_phone,
      dob: customer.customer_birth_date,
      gender:customer.customer_gender,
      status:customer.customer_status,
      address:customer.customer_address,
      photo: customer.customer_photo,
      createdAt:customer.createdAt,
      updatedAt:customer.updatedAt,
    };

    res.status(200).json({
      status:'success',
      data:{
        userRespone
      }
    })
  } catch(err) {
    res.status(400).json({
      status:'failed',
      message:err.message
    });
  }
}

//Update My Data
exports.updMyData = async (req, res) => {
  try {
    const areYouMe = (req.user._id.toString() === req.params.id.toString());
    if(!areYouMe) {
      return res.stataus(403).json({
        status:'success',
        message:'You are not authorized to perfom this operation'
      });
    }

    const upd = await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.stataus(200).json({
      status:'succes',
      message:'Your Data Updated Successfully',
      upd
    });
  } catch(err) {
    res.status(400).json({
      stataus:'failed',
      message:err.message
    });
  }
}