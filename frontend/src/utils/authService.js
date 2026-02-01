import axiosInstance from "./axios";

/**
 * Auth Service - Handles authentication API calls
 */

/**
 * Register a new customer
 * @param {Object} customerData - Customer registration data
 * @returns {Promise} Registration response
 */
export const registerCustomer = async (customerData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/register/customer",
      customerData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Login customer
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Login response with token
 */
export const loginCustomer = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/login/customer",
      credentials
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Register a new rider
 * @param {Object} riderData - Rider registration data
 * @returns {Promise} Registration response
 */
export const registerRider = async (riderData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/register/rider",
      riderData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Login rider
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Login response with token
 */
export const loginRider = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/login/rider",
      credentials
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Register a new restaurant owner
 * @param {Object} ownerData - Restaurant owner registration data
 * @returns {Promise} Registration response
 */
export const registerRestaurantOwner = async (ownerData) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/register/restaurant-owner",
      ownerData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Login restaurant owner
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Login response with token
 */
export const loginRestaurantOwner = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/login/restaurant-owner",
      credentials
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Login admin
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Login response with token
 */
export const loginAdmin = async (credentials) => {
  try {
    const response = await axiosInstance.post(
      "/api/v1/auth/login/admin",
      credentials
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Change password (for authenticated users)
 * @param {Object} passwordData - Current and new password
 * @returns {Promise} Response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.patch(
      "/api/v1/auth/change-password",
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Logout user (clear local data)
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("guest_session_id");
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Save user data and token to localStorage
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const saveAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export default {
  registerCustomer,
  loginCustomer,
  registerRider,
  loginRider,
  registerRestaurantOwner,
  loginRestaurantOwner,
  loginAdmin,
  changePassword,
  logout,
  isAuthenticated,
  getCurrentUser,
  saveAuthData,
};
