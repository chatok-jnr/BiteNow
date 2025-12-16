import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/common/Login";
import Signup from "./pages/common/Signup";
import Otp from "./pages/common/Otp";
import ChangePassword from "./pages/common/ChangePassword";
import CustomerDashboard from "./pages/customer/Dashboard";
import RiderDashboard from "./pages/rider/Dashboard";
import OwnerDashboard from "./pages/restaurant/OwnerDashboard";
import RestaurantManager from "./pages/restaurant/RestaurantManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/owner-change-password" element={<ChangePassword />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        {/* Restaurant Owner Routes */}
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/restaurant-manager/:restaurantId" element={<RestaurantManager />} />
      </Routes>
    </Router>
  );
}

export default App;
