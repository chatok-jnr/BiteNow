import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";

// Role Selection
import RoleSelection from "./pages/RoleSelection";

// General Pages
import About from "./pages/About";
import Contact from "./pages/Contact";

//Customer Pages
import CustomerHome from "./pages/customer/Home";
import CustomerRestaurantDetail from "./pages/customer/RestaurantDetail";
import CustomerOrderStatus from "./pages/customer/OrderStatus";
import CustomerLogin from "./pages/customer/Login";
import CustomerCheckout from "./pages/customer/Checkout";
import CustomerProfile from "./pages/customer/Profile";
import GoogleAuthSuccess from "./pages/customer/GoogleAuthSuccess";
import AddressList from "./pages/customer/AddressList";
import AddEditAddress from "./pages/customer/AddEditAddress";

//Restaurant Owner Pages
import Restaurant_owner_Dashboard from "./pages/RestaurantOwner/Dashboard";
import Restaurant_owner_Restaurant_List from "./pages/RestaurantOwner/Restaurants";
import Restaurant_owner_Profile from "./pages/RestaurantOwner/Profile";
import Manage_Restaurant from "./pages/RestaurantOwner/Manage_Restaurant";
import RestaurantOwnerLogin from "./pages/RestaurantOwner/Login";

//Rider pages
import RiderHome from "./pages/rider/Home";
import RiderProfile from "./pages/rider/Profile";
import RiderLogin from "./pages/rider/Login";
import RiderMap from "./pages/rider/RiderMap";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              {/* Role Selection */}
              <Route path="/login" element={<RoleSelection />} />

              {/* General Routes */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Customer Routes */}
              <Route path="/" element={<CustomerHome />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route
                path="/restaurant/:id"
                element={<CustomerRestaurantDetail />}
              />
              <Route path="/checkout" element={<CustomerCheckout />} />
              <Route path="/orderStatus" element={<CustomerOrderStatus />} />
              <Route
                path="/auth/google/success"
                element={<GoogleAuthSuccess />}
              />
              <Route path="/addresses" element={<AddressList />} />
              <Route path="/address/add" element={<AddEditAddress />} />
              <Route path="/address/edit" element={<AddEditAddress />} />

              {/* Restaurant Owner Routes */}
              <Route
                path="/restaurant-owner/login"
                element={<RestaurantOwnerLogin />}
              />
              <Route
                path="/restaurant_owner/dashboard"
                element={<Restaurant_owner_Dashboard />}
              />
              <Route
                path="/restaurant_owner/restaurants"
                element={<Restaurant_owner_Restaurant_List />}
              />
              <Route
                path="/restaurant_owner/profile"
                element={<Restaurant_owner_Profile />}
              />
              <Route
                path="/restaurant_owner/manage_restaurant"
                element={<Manage_Restaurant />}
              />

              {/* Rider Routes */}
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/home" element={<RiderHome />} />
              <Route path="/rider/profile" element={<RiderProfile />} />
              <Route path="/rider/map/:orderId" element={<RiderMap />} />
            </Routes>
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
