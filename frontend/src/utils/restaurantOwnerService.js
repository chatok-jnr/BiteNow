import axios from "./axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Get restaurant owner by ID
 */
export const getRestaurantOwner = async (ownerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update restaurant owner details (text fields only)
 */
export const updateRestaurantOwner = async (ownerId, ownerData) => {
  try {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}/api/v1/restaurant-owner/update/${ownerId}`;

    console.log("Update Restaurant Owner Service:");
    console.log("- URL:", url);
    console.log("- Owner ID:", ownerId);
    console.log("- Data:", ownerData);
    console.log("- Token:", token ? "Present" : "Missing");

    const response = await axios.patch(url, ownerData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update Restaurant Owner Service Error:");
    console.error("- Error:", error);
    console.error("- Response:", error.response);
    console.error("- Status:", error.response?.status);
    console.error("- Data:", error.response?.data);
    throw error.response?.data || error;
  }
};

/**
 * Upload restaurant owner profile image
 */
export const uploadOwnerImage = async (ownerId, imageFile) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update restaurant owner profile image
 */
export const updateOwnerImage = async (ownerId, imageFile) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete restaurant owner profile image
 */
export const deleteOwnerImage = async (ownerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/image`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload restaurant owner documents (PDFs)
 * @param {string} ownerId - The owner ID
 * @param {File[]} pdfFiles - Array of PDF files (max 5)
 */
export const uploadOwnerDocuments = async (ownerId, pdfFiles) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Append multiple files with the field name 'docs'
    pdfFiles.forEach((file) => {
      formData.append("docs", file);
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/docs`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete all restaurant owner documents
 */
export const deleteAllOwnerDocuments = async (ownerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/docs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a single restaurant owner document
 */
export const deleteOwnerDocument = async (ownerId, docId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurant-owner/${ownerId}/doc/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete restaurant owner account
 */
export const deleteRestaurantOwner = async (ownerId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurant-owner/delete/${ownerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
