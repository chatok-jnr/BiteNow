import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Guest session key
const GUEST_SESSION_KEY = 'guest_session_id';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token or guest session ID to headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Debug: Log what we're checking
    console.log('🔍 Axios Interceptor Check:', {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 20)}...` : 'null',
      url: config.url
    });
    
    // If token exists AND is not empty/null, add it to request headers
    if (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Using JWT Token');
    } else {
      // Remove any existing Authorization header
      delete config.headers.Authorization;
      
      // If no valid token (guest user), add guest session ID
      let guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);
      
      // Create guest session if it doesn't exist
      if (!guestSessionId) {
        guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(GUEST_SESSION_KEY, guestSessionId);
        console.log('🆕 Created new guest session:', guestSessionId);
      } else {
        console.log('🔑 Using existing guest session:', guestSessionId);
      }
      
      config.headers['x-guest-session-id'] = guestSessionId;
      console.log('✅ Using Guest Session ID');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid or expired, redirect to login
    if (error.response && error.response.status === 401) {
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL };
