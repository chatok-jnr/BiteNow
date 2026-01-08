import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance for food API
const foodApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/food`,
});

// Request interceptor to add JWT token
foodApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (
      token &&
      token.trim() !== "" &&
      token !== "null" &&
      token !== "undefined"
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
foodApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    console.error("Food API Error:", message);
    return Promise.reject(error);
  }
);

/**
 * Food Service - API functions for food management
 */
const foodService = {
  /**
   * Get all food items
   * @param {Object} params - Query parameters (page, limit, sort, fields, etc.)
   * @returns {Promise} - Response with foods array
   */
  getAllFoods: async (params = {}) => {
    const response = await foodApi.get("/", { params });
    return response.data;
  },

  /**
   * Get a single food item by ID
   * @param {string} foodId - The food item ID
   * @returns {Promise} - Response with food object
   */
  getFood: async (foodId) => {
    const response = await foodApi.get(`/${foodId}`);
    return response.data;
  },

  /**
   * Get food items by restaurant ID
   * @param {string} restaurantId - The restaurant ID
   * @returns {Promise} - Response with foods array
   */
  getFoodsByRestaurant: async (restaurantId) => {
    const response = await foodApi.get(`/restaurant/${restaurantId}`);
    return response.data;
  },

  /**
   * Get discounted food items
   * @returns {Promise} - Response with discounted foods array
   */
  getDiscountedFoods: async () => {
    const response = await foodApi.get("/discounted");
    return response.data;
  },

  /**
   * Get food items by price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {Promise} - Response with foods array
   */
  getFoodsByPriceRange: async (minPrice, maxPrice) => {
    const response = await foodApi.get("/price", {
      data: { minPrice, maxPrice },
    });
    return response.data;
  },

  /**
   * Create a new food item
   * @param {Object} foodData - Food data object
   * @param {string} foodData.restaurant_id - Restaurant ID
   * @param {string} foodData.food_name - Food name
   * @param {string} foodData.food_description - Food description
   * @param {number} foodData.food_price - Food price
   * @param {number} foodData.food_quantity - Food quantity
   * @param {number} foodData.discount_percentage - Discount percentage (0-100)
   * @param {string[]} foodData.tags - Tags array
   * @returns {Promise} - Response with created food object
   */
  createFood: async (foodData) => {
    const response = await foodApi.post("/", foodData);
    return response.data;
  },

  /**
   * Update a food item
   * @param {string} foodId - The food item ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} - Response with updated food object
   */
  updateFood: async (foodId, updateData) => {
    const response = await foodApi.patch(`/${foodId}`, updateData);
    return response.data;
  },

  /**
   * Delete a food item
   * @param {string} foodId - The food item ID
   * @returns {Promise} - Response (204 No Content on success)
   */
  deleteFood: async (foodId) => {
    const response = await foodApi.delete(`/${foodId}`);
    // 204 No Content response has no data body
    return response.status === 204 ? { status: "success" } : response.data;
  },

  /**
   * Restock a food item
   * @param {string} foodId - The food item ID
   * @param {number} quantity - Quantity to add to stock
   * @returns {Promise} - Response with new stock quantity
   */
  restockFood: async (foodId, quantity) => {
    const response = await foodApi.patch(`/${foodId}/restock`, { quantity });
    return response.data;
  },

  /**
   * Upload food image (for food items without an image)
   * Uses FormData with 'image' field matching Multer configuration
   * @param {string} foodId - The food item ID
   * @param {File} imageFile - The image file to upload
   * @returns {Promise} - Response with uploaded image data
   */
  uploadFoodImage: async (foodId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile); // 'image' matches Multer field name

    const response = await foodApi.post(`/${foodId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update food image (replaces existing image)
   * Deletes old Cloudinary image using public_id, then uploads new one
   * Uses FormData with 'image' field matching Multer configuration
   * @param {string} foodId - The food item ID
   * @param {File} imageFile - The new image file to upload
   * @returns {Promise} - Response with updated image data
   */
  updateFoodImage: async (foodId, imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile); // 'image' matches Multer field name

    const response = await foodApi.patch(`/${foodId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete food image
   * Removes image from Cloudinary and clears food_image field in database
   * @param {string} foodId - The food item ID
   * @returns {Promise} - Response confirming deletion
   */
  deleteFoodImage: async (foodId) => {
    const response = await foodApi.delete(`/${foodId}/image`);
    return response.data;
  },

  /**
   * Toggle food availability
   * @param {string} foodId - The food item ID
   * @param {boolean} isAvailable - New availability status
   * @returns {Promise} - Response with updated food object
   */
  toggleAvailability: async (foodId, isAvailable) => {
    const response = await foodApi.patch(`/${foodId}`, {
      is_available: isAvailable,
    });
    return response.data;
  },

  /**
   * Upload or update food image based on whether image already exists
   * @param {string} foodId - The food item ID
   * @param {File} imageFile - The image file to upload
   * @param {boolean} hasExistingImage - Whether the food already has an image
   * @returns {Promise} - Response with image data
   */
  uploadOrUpdateImage: async (foodId, imageFile, hasExistingImage) => {
    if (hasExistingImage) {
      return foodService.updateFoodImage(foodId, imageFile);
    }
    return foodService.uploadFoodImage(foodId, imageFile);
  },
};

export default foodService;

// Named exports for convenience
export const {
  getAllFoods,
  getFood,
  getFoodsByRestaurant,
  getDiscountedFoods,
  getFoodsByPriceRange,
  createFood,
  updateFood,
  deleteFood,
  restockFood,
  uploadFoodImage,
  updateFoodImage,
  deleteFoodImage,
  toggleAvailability,
  uploadOrUpdateImage,
} = foodService;
