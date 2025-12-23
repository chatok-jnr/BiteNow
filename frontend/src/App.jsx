import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/common/Login";
import Signup from "./pages/common/Signup";
import Otp from "./pages/common/Otp";
import ChangePassword from "./pages/common/ChangePassword";
import CustomerDashboard from "./pages/customer/Dashboard";
import RestaurantMenu from "./pages/customer/RestaurantMenu";
import Checkout from "./pages/customer/Checkout";
import CustomerProfile from "./pages/customer/Profile";
import CustomerOrders from "./pages/customer/Orders";
import RiderDashboard from "./pages/rider/Dashboard";
import OwnerDashboard from "./pages/restaurant/OwnerDashboard";
import RestaurantManager from "./pages/restaurant/RestaurantManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/owner-change-password" element={<ChangePassword />} />
        
        {/* Customer Routes - Public access for browsing */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-dashboard/restaurant/:id" element={<RestaurantMenu />} />
        
        {/* Customer Routes - Protected (require login) */}
        <Route 
          path="/customer-dashboard/checkout" 
          element={
            <PrivateRoute allowedRoles={['customer']}>
              <Checkout />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/customer-dashboard/profile" 
          element={
            <PrivateRoute allowedRoles={['customer']}>
              <CustomerProfile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/customer-dashboard/orders" 
          element={
            <PrivateRoute allowedRoles={['customer']}>
              <CustomerOrders />
            </PrivateRoute>
          } 
        />
        
        {/* Rider Routes - Protected */}
        <Route 
          path="/rider-dashboard" 
          element={
            <PrivateRoute allowedRoles={['rider']}>
              <RiderDashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Restaurant Owner Routes - Protected */}
        <Route 
          path="/owner-dashboard" 
          element={
            <PrivateRoute allowedRoles={['restaurant']}>
              <OwnerDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/restaurant-manager/:restaurantId" 
          element={
            <PrivateRoute allowedRoles={['restaurant']}>
              <RestaurantManager />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
