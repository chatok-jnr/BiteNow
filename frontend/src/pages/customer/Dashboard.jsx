import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import { mockRestaurants } from "./mockData";

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "customer") {
      navigate("/login");
    }
  }, [navigate]);

  // Filter and sort logic
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

    // Rating filter
    if (selectedRating !== "All") {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter((r) => r.rating >= minRating);
    }

    // Price filter
    if (selectedPrice !== "All") {
      filtered = filtered.filter((r) => r.priceRange === selectedPrice);
    }

    // Sorting
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "deliveryTime") {
      filtered.sort((a, b) => {
        const aTime = parseInt(a.deliveryTime.split("-")[0]);
        const bTime = parseInt(b.deliveryTime.split("-")[0]);
        return aTime - bTime;
      });
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCuisine, selectedRating, selectedPrice, sortBy]);

  const cuisines = ["All", ...new Set(mockRestaurants.map((r) => r.cuisine))];
  const ratings = ["All", "4.5", "4.0", "3.5"];
  const priceRanges = ["All", "$$", "$$$"];

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/customer-dashboard/restaurant/${restaurantId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
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

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine
              </label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {ratings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating === "All" ? "All Ratings" : `${rating}+ ⭐`}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="deliveryTime">Fastest Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredRestaurants.length} restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Restaurant Cards */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">😔</p>
            <p className="text-gray-600">No restaurants found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
              >
                {/* Restaurant Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                  <span className="text-7xl">{restaurant.image}</span>
                  {restaurant.popular && (
                    <span className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  )}
                </div>

                {/* Restaurant Details */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {restaurant.cuisine}
                  </p>

                  <div className="space-y-2">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-gray-900">
                        {restaurant.rating}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({Math.floor(Math.random() * 500 + 100)}+ ratings)
                      </span>
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <span>🕒</span>
                        <span className="text-gray-700">
                          {restaurant.deliveryTime} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💵</span>
                        <span className="text-gray-700">
                          ৳{restaurant.deliveryFee} delivery
                        </span>
                      </div>
                    </div>

                    {/* Min Order & Price Range */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">
                        Min: ৳{restaurant.minOrder}
                      </span>
                      <span className="text-primary font-semibold">
                        {restaurant.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
