import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/common/Login";
import Signup from "./pages/common/Signup";
import Otp from "./pages/common/Otp";
import CustomerDashboard from "./pages/customer/Dashboard";
import RestaurantMenu from "./pages/customer/RestaurantMenu";
import Checkout from "./pages/customer/Checkout";
import CustomerProfile from "./pages/customer/Profile";
import CustomerOrders from "./pages/customer/Orders";
import RiderDashboard from "./pages/rider/Dashboard";
import RestaurantDashboard from "./pages/restaurant/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-dashboard/restaurant/:id" element={<RestaurantMenu />} />
        <Route path="/customer-dashboard/checkout" element={<Checkout />} />
        <Route path="/customer-dashboard/profile" element={<CustomerProfile />} />
        <Route path="/customer-dashboard/orders" element={<CustomerOrders />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
