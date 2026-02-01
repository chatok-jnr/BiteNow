import axios from "./axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Get all restaurants (public endpoint for customers)
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} List of restaurants
 */
export const getAllRestaurants = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/restaurants/`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

/**
 * Get a single restaurant by ID (public endpoint)
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Restaurant data
 */
export const getRestaurantById = async (restaurantId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};

/**
 * Get all restaurants for the logged-in owner
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} List of restaurants
 */
export const getMyRestaurants = async (params = {}) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/restaurants/my/list`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

/**
 * Get owner's restaurant by ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Restaurant data
 */
export const getMyRestaurantById = async (restaurantId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/restaurants/my/${restaurantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};

/**
 * Update restaurant details (with or without image)
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} updateData - Data to update
 * @param {File} [imageFile] - Optional image file
 * @returns {Promise<Object>} Updated restaurant data
 */
export const updateRestaurant = async (
  restaurantId,
  updateData,
  imageFile = null
) => {
  try {
    const token = localStorage.getItem("token");

    // If there's an image, update it separately first
    if (imageFile) {
      await updateRestaurantImage(restaurantId, imageFile);
    }

    // Update restaurant details
    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

/**
 * Upload or update restaurant image
 * @param {string} restaurantId - Restaurant ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Response with image data
 */
export const updateRestaurantImage = async (restaurantId, imageFile) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.patch(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/image`,
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
    console.error("Error updating restaurant image:", error);
    throw error;
  }
};

/**
 * Upload restaurant image (initial upload)
 * @param {string} restaurantId - Restaurant ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Response with image data
 */
export const uploadRestaurantImage = async (restaurantId, imageFile) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/image`,
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
    console.error("Error uploading restaurant image:", error);
    throw error;
  }
};

/**
 * Delete restaurant image
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Response data
 */
export const deleteRestaurantImage = async (restaurantId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/image`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting restaurant image:", error);
    throw error;
  }
};

/**
 * Delete restaurant
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Response data
 */
export const deleteRestaurant = async (restaurantId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/restaurants/${restaurantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
};

/**
 * Create a new restaurant
 * @param {Object} restaurantData - Restaurant data
 * @returns {Promise<Object>} Created restaurant data
 */
export const createRestaurant = async (restaurantData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/restaurants/register`,
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating restaurant:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error.response?.data || error;
  }
};

export default {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  getMyRestaurantById,
  updateRestaurant,
  updateRestaurantImage,
  uploadRestaurantImage,
  deleteRestaurantImage,
  deleteRestaurant,
  createRestaurant,
};
