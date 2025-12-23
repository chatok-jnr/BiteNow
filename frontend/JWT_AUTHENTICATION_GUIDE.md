# JWT Token Authentication Implementation

## Overview
This implementation ensures that JWT tokens are automatically included in all API requests and persisted across page navigation.

## What Was Implemented

### 1. Axios Instance with JWT Interceptor (`src/utils/axios.js`)
- Created a configured axios instance that automatically:
  - Adds JWT token to Authorization header for all requests
  - Handles token expiration (401 errors) by redirecting to login
  - Stores and retrieves token from localStorage

### 2. Protected Routes (`src/components/PrivateRoute.jsx`)
- Created a wrapper component that:
  - Checks if user is authenticated (has valid token)
  - Enforces role-based access control
  - Redirects to login if not authenticated
  - Stores intended destination for post-login redirect

### 3. Updated Files

#### Authentication Pages
- `src/pages/common/Login.jsx` - Uses axiosInstance
- `src/pages/common/Signup.jsx` - Uses axiosInstance
- `src/pages/common/Otp.jsx` - Uses axiosInstance

#### App Router
- `src/App.jsx` - Wrapped protected routes with PrivateRoute component

## How It Works

### Token Storage
When a user logs in successfully:
```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(userData));
```

### Automatic Token Attachment
Every API request automatically includes the token:
```javascript
// Request interceptor adds token
config.headers.Authorization = `Bearer ${token}`;
```

### Protected Routes
Routes are protected by role:
```jsx
<Route 
  path="/customer-dashboard" 
  element={
    <PrivateRoute allowedRoles={['customer']}>
      <CustomerDashboard />
    </PrivateRoute>
  } 
/>
```

### Token Expiration Handling
If a 401 error occurs (token expired/invalid):
1. Token and user data are cleared from localStorage
2. User is redirected to login page
3. Current page is saved as intended destination

## Usage

### Making API Calls
Instead of using axios directly, import the configured instance:

```javascript
// Before
import axios from 'axios';
axios.post('/api/endpoint', data);

// After
import axiosInstance from '../../utils/axios';
axiosInstance.post('/api/v1/endpoint', data);
```

The JWT token is automatically included in the request headers!

### Adding New Protected Routes
Wrap any route that requires authentication:

```jsx
<Route 
  path="/new-protected-route" 
  element={
    <PrivateRoute allowedRoles={['customer', 'restaurant']}>
      <YourComponent />
    </PrivateRoute>
  } 
/>
```

## Benefits

1. **Automatic Token Management**: No need to manually add tokens to each request
2. **Security**: Tokens are automatically included and validated
3. **User Experience**: Seamless navigation between pages while authenticated
4. **Role-Based Access**: Users can only access routes for their role
5. **Token Expiration Handling**: Automatic logout and redirect on token expiration
6. **Redirect After Login**: Users are redirected to their intended destination after login

## Testing

1. **Login** with any role (customer/restaurant/rider)
2. **Navigate** between different pages - token persists
3. **Close browser** and return - token persists (in localStorage)
4. **Try accessing** protected routes without login - redirected to login
5. **Login** and you'll be redirected back to intended page
6. **Try accessing** routes for different roles - redirected to your role's dashboard

## Next Steps for Future API Integration

When you integrate real backend APIs:

1. Replace mock data with real API calls using `axiosInstance`
2. Token will automatically be included in headers
3. Update API endpoints to match your backend routes
4. Handle loading states and errors appropriately

Example:
```javascript
import axiosInstance from '../../utils/axios';

const fetchRestaurants = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/restaurants');
    // Token is automatically included!
    setRestaurants(response.data);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    // If 401, user is automatically redirected to login
  }
};
```
