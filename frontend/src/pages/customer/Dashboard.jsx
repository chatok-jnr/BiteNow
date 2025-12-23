import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import { cuisineCategories } from "./mockData";
import axiosInstance from "../../utils/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear non-customer users from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role && user.role !== "customer") {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/v1/restaurants");
        
        if (response.data.status === "success") {
          // Transform API data to match our component structure
          const transformedRestaurants = response.data.data.restaurants.map((restaurant) => ({
            id: restaurant._id,
            name: restaurant.restaurant_name,
            cuisine: restaurant.restaurant_category.join(", "),
            rating: restaurant.restaurant_rating.average || 0,
            deliveryTime: "25-35", // Default value since API doesn't provide this
            deliveryFee: 30, // Default value
            image: "🍽️", // Default emoji
            discount: 0, // Default value
            popular: restaurant.restaurant_rating.count > 50,
            topDeal: restaurant.restaurant_commissionRate < 0.2,
            fastDelivery: false,
            address: restaurant.restaurant_address,
            phone: restaurant.restaurant_contact_info.phone,
            description: restaurant.restaurant_description,
            status: restaurant.restaurant_status,
            coordinates: restaurant.restaurant_location.coordinates,
            restaurantImage: restaurant.restaurant_image.url,
          }));

          // Filter only accepted restaurants
          const acceptedRestaurants = transformedRestaurants.filter(
            (r) => r.status === "Accepted"
          );
          
          setRestaurants(acceptedRestaurants);
          setFilteredRestaurants(acceptedRestaurants);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...restaurants];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Cuisine filter
    if (selectedCuisine !== "All") {
      filtered = filtered.filter((r) => 
        r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCuisine, restaurants]);

  // Get restaurants by category
  const topDealsRestaurants = filteredRestaurants.filter(r => r.topDeal);
  const bestDiscountRestaurants = filteredRestaurants.filter(r => r.discount > 0).sort((a, b) => b.discount - a.discount);
  const fastDeliveryRestaurants = filteredRestaurants.filter(r => r.fastDelivery || parseInt(r.deliveryTime.split("-")[0]) <= 25);
  const highlyRatedRestaurants = filteredRestaurants.filter(r => r.rating >= 4.7).sort((a, b) => b.rating - a.rating);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/customer-dashboard/restaurant/${restaurantId}`);
  };

  const RestaurantCard = ({ restaurant }) => (
    <div
      onClick={() => handleRestaurantClick(restaurant.id)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden flex-shrink-0 w-72"
    >
      {/* Restaurant Image/Icon */}
      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
        {restaurant.restaurantImage ? (
          <img 
            src={restaurant.restaurantImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{restaurant.image}</span>
        )}
        {restaurant.popular && (
          <span className="absolute top-3 right-3 bg-secondary text-white px-2 py-1 rounded-full text-xs font-semibold">
            Popular
          </span>
        )}
        {restaurant.discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
            {restaurant.discount}% OFF
          </span>
        )}
      </div>

      {/* Restaurant Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {restaurant.name}
        </h3>

        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine}</p>

        <div className="space-y-2">
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-900">{restaurant.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-xs">
              ({Math.floor(Math.random() * 500 + 100)}+)
            </span>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <span>🕒</span>
              <span className="text-gray-700">{restaurant.deliveryTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💵</span>
              <span className="text-gray-700">৳{restaurant.deliveryFee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading restaurants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-6xl mb-4">😕</p>
              <p className="text-xl text-gray-900 font-semibold mb-2">Oops!</p>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Restaurants
          </h1>
          <p className="text-gray-600">Order from your favorite restaurants</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <span className="absolute left-4 top-3.5 text-gray-400 text-xl">
              🔍
            </span>
          </div>
        </div>

        {/* Cuisines Section - Horizontal Scroll */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cuisines</h2>
          <div className="flex space-x-4 overflow-x-auto py-4 px-2 scrollbar-hide">
            {cuisineCategories.map((cuisine) => (
              <div
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine.id)}
                className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all ${
                  selectedCuisine === cuisine.id ? "transform scale-110" : ""
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                    selectedCuisine === cuisine.id
                      ? "bg-primary text-white ring-4 ring-primary/30"
                      : "bg-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {cuisine.icon}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    selectedCuisine === cuisine.id
                      ? "text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {cuisine.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Sections */}
        
        {/* Top Deals Section */}
        {topDealsRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                🔥 Top Deals
              </h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {topDealsRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Best Discounts Section */}
        {bestDiscountRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                💰 Best Discounts
              </h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {bestDiscountRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Fast Delivery Section */}
        {fastDeliveryRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                ⚡ Fast Delivery
              </h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {fastDeliveryRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Highly Rated Section */}
        {highlyRatedRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                ⭐ Highly Rated
              </h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {highlyRatedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">😔</p>
            <p className="text-xl text-gray-600 mb-2">No restaurants found</p>
            <p className="text-sm text-gray-500">
              Try a different search or cuisine
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
