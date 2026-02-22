const Customer = require("./../models/customerModel");
const {
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
} = require("./../utils/cloudinary");

//Get My personal Data
exports.getMe = async (req, res) => {
  try {
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
      photo: customer.customer_image,
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
      return res.status(403).json({
        status: "success",
        message: "You are not authorized to perfom this operation",
      });
    }

    const upd = await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Your Data Updated Successfully",
      upd,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
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
      oldPublicId,
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

//Address Management

//Get all addresses for a customer
exports.getAddresses = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to access these addresses",
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: "Customer not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        addresses: customer.saved_addresses || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

//Add a new address
exports.addAddress = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to add addresses for this customer",
      });
    }

    const { label, address, latitude, longitude } = req.body;

    if (!label || !address || !latitude || !longitude) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide label, address, latitude, and longitude",
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: "Customer not found",
      });
    }

    // If this is the first address, make it default
    const isFirstAddress =
      !customer.saved_addresses || customer.saved_addresses.length === 0;

    const newAddress = {
      label,
      address,
      latitude,
      longitude,
      isDefault: isFirstAddress,
    };

    customer.saved_addresses.push(newAddress);
    await customer.save();

    res.status(201).json({
      status: "success",
      message: "Address added successfully",
      data: {
        address: customer.saved_addresses[customer.saved_addresses.length - 1],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

//Update an address
exports.updateAddress = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to update this address",
      });
    }

    const { addressId } = req.params;
    const { label, address, latitude, longitude } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: "Customer not found",
      });
    }

    const addressIndex = customer.saved_addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        status: "failed",
        message: "Address not found",
      });
    }

    // Update address fields
    if (label) customer.saved_addresses[addressIndex].label = label;
    if (address) customer.saved_addresses[addressIndex].address = address;
    if (latitude) customer.saved_addresses[addressIndex].latitude = latitude;
    if (longitude) customer.saved_addresses[addressIndex].longitude = longitude;

    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      data: {
        address: customer.saved_addresses[addressIndex],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

//Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to delete this address",
      });
    }

    const { addressId } = req.params;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: "Customer not found",
      });
    }

    const addressIndex = customer.saved_addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        status: "failed",
        message: "Address not found",
      });
    }

    const wasDefault = customer.saved_addresses[addressIndex].isDefault;

    customer.saved_addresses.splice(addressIndex, 1);

    // If deleted address was default and there are other addresses, make the first one default
    if (wasDefault && customer.saved_addresses.length > 0) {
      customer.saved_addresses[0].isDefault = true;
    }

    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Address deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

//Set an address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const areYouMe = req.user._id.toString() === req.params.id.toString();
    if (!areYouMe) {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to modify this address",
      });
    }

    const { addressId } = req.params;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        status: "failed",
        message: "Customer not found",
      });
    }

    const addressIndex = customer.saved_addresses.findIndex(
      (addr) => addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        status: "failed",
        message: "Address not found",
      });
    }

    // Set all addresses to not default
    customer.saved_addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set the selected address as default
    customer.saved_addresses[addressIndex].isDefault = true;

    await customer.save();

    res.status(200).json({
      status: "success",
      message: "Default address updated successfully",
      data: {
        address: customer.saved_addresses[addressIndex],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
