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
  const [showClearModal, setShowClearModal] = useState(false);

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

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = async () => {
    try {
      // Call API to clear entire cart
      await clearCart();

      // Clear local state
      setCartItems([]);
      setShowClearModal(false);

      console.log("✅ Cart cleared successfully");
      showSuccess("Cart cleared successfully!");
    } catch (err) {
      console.error("Error clearing cart:", err);
      setShowClearModal(false);
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
      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 mx-4 animate-fade-in-down">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Clear Cart?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          isCartOpen && cartItems.length > 0 ? "sm:mr-96" : "mr-0"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-secondary shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a
                href="/"
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">BiteNow</span>
              </a>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-white hover:text-accent-light transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                {!isLoggedIn ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-all hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
                  >
                    Login / Sign Up
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/")}
                      className="text-white hover:text-accent-light transition-colors font-medium px-4 py-2 flex items-center gap-2"
                    >
                      <HomeIcon className="w-5 h-5" />
                      Home
                    </button>
                    <button
                      onClick={() => navigate("/orderStatus")}
                      className="text-white hover:text-accent-light transition-colors font-medium px-4 py-2 flex items-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      Orders
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="text-white hover:text-accent-light transition-colors font-medium px-4 py-2 flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("guest_session_id");
                        setIsLoggedIn(false);
                        navigate("/login");
                      }}
                      className="text-white hover:text-red-300 transition-colors font-medium px-4 py-2 flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Restaurant Details */}
        <div className="relative h-[500px] overflow-hidden">
          <img
            src={
              restaurant.restaurant_image?.url ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
            }
            alt={restaurant.restaurant_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
            <div className="max-w-7xl mx-auto">
              <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {restaurant.restaurant_name}
                </h1>

                <div className="flex flex-wrap gap-6 text-white/90">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg">
                      {restaurant.opening_time || "10:00 AM"} -{" "}
                      {restaurant.closing_time || "11:00 PM"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">
                      {restaurant.restaurant_address}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">
                      {restaurant.rating || 4.5}
                    </span>
                  </div>

                  <span className="px-4 py-1 bg-primary rounded-full text-lg font-semibold">
                    {restaurant.cuisine_type || "Restaurant"}
                  </span>

                  {restaurant.is_open ? (
                    <span className="px-4 py-1 bg-green-500 rounded-full text-lg font-semibold">
                      Open
                    </span>
                  ) : (
                    <span className="px-4 py-1 bg-red-500 rounded-full text-lg font-semibold">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Items Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Sorting Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-gray-800">Our Menu</h2>

            <div className="flex items-center space-x-3">
              <label htmlFor="sort" className="text-gray-700 font-semibold">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-gray-700 cursor-pointer hover:border-primary transition-colors"
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
        <footer className="bg-secondary text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">BiteNow</span>
            </div>
            <p className="text-white/80">
              © 2026 BiteNow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => navigate("/checkout")}
      />
    </div>
  );
};

export default RestaurantDetail;
