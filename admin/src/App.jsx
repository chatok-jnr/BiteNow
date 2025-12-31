import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/restaurant-owner" element={<RestaurantOwners />} />
            <Route path="/restaurant" element={<Restaurants />} />
            <Route path="/rider" element={<Riders />} />
            <Route path="/admin-list" element={<AdminList />} />
            <Route path="/audit-log" element={<AuditLogs />} />
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
