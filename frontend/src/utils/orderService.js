import axiosInstance from "./axios";

/**
 * Order Service - Handles order-related API calls
 */

/**
 * Get all orders for the authenticated user
 * @returns {Promise} User's orders
 */
export const getUserOrders = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/orders/");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Order details
 */
export const getOrder = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise} Created order
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post("/api/v1/orders/", orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/orders/${orderId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @returns {Promise} Cancelled order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/orders/${orderId}/cancel`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get orders by restaurant (for restaurant owners)
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise} Restaurant orders
 */
export const getOrdersByRestaurant = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/orders/restaurant/${restaurantId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update order status by restaurant
 * @param {string} orderId - Order ID
 * @param {string} order_status - New status
 * @returns {Promise} Updated order
 */
export const updateOrderStatusByRestaurant = async (orderId, order_status) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/orders/restaurant/${orderId}`,
      { order_status }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify rider PIN for order (restaurant owner)
 * @param {string} order_id - Order ID
 * @param {string} rider_otp - 4-digit rider PIN
 * @returns {Promise} Updated order
 */
export const verifyRiderPin = async (order_id, rider_otp) => {
  try {
    const response = await axiosInstance.patch(
      "/api/v1/orders/restaurant/verify-rider",
      { order_id, rider_otp }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get available orders for riders to pick up
 * @returns {Promise} Available orders
 */
export const getLookForRider = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/orders/rider");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get rider's assigned orders
 * @returns {Promise} Rider's orders
 */
export const getMyOrderList = async () => {
  try {
    const response = await axiosInstance.get("/api/v1/orders/rider/my-order");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark rider as available to deliver order
 * @param {string} orderId - Order ID
 * @returns {Promise} Updated order
 */
export const availableToDeliver = async (orderId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/orders/rider/${orderId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify customer (rider confirms delivery)
 * @param {string} orderId - Order ID
 * @param {string} verificationCode - Customer verification code
 * @returns {Promise} Updated order
 */
export const verifyCustomer = async (orderId, verificationCode) => {
  try {
    const response = await axiosInstance.patch(
      "/api/v1/orders/rider/verify-customer",
      { orderId, verificationCode }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrdersByRestaurant,
  updateOrderStatusByRestaurant,
  verifyRiderPin,
  getLookForRider,
  getMyOrderList,
  availableToDeliver,
  verifyCustomer,
};
