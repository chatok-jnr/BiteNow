import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

import Dashboard from "./pages/BiteNowDashboard";
import Login from "./pages/AdminLogin";
import Customers from "./pages/Customers";
import RestaurantOwners from "./pages/RestaurantOwners";
import Restaurants from "./pages/Restaurants";
import Riders from "./pages/Riders";
import AuditLogs from "./pages/AuditLogs";
import AdminList from "./pages/AdminList";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - All admin pages */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
            <Route path="/restaurant-owner" element={<PrivateRoute><RestaurantOwners /></PrivateRoute>} />
            <Route path="/restaurant" element={<PrivateRoute><Restaurants /></PrivateRoute>} />
            <Route path="/rider" element={<PrivateRoute><Riders /></PrivateRoute>} />
            <Route path="/admin-list" element={<PrivateRoute><AdminList /></PrivateRoute>} />
            <Route path="/audit-log" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
