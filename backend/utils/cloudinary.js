const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//config multer image storage for rider, restaurant, restaurant owner, customer
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
//create image storage
const restaurantStorage = createStorage("restaurant", "restaurant");
const restaurantOwnerStorage = createStorage("restaurant-owner", "owner");
const riderStorage = createStorage("rider", "rider");
const customerStorage = createStorage("customer", "customer");
const foodStorage = createStorage("food", "food");

//Create image uploader for rider, restaurant, restaurant owner, customer
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
//create image uploader
const restaurantUploader = createUpload(restaurantStorage);
const restaurantOwnerUploader = createUpload(restaurantOwnerStorage);
const riderUploader = createUpload(riderStorage);
const customerUploader = createUpload(customerStorage);
const foodUploader = createUpload(foodStorage);

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

//config multer document storage for rider, restaurant owner
const createDocStorage = (folderName, prefix) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `bitenow/${folderName}`,
      allowed_formats: "pdf",
      resource_type: "raw",
      public_id: (req, file) => {
        return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      },
    },
  });
};

//create document storage
const restaurantOwnerDocStorage = createDocStorage(
  "restaurant-owner-documents",
  "owner-doc"
);
const riderDocStorage = createDocStorage("rider-documents", "rider-doc");

//Create document uploader for rider, restaurant owner
const createDocUpload = (storage) => {
  return multer({
    storage,
    limits: {
      filesize: 10 * 1024 * 1024, //10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
      } else {
        cb(new Error("Only pdf files are allowed!"), false);
      }
    },
  });
};
//create document uploader
const restaurantOwnerDocUploader = createDocUpload(restaurantOwnerDocStorage);
const riderDocUploader = createDocUpload(riderDocStorage);

//helper function for documents
//for document upload
const docUploadHelper = (files, entityName) => {
  return files.map((file) => ({
    url: file.path,
    altText: `${entityName} - Document`,
    public_id: file.filename,
  }));
};

//for delete document
const docDeleteHelper = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    } catch (err) {
      throw err;
    }
  }
};
//for multiple documents delete
const docsDeleteHelper = async (publicIds) => {
  if (publicIds && publicIds.length > 0) {
    try {
      await Promise.all(
        publicIds.map((id) =>
          cloudinary.uploader.destroy(id, { resource_type: "raw" })
        )
      );
    } catch (err) {
      throw err;
    }
  }
};

module.exports = {
  cloudinary,
  restaurantUploader,
  restaurantOwnerUploader,
  riderUploader,
  foodUploader,
  customerUploader,
  riderDocUploader,
  restaurantOwnerDocUploader,
  imageUploadHelper,
  imageDeleteHelper,
  imageUpdationHelper,
  docUploadHelper,
  docDeleteHelper,
  docsDeleteHelper,
};
