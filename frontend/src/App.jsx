import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/common/Login";
import Signup from "./pages/common/Signup";
import CustomerDashboard from "./pages/customer/Dashboard";
import RiderDashboard from "./pages/rider/Dashboard";
import RestaurantDashboard from "./pages/restaurant/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
