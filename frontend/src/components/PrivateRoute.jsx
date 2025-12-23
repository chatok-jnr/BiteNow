import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // Get user data from localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // If no token, redirect to login with intended destination
  if (!token) {
    // Store the current location to redirect back after login
    localStorage.setItem('intendedDestination', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If we have a token but need role-based access control
  if (allowedRoles && userData) {
    try {
      const user = JSON.parse(userData);
      
      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        const roleDashboards = {
          customer: '/customer-dashboard',
          restaurant: '/owner-dashboard',
          rider: '/rider-dashboard',
        };
        
        return <Navigate to={roleDashboards[user.role] || '/'} replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // If there's an error parsing user data, clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }
  
  // User is authenticated and has correct role
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;
