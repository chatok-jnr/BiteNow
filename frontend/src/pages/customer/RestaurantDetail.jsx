import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Star,
  ShoppingCart,
  Home as HomeIcon,
  User,
  Package,
  LogOut,
  CheckCircle,
  X,
} from "lucide-react";
import FoodCard from "../../components/FoodCard";
import CartSidebar from "../../components/CartSidebar";
import Footer from "../../components/Footer";
import { getRestaurantById } from "../../utils/restaurantService";
import { getFoodsByRestaurant } from "../../utils/foodService";
import {
  getCart,
  addToCart as addToCartAPI,
  removeFromCart,
  clearCart,
} from "../../utils/cartService";
import { useNotification } from "../../contexts/NotificationContext";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [sortBy, setSortBy] = useState("default");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // API data states
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (id) {
      fetchRestaurantData();
      fetchFoodsData();
      fetchCartData();
    }
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const response = await getRestaurantById(id);
      setRestaurant(response.data?.restaurant);
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError(err.response?.data?.message || "Failed to load restaurant");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodsData = async () => {
    try {
      const response = await getFoodsByRestaurant(id);
      setFoods(response.data?.foods || []);
    } catch (err) {
      console.error("Error fetching foods:", err);
    }
  };

  const fetchCartData = async () => {
    try {
      const cart = await getCart();
      if (cart && cart.items) {
        setCartItems(
          cart.items.map((item) => ({
            id: item.food_id._id,
            name: item.food_id.food_name,
            price: item.price_at_time,
            quantity: item.quantity,
            image: item.food_id.food_image?.url,
            restaurant: item.food_id.restaurant_id?.restaurant_name,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const handleAddToCart = async (food) => {
    try {
      // Call API to add to cart
      await addToCartAPI(food._id || food.id, 1);

      // Update local cart state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.id === (food._id || food.id),
        );
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === (food._id || food.id)
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [
          ...prevItems,
          {
            id: food._id || food.id,
            name: food.food_name || food.name,
            price: food.food_price || food.price,
            image: food.food_image?.url || food.image,
            restaurant: restaurant?.restaurant_name || food.restaurant,
            quantity: 1,
          },
        ];
      });
      setIsCartOpen(true);

      // Optionally refresh cart from server
      await fetchCartData();
    } catch (err) {
      console.error("Error adding to cart:", err);
      showError(err.response?.data?.message || "Failed to add item to cart");
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      // Call API to update cart item quantity
      await addToCartAPI(
        itemId,
        newQuantity -
          (cartItems.find((item) => item.id === itemId)?.quantity || 0),
      );

      // Refresh cart from server to ensure consistency
      await fetchCartData();
    } catch (err) {
      console.error("Error updating quantity:", err);
      showError(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Check if this is the last item
      const isLastItem = cartItems.length === 1;

      if (isLastItem) {
        // If removing the last item, clear the entire cart
        await clearCart();
        setCartItems([]);
        console.log("✅ Last item removed, cart cleared");
      } else {
        // Call API to remove item from cart
        await removeFromCart(itemId, "all");
        // Refresh cart from server to ensure consistency
        await fetchCartData();
      }
    } catch (err) {
      console.error("Error removing item:", err);
      showError(err.response?.data?.message || "Failed to remove item");
    }
  };

  const confirmClearCart = async () => {
    try {
      // Call API to clear entire cart
      await clearCart();

      // Clear local state
      setCartItems([]);

      console.log("✅ Cart cleared successfully");
      showSuccess("Cart cleared successfully!");
    } catch (err) {
      console.error("Error clearing cart:", err);
      showError(err.response?.data?.message || "Failed to clear cart");
    }
  };

  // Sort foods based on selected option
  const getSortedFoods = () => {
    let sortedFoods = [...foods];

    switch (sortBy) {
      case "discount":
        // Sort by discount percentage (highest first), items without discount go to the end
        sortedFoods.sort(
          (a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0),
        );
        break;
      case "price-low":
        // Sort by price (lowest first)
        sortedFoods.sort((a, b) => a.food_price - b.food_price);
        break;
      case "price-high":
        // Sort by price (highest first)
        sortedFoods.sort((a, b) => b.food_price - a.food_price);
        break;
      case "newest":
        // Sort by date added (newest first)
        sortedFoods.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        break;
      default:
        // Keep original order
        break;
    }

    return sortedFoods;
  };

  const sortedFoods = getSortedFoods();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading restaurant...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            {error || "Restaurant not found"}
          </p>
          <a href="/" className="text-primary hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`transition-all duration-300 ${
          isCartOpen && cartItems.length > 0 ? "sm:mr-96" : "mr-0"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-primary shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a
                href="/"
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  BiteNow
                </span>
              </a>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-white hover:text-accent-light transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                {!isLoggedIn ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-primary text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-full hover:bg-accent transition-all hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Login / Sign Up</span>
                    <span className="sm:hidden">Login</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/")}
                      className="text-white hover:text-accent-light transition-colors font-medium p-2 flex items-center gap-1 sm:gap-2"
                      title="Home"
                    >
                      <HomeIcon className="w-5 h-5" />
                      <span className="hidden md:inline">Home</span>
                    </button>
                    <button
                      onClick={() => navigate("/orderStatus")}
                      className="text-white hover:text-accent-light transition-colors font-medium p-2 flex items-center gap-1 sm:gap-2"
                      title="Orders"
                    >
                      <Package className="w-5 h-5" />
                      <span className="hidden md:inline">Orders</span>
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="text-white hover:text-accent-light transition-colors font-medium p-2 flex items-center gap-1 sm:gap-2"
                      title="Profile"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden md:inline">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("guest_session_id");
                        setIsLoggedIn(false);
                        navigate("/login");
                      }}
                      className="text-white hover:text-red-300 transition-colors font-medium p-2 flex items-center gap-1 sm:gap-2"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden md:inline">Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Restaurant Details */}
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden">
          <img
            src={
              restaurant.restaurant_image?.url ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
            }
            alt={restaurant.restaurant_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-16">
            <div className="max-w-7xl mx-auto">
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 border border-white/20">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
                  {restaurant.restaurant_name}
                </h1>

                <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-white/90">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg">
                      {restaurant.opening_time || "10:00 AM"} -{" "}
                      {restaurant.closing_time || "11:00 PM"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg truncate max-w-xs sm:max-w-sm">
                      {restaurant.restaurant_address}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm sm:text-base lg:text-lg font-semibold">
                      {restaurant.rating || 4.5}
                    </span>
                  </div>

                  <span className="px-3 sm:px-4 py-1 bg-primary rounded-full text-sm sm:text-base lg:text-lg font-semibold">
                    {restaurant.cuisine_type || "Restaurant"}
                  </span>

                  {restaurant.is_open ? (
                    <span className="px-3 sm:px-4 py-1 bg-green-500 rounded-full text-sm sm:text-base lg:text-lg font-semibold">
                      Open
                    </span>
                  ) : (
                    <span className="px-3 sm:px-4 py-1 bg-red-500 rounded-full text-sm sm:text-base lg:text-lg font-semibold">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Items Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Sorting Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Our Menu
            </h2>

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <label
                htmlFor="sort"
                className="text-sm sm:text-base text-gray-700 font-semibold flex-shrink-0"
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-gray-700 cursor-pointer hover:border-primary transition-colors text-sm sm:text-base"
              >
                <option value="default">Default</option>
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={{
                  ...food,
                  id: food._id,
                  name: food.food_name,
                  image: food.food_image?.url,
                  price: food.food_price,
                  originalPrice:
                    food.discount_percentage > 0
                      ? food.food_price / (1 - food.discount_percentage / 100)
                      : null,
                  discount: food.discount_percentage,
                  rating: food.rating || 4.5,
                  restaurant: restaurant.restaurant_name,
                }}
                showDiscount={true}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* No items message (if needed) */}
          {sortedFoods.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                No menu items available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={confirmClearCart}
        onCheckout={() => navigate("/checkout")}
      />
    </div>
  );
};

export default RestaurantDetail;
