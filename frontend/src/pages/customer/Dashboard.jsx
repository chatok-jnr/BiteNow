import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import LocationHeader from "./components/LocationHeader";
import LocationPickerModal from "../../components/Map/LocationPickerModal";
import { mockRestaurants, cuisineCategories } from "./mockData";

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationLastUpdated, setLocationLastUpdated] = useState(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);

  // Clear non-customer users from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role && user.role !== "customer") {
        localStorage.removeItem("user");
      }
    }
    
    // Check for saved customer location
    checkSavedLocation();
  }, []);

  const checkSavedLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // No token, use mock data
        setFilteredRestaurants(mockRestaurants);
        return;
      }

      // Try to fetch customer profile to check for saved location
      const response = await fetch('http://localhost:5000/api/customers/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.customer_location?.coordinates) {
          const [lng, lat] = data.data.customer_location.coordinates;
          setCustomerLocation({ lng, lat });
          setLocationLastUpdated(data.data.lastLocationUpdate || new Date());
          
          // Fetch nearby restaurants
          await fetchNearbyRestaurants();
        } else {
          // No location saved, show location picker
          setShowLocationPicker(true);
        }
      } else {
        // API failed, use mock data
        setFilteredRestaurants(mockRestaurants);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      // On error, use mock data
      setFilteredRestaurants(mockRestaurants);
    }
  };

  const fetchNearbyRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        'http://localhost:5000/api/location/nearby-restaurants?maxDistance=10',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.length > 0) {
          setNearbyRestaurants(data.data);
          // Mix nearby restaurants with mock data for now
          setFilteredRestaurants([...data.data, ...mockRestaurants]);
        } else {
          // No nearby restaurants, use mock data
          setFilteredRestaurants(mockRestaurants);
        }
      } else {
        // API failed, use mock data
        setFilteredRestaurants(mockRestaurants);
      }
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      setFilteredRestaurants(mockRestaurants);
    }
  };

  const handleLocationChange = () => {
    setShowLocationPicker(true);
  };

  const handleLocationConfirm = async (location) => {
    try {
      const token = localStorage.getItem("token");
      
      // Try to update customer location in backend (optional - works without backend)
      try {
        const response = await fetch('http://localhost:5000/api/location/update', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: location.lat,
            longitude: location.lng
          })
        });

        if (!response.ok) {
          console.warn('Backend update failed, continuing with mock data');
        }
      } catch (apiError) {
        console.warn('Backend not available, continuing with mock data:', apiError);
      }

      // Always update local state (works with or without backend)
      setCustomerLocation(location);
      setLocationLastUpdated(new Date());
      setShowLocationPicker(false);
      
      // Fetch nearby restaurants after location update
      await fetchNearbyRestaurants();
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location. Please try again.');
    }
  };

  // Filter logic
  useEffect(() => {
    let filtered = [...mockRestaurants];

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
      filtered = filtered.filter((r) => r.cuisine === selectedCuisine);
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCuisine]);

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
        <span className="text-6xl">{restaurant.image}</span>
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
            <span className="font-semibold text-gray-900">{restaurant.rating}</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      
      {/* Location Header */}
      <LocationHeader
        currentLocation={customerLocation}
        onLocationChange={handleLocationChange}
        lastUpdated={locationLastUpdated}
      />

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

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => {
          // Allow closing if location is already set
          if (customerLocation) {
            setShowLocationPicker(false);
          }
        }}
        onLocationSelect={handleLocationConfirm}
        initialLocation={customerLocation}
        title="Select Delivery Location"
        isMandatory={!customerLocation}
      />

      {/* Custom Scrollbar Hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
