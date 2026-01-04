import axiosInstance from "./axios";

/**
 * Rider Service - API calls for rider profile management
 */

// Get rider profile by ID (Protected)
export const getRiderById = async (riderId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/riders/${riderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rider profile:", error);
    throw error;
  }
};

// Update rider basic information (Protected)
export const updateRider = async (riderId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/riders/${riderId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating rider:", error);
    throw error;
  }
};

// Upload rider profile image (Protected)
export const uploadRiderImage = async (riderId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axiosInstance.post(
      `/api/v1/riders/${riderId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading rider image:", error);
    throw error;
  }
};

// Update rider profile image (Protected)
export const updateRiderImage = async (riderId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axiosInstance.patch(
      `/api/v1/riders/${riderId}/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating rider image:", error);
    throw error;
  }
};

// Delete rider profile image (Protected)
export const deleteRiderImage = async (riderId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/riders/${riderId}/image`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting rider image:", error);
    throw error;
  }
};

// Upload rider documents (Protected) - Max 5 PDFs
export const uploadRiderDocuments = async (riderId, documentFiles) => {
  try {
    const formData = new FormData();

    // Append multiple documents
    for (let i = 0; i < documentFiles.length; i++) {
      formData.append("docs", documentFiles[i]);
    }

    const response = await axiosInstance.post(
      `/api/v1/riders/${riderId}/docs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading rider documents:", error);
    throw error;
  }
};

// Delete all rider documents (Protected)
export const deleteAllRiderDocuments = async (riderId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/riders/${riderId}/docs`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting all rider documents:", error);
    throw error;
  }
};

// Delete single rider document (Protected)
export const deleteRiderDocument = async (riderId, docId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/riders/${riderId}/doc/${docId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting rider document:", error);
    throw error;
  }
};

// Delete rider account (Protected)
export const deleteRider = async (riderId) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/riders/${riderId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting rider:", error);
    throw error;
  }
};

export default {
  getRiderById,
  updateRider,
  uploadRiderImage,
  updateRiderImage,
  deleteRiderImage,
  uploadRiderDocuments,
  deleteAllRiderDocuments,
  deleteRiderDocument,
  deleteRider,
};
