const Customer = require("./../models/customerModel");
const {
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
} = require("./../utils/cloudinary");

//Get My personal Data
exports.getMe = async (req, res) => {
  try {
    console.log(`My first Cookiue = ${req.cookie}`);

    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to see this data",
      });
    }

    const customer = await Customer.findById(req.params.id);

    const userRespone = {
      id: req.params.id,
      name: customer.customer_name,
      email: customer.customer_email,
      phone: customer.customer_phone,
      dob: customer.customer_birth_date,
      gender: customer.customer_gender,
      status: customer.customer_status,
      address: customer.customer_address,
      photo: customer.customer_photo,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    res.status(200).json({
      status: "success",
      data: {
        userRespone,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err.message,
    });
  }
};

//Update My Data
exports.updMyData = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.stataus(403).json({
        status: "success",
        message: "You are not authorized to perfom this operation",
      });
    }

    const upd = await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.stataus(200).json({
      status: "succes",
      message: "Your Data Updated Successfully",
      upd,
    });
  } catch (err) {
    res.status(400).json({
      stataus: "failed",
      message: err.message,
    });
  }
};

//image
//add profile picture
exports.uploadCustomerImage = async (req, res) => {
  try {
    const customerId = req.params.id;
    const userId = req.user._id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found!",
      });
    }
    if (customer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to upload profile picture for this customer",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    const newImage = imageUploadHelper(req.file, customer.customer_name);

    //upload new image
    customer.customer_image = newImage;
    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture uploaded successfully",
      data: {
        images: newImage,
      },
    });
  } catch (err) {
    if (req.file) {
      await imageDeleteHelper(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to upload profile picture",
      error: err.message,
    });
  }
};
//delete customer profile picture
exports.deleteCustomerImage = async (req, res) => {
  try {
    const customerId = req.params.id;
    const userId = req.user._id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found!",
      });
    }

    if (customer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to delete profile picture from this customer",
      });
    }

    // Check if images array exists
    if (!customer.customer_image || !customer.customer_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No display picture found for this customer",
      });
    }

    //delete image from cloudinary
    await imageDeleteHelper(customer.customer_image.public_id);
    //remove from database
    customer.customer_image = undefined;

    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete profile picture",
      error: err.message,
    });
  }
};
//update customer profile picture
exports.updateCustomerImage = async (req, res) => {
  try {
    const customerId = req.params.id;
    const userId = req.user._id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found!",
      });
    }

    if (customer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to update profile picture for this customer",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Please upload an image",
      });
    }

    if (!customer.customer_image || !customer.customer_image.public_id) {
      return res.status(400).json({
        status: "error",
        message: "No existing profile picture to update. Use upload instead.",
      });
    }

    const oldPublicId = customer.customer_image.public_id;

    //update the image
    const newImage = await imageUpdationHelper(
      req.file,
      customer.customer_name,
      oldPublicId
    );

    //save image
    customer.customer_image = newImage;
    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Profile picture updated successfully",
      data: {
        image: customer.customer_image,
      },
    });
  } catch (err) {
    if (req.file) {
      await imageDeleteHelper(req.file.filename);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to update profile picture",
      error: err.message,
    });
  }
};
