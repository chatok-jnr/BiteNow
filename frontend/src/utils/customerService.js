import axiosInstance from "./axios";

/**
 * Get customer profile by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise} Customer profile data
 */
export const getCustomerProfile = async (customerId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update customer profile data (without image)
 * @param {string} customerId - Customer ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} Updated customer data
 */
export const updateCustomerProfile = async (customerId, profileData) => {
  try {
    // Capitalize gender to match backend enum (Male, Female, Other)
    const capitalizeGender = (gender) => {
      if (!gender) return gender;
      return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    };

    const response = await axiosInstance.patch(
      `/api/v1/customer/${customerId}`,
      {
        customer_name: profileData.name,
        customer_phone: profileData.phone,
        customer_birth_date: profileData.birthDate,
        customer_gender: capitalizeGender(profileData.gender),
        customer_address: profileData.address,
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload customer profile image
 * @param {string} customerId - Customer ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} Upload response
 */
export const uploadCustomerImage = async (customerId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axiosInstance.post(
      `/api/v1/customer/${customerId}/image`,
      formData,
      // Don't set Content-Type header - axios will automatically set it with the correct boundary
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update customer profile image
 * @param {string} customerId - Customer ID
 * @param {File} imageFile - New image file
 * @returns {Promise} Update response
 */
export const updateCustomerImage = async (customerId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axiosInstance.patch(
      `/api/v1/customer/${customerId}/image`,
      formData,
      // Don't set Content-Type header - axios will automatically set it with the correct boundary
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete customer profile image
 * @param {string} customerId - Customer ID
 * @returns {Promise} Delete response
 */
export const deleteCustomerImage = async (customerId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/customer/${customerId}/image`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all saved addresses for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise} List of addresses
 */
export const getCustomerAddresses = async (customerId) => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/customer/${customerId}/addresses`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add a new address for a customer
 * @param {string} customerId - Customer ID
 * @param {Object} addressData - Address data
 * @returns {Promise} Created address
 */
export const addCustomerAddress = async (customerId, addressData) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/customer/${customerId}/addresses`,
      addressData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a saved address
 * @param {string} customerId - Customer ID
 * @param {string} addressId - Address ID
 * @param {Object} addressData - Updated address data
 * @returns {Promise} Updated address
 */
export const updateCustomerAddress = async (
  customerId,
  addressId,
  addressData,
) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/customer/${customerId}/addresses/${addressId}`,
      addressData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a saved address
 * @param {string} customerId - Customer ID
 * @param {string} addressId - Address ID
 * @returns {Promise} Delete response
 */
export const deleteCustomerAddress = async (customerId, addressId) => {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/customer/${customerId}/addresses/${addressId}`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Set an address as default
 * @param {string} customerId - Customer ID
 * @param {string} addressId - Address ID
 * @returns {Promise} Update response
 */
export const setDefaultAddress = async (customerId, addressId) => {
  try {
    const response = await axiosInstance.patch(
      `/api/v1/customer/${customerId}/addresses/${addressId}/default`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getCustomerProfile,
  updateCustomerProfile,
  uploadCustomerImage,
  updateCustomerImage,
  deleteCustomerImage,
  getCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
};
