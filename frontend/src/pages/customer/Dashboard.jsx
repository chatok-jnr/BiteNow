import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "customer") {
        navigate("/");
      }
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const categories = [
    { id: "all", name: "All", icon: "🍽️" },
    { id: "pizza", name: "Pizza", icon: "🍕" },
    { id: "burger", name: "Burgers", icon: "🍔" },
    { id: "sushi", name: "Sushi", icon: "🍣" },
    { id: "dessert", name: "Desserts", icon: "🍰" },
  ];

  const restaurants = [
    {
      id: 1,
      name: "Pizza Palace",
      category: "pizza",
      rating: 4.8,
      deliveryTime: "25-35 min",
      image: "🍕",
      popular: true,
    },
    {
      id: 2,
      name: "Burger House",
      category: "burger",
      rating: 4.6,
      deliveryTime: "20-30 min",
      image: "🍔",
      popular: true,
    },
    {
      id: 3,
      name: "Sushi Master",
      category: "sushi",
      rating: 4.9,
      deliveryTime: "30-40 min",
      image: "🍣",
      popular: false,
    },
    {
      id: 4,
      name: "Sweet Treats",
      category: "dessert",
      rating: 4.7,
      deliveryTime: "15-25 min",
      image: "🍰",
      popular: true,
    },
    {
      id: 5,
      name: "Italian Corner",
      category: "pizza",
      rating: 4.5,
      deliveryTime: "30-40 min",
      image: "🍝",
      popular: false,
    },
    {
      id: 6,
      name: "Taco Fiesta",
      category: "burger",
      rating: 4.4,
      deliveryTime: "25-35 min",
      image: "🌮",
      popular: false,
    },
  ];

  const activeOrders = [
    {
      id: 1,
      restaurant: "Pizza Palace",
      items: ["Margherita Pizza", "Garlic Bread"],
      status: "preparing",
      estimatedTime: "15 min",
    },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === "all" || restaurant.category === selectedCategory;
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (restaurant) => {
    setCart([...cart, { ...restaurant, quantity: 1 }]);
    // Animation effect
    setTimeout(() => setShowCart(true), 100);
    setTimeout(() => setShowCart(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">BiteNow</h1>
              <div className="hidden md:block text-sm text-gray-600">
                📍 Delivering to{" "}
                <span className="font-semibold text-gray-900">Downtown</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🛒
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "browse"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🍽️ Browse
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📦 Orders
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === "favorites"
                ? "bg-primary text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            ❤️ Favorites
          </button>
        </div>

        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                  🔍
                </span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-primary text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:shadow-md hover:scale-105"
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-sm font-semibold">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Active Orders Alert */}
            {activeOrders.length > 0 && (
              <div className="bg-secondary/10 border-2 border-secondary rounded-2xl p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      🚀 Order in Progress
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your order from {activeOrders[0].restaurant} is being
                      prepared
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Track
                  </button>
                </div>
              </div>
            )}

            {/* Popular Restaurants */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔥 Popular Restaurants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants
                  .filter((r) => r.popular)
                  .map((restaurant, index) => (
                    <div
                      key={restaurant.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-6xl">
                        {restaurant.image}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            ⭐ {restaurant.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            🕐 {restaurant.deliveryTime}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(restaurant)}
                          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All Restaurants */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🍴 All Restaurants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants
                  .filter((r) => !r.popular)
                  .map((restaurant, index) => (
                    <div
                      key={restaurant.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                        {restaurant.image}
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            ⭐ {restaurant.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            🕐 {restaurant.deliveryTime}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(restaurant)}
                          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {order.restaurant}
                    </h3>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                  </div>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-gray-700">
                      • {item}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Estimated: {order.estimatedTime}
                  </span>
                  <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Track Order
                  </button>
                </div>
              </div>
            ))}
            <div className="text-center text-gray-500 py-12">
              <p className="text-4xl mb-4">📦</p>
              <p>No past orders yet</p>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="text-center py-20 animate-fadeIn">
            <p className="text-6xl mb-4">❤️</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Favorites Yet
            </h3>
            <p className="text-gray-600">
              Start adding restaurants to your favorites!
            </p>
          </div>
        )}
      </div>

      {/* Cart Notification */}
      {showCart && (
        <div className="fixed top-24 right-4 bg-secondary text-white px-6 py-4 rounded-xl shadow-xl animate-slideIn z-50">
          <p className="font-semibold">✓ Added to cart!</p>
        </div>
      )}

      {/* Add custom animations to index.css */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CustomerDashboard;
