import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderManagement from "./components/OrderManagement";
import MenuManagement from "./components/MenuManagement";
import Analytics from "./components/Analytics";
import Reviews from "./components/Reviews";
import RestaurantSettings from "./components/RestaurantSettings";
import OrderHistory from "./components/OrderHistory";
import { mockOrders, mockFoodItems, mockReviews } from "./mockData";

function RestaurantManager() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  
  // Mock data states
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "restaurant") {
        navigate("/");
      }
      setUser(parsedUser);
      fetchRestaurantDetails(restaurantId);
    }
  }, [navigate, restaurantId]);

  const fetchRestaurantDetails = async (id) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/restaurants/${id}`);
      // const data = await response.json();
      
      // Mock data
      const mockRestaurant = {
        restaurant_id: id,
        restaurant_name: "The Golden Spoon",
        restaurant_description: "Experience fine dining with our exquisite collection of international cuisines crafted by award-winning chefs.",
        restaurant_location: "Gulshan",
        restaurant_address: {
          street: "123 Main Street",
          city: "Dhaka",
          state: "Dhaka Division",
          country: "Bangladesh",
          zipCode: "1212"
        },
        restaurant_contact_phone: "+8801712345678",
        restaurant_contact_email: "contact@goldenspoon.com",
        restaurant_categories: ["Fine Dining", "Italian", "Seafood"],
        restaurant_rating: { average: 4.5, count: 250 },
        restaurant_opening_hours: {
          Monday: { open: "09:00", close: "22:00", closed: false },
          Tuesday: { open: "09:00", close: "22:00", closed: false },
          Wednesday: { open: "09:00", close: "22:00", closed: false },
          Thursday: { open: "09:00", close: "22:00", closed: false },
          Friday: { open: "09:00", close: "23:00", closed: false },
          Saturday: { open: "10:00", close: "23:00", closed: false },
          Sunday: { open: "10:00", close: "22:00", closed: false },
        },
        restaurant_total_revenue: 45000.50,
        restaurant_total_sales: 450,
        is_currently_open: true,
      };
      
      // Load mock data
      setRestaurant(mockRestaurant);
      setOrders(mockOrders);
      setFoodItems(mockFoodItems);
      setReviews(mockReviews);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setLoading(false);
    }
  };

  const handleBackToOwnerDashboard = () => {
    navigate("/owner-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToOwnerDashboard}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Owner Dashboard"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant?.restaurant_name}</h1>
                <p className="text-sm text-gray-500">
                  {restaurant?.restaurant_address.street}, {restaurant?.restaurant_address.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-semibold text-gray-900">{restaurant?.restaurant_rating.average}</span>
                <span className="text-gray-500">({restaurant?.restaurant_rating.count} reviews)</span>
              </div>
              
              {/* Operational Status Toggle */}
              <div className="flex items-start gap-2 px-4 py-2 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700 mt-1">Status:</span>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => {
                      setRestaurant({ ...restaurant, is_currently_open: !restaurant.is_currently_open });
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      restaurant?.is_currently_open ? "bg-secondary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        restaurant?.is_currently_open ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-medium ${
                    restaurant?.is_currently_open ? "text-secondary" : "text-gray-500"
                  }`}>
                    {restaurant?.is_currently_open ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "orders", label: "Orders", icon: "📋" },
              { id: "menu", label: "Menu", icon: "🍽️" },
              { id: "analytics", label: "Analytics", icon: "📊" },
              { id: "reviews", label: "Reviews", icon: "⭐" },
              { id: "history", label: "Order History", icon: "📜" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "orders" && <OrderManagement orders={orders} />}
        {activeTab === "menu" && <MenuManagement foodItems={foodItems} />}
        {activeTab === "analytics" && (
          <Analytics restaurant={restaurant} foodItems={foodItems} orders={orders} />
        )}
        {activeTab === "reviews" && <Reviews restaurant={restaurant} reviews={reviews} />}
        {activeTab === "history" && <OrderHistory orders={orders} />}
        {activeTab === "settings" && <RestaurantSettings restaurant={restaurant} />}
      </main>
    </div>
  );
}

export default RestaurantManager;
