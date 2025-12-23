import axiosInstance from './axios';

// Guest Session Management
const GUEST_SESSION_KEY = 'guest_session_id';

/**
 * Get or create guest session ID
 * @returns {string} Guest session ID
 */
export const getGuestSessionId = () => {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Clear guest session ID (call after login/signup)
 */
export const clearGuestSession = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Cart API Functions

/**
 * Get or create cart for a restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {Promise<Object>} Cart data
 */
export const getOrCreateCart = async (restaurantId) => {
  try {
    const response = await axiosInstance.post('/api/v1/cart/', {
      restaurant_id: restaurantId
    });
    
    return response.data.data.cart;
  } catch (error) {
    console.error('Error creating/getting cart:', error);
    throw error;
  }
};

/**
 * Get active cart
 * @returns {Promise<Object|null>} Cart data or null if no cart exists
 */
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/cart/');
    return response.data.data.cart;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // No cart found - this is normal
      return null;
    }
    console.error('Error fetching cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} foodId - The food item ID
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<Object>} Updated cart data
 */
export const addToCart = async (foodId, quantity = 1) => {
  try {
    const response = await axiosInstance.post('/api/v1/cart/add', {
      food_id: foodId,
      quantity: quantity
    });
    
    return response.data.data.cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} foodId - The food item ID
 * @param {number|string} quantity - Quantity to remove or 'all' to remove completely
 * @returns {Promise<Object>} Updated cart data
 */
export const removeFromCart = async (foodId, quantity = 'all') => {
  try {
    const response = await axiosInstance.post('/api/v1/cart/remove', {
      food_id: foodId,
      quantity: quantity
    });
    
    return response.data.data.cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart - Deletes the cart completely
 * @returns {Promise<Object>} Delete result with deletedCount
 */
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/api/v1/cart/');
    console.log('✅ Cart deleted:', response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // No cart to delete - this is fine
      console.log('ℹ️ No cart to delete');
      return { deletedCount: 0 };
    }
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Migrate guest cart to user account after login/signup
 * @returns {Promise<Object|null>} Migrated cart or null
 */
export const migrateGuestCart = async () => {
  try {
    const guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);
    
    if (!guestSessionId) {
      return null; // No guest session to migrate
    }
    
    const response = await axiosInstance.post('/api/v1/cart/migrate', {
      guest_session_id: guestSessionId
    });
    
    // Clear guest session after successful migration
    clearGuestSession();
    
    return response.data.data.cart;
  } catch (error) {
    console.error('Error migrating cart:', error);
    // Don't throw - migration failure shouldn't block login
    clearGuestSession(); // Clear guest session anyway
    return null;
  }
};

/**
 * Calculate cart totals from cart items
 * @param {Array} items - Cart items array
 * @param {number} deliveryCharge - Delivery charge
 * @returns {Object} Totals object with subtotal and total
 */
export const calculateCartTotals = (items = [], deliveryCharge = 50) => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal + deliveryCharge;
  
  return {
    subtotal,
    deliveryCharge,
    total
  };
};

/**
 * Transform backend cart item to frontend format
 * @param {Object} cartItem - Backend cart item
 * @param {Object} foodData - Food item data
 * @returns {Object} Frontend cart item
 */
export const transformCartItem = (cartItem, foodData) => {
  return {
    id: cartItem.food_id,
    cartItemId: cartItem._id,
    name: foodData?.food_name || 'Unknown Item',
    quantity: cartItem.quantity,
    price: cartItem.price_at_time,
    discount: cartItem.discount_at_time,
    totalPrice: cartItem.total_price,
    image: foodData?.food_image?.url || null
  };
};

export default {
  getGuestSessionId,
  clearGuestSession,
  isAuthenticated,
  getOrCreateCart,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  migrateGuestCart,
  calculateCartTotals,
  transformCartItem
};
