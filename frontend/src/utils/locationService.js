import axiosInstance from "./axios";

/**
 * Location Service - API calls for location and routing
 */

// Update rider/customer current location
export const updateLocation = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.post(`/api/v1/location/update`, {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

// Get nearby restaurants for customer
export const getNearbyRestaurants = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/location/nearby-restaurants`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error);
    throw error;
  }
};

// Get nearby orders for rider
export const getNearbyOrders = async () => {
  try {
    const response = await axiosInstance.get(`/api/v1/location/nearby-orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby orders:", error);
    throw error;
  }
};

// Get delivery route for order
export const getDeliveryRoute = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/location/delivery-route/${orderId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching delivery route:", error);
    throw error;
  }
};

// Track rider location for specific order
export const trackRider = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/location/track-rider/${orderId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error tracking rider:", error);
    throw error;
  }
};
