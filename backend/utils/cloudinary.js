const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//config multer storage for rider, restaurant, restaurant owner, customer
const createStorage = (folderName, prefix) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `bitenow/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 800, crop: "limit" }],
      public_id: (req, file) => {
        return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      },
    },
  });
};
//create storage
const restaurantStorage = createStorage("restaurant", "restaurant");
const restaurantOwnerStorage = createStorage("restaurant-owner", "owner");
const riderStorage = createStorage("rider", "rider");
const customerStorage = createStorage("customer", "customer");

//Create uploader for rider, restaurant, restaurant owner, customer
const createUpload = (storage) => {
  return multer({
    storage,
    limits: {
      filesize: 5 * 1024 * 1024, //5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"), false);
      }
    },
  });
};
//create uploader
const restaurantUploader = createUpload(restaurantStorage);
const restaurantOwnerUploader = createUpload(restaurantOwnerStorage);
const riderUploader = createUpload(riderStorage);
const customerUploader = createUpload(customerStorage);

//helper function for reusable
//for image upload
const imageUploadHelper = (file, entityName) => {
  return {
    url: file.path,
    altText: `${entityName} - Profile Picture`,
    public_id: file.filename,
  };
};

//for image delete
const imageDeleteHelper = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      throw err;
    }
  }
};

//for update image
const imageUpdationHelper = async (newFile, entityName, oldPublic_id) => {
  //delete old image
  await imageDeleteHelper(oldPublic_id);

  //add new image
  return imageUploadHelper(newFile, entityName);
};

module.exports = {
  cloudinary,
  restaurantUploader,
  restaurantOwnerUploader,
  riderUploader,
  customerUploader,
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
};
