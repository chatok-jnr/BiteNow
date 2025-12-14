import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerDashboard from "./pages/CustomerDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";

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
