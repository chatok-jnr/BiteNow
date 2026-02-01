// API Utils - Helper functions and constants
export { default as axiosInstance, API_BASE_URL } from './axios';

// Service exports
export * as authService from './authService';
export * as cartService from './cartService';
export * as customerService from './customerService';
export * as foodService from './foodService';
export * as orderService from './orderService';
export * as restaurantService from './restaurantService';
export * as restaurantOwnerService from './restaurantOwnerService';
export * as riderService from './riderService';

// Re-export default instances
export { default as auth } from './authService';
export { default as cart } from './cartService';
export { default as customer } from './customerService';
export { default as food } from './foodService';
export { default as order } from './orderService';
export { default as restaurant } from './restaurantService';
export { default as restaurantOwner } from './restaurantOwnerService';
export { default as rider } from './riderService';
