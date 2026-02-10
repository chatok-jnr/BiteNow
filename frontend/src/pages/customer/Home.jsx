import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Home as HomeIcon,
  User,
  Package,
  LogOut,
} from "lucide-react";
import FoodCard from "../../components/FoodCard";
import RestaurantCard from "../../components/RestaurantCard";
import CartSidebar from "../../components/CartSidebar";
import { getAllRestaurants } from "../../utils/restaurantService";
import { getAllFoods, getDiscountedFoods } from "../../utils/foodService";
import {
  getCart,
  addToCart as addToCartAPI,
  removeFromCart,
  clearCart,
} from "../../utils/cartService";
import { useNotification } from "../../contexts/NotificationContext";

const Home = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [restaurantPage, setRestaurantPage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  // API data states
  const [restaurants, setRestaurants] = useState([]);
  const [topFoods, setTopFoods] = useState([]);
  const [discountedFoods, setDiscountedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
      title: "Lightning Fast Delivery",
      description:
        "Hot food delivered to your doorstep in under 30 minutes. Your cravings, our priority.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80",
      title: "Best Restaurants Near You",
      description:
        "Discover top-rated local restaurants and enjoy authentic flavors from your neighborhood.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&q=80",
      title: "Exclusive Discounts Daily",
      description:
        "Save big with our daily deals and exclusive offers. Quality food at unbeatable prices.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80",
      title: "Effortless Ordering Experience",
      description:
        "Browse, order, and track your food with our intuitive platform. Food delivery made simple.",
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    fetchAllData();
    fetchCartData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch restaurants
      const restaurantsRes = await getAllRestaurants({ limit: 50, page: 1 });
      setRestaurants(restaurantsRes.data?.restaurants || []);

      // Fetch top foods (most popular)
      const topFoodsRes = await getAllFoods({ limit: 4, sort: "-createdAt" });
      setTopFoods(topFoodsRes.data?.foods || []);

      // Fetch discounted foods
      const discountedRes = await getDiscountedFoods();
      setDiscountedFoods(discountedRes.data?.foods?.slice(0, 4) || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
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

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );

  const restaurantsPerPage = 12;

  // Sort restaurants based on selected option
  const getSortedRestaurants = () => {
    const sorted = [...restaurants];

    switch (sortBy) {
      case "price-low":
        // Assuming restaurants have average_price or similar field
        return sorted.sort(
          (a, b) => (a.average_price || 0) - (b.average_price || 0),
        );
      case "price-high":
        return sorted.sort(
          (a, b) => (b.average_price || 0) - (a.average_price || 0),
        );
      case "date":
      default:
        // Sort by creation date (newest first)
        return sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
    }
  };

  const sortedRestaurants = getSortedRestaurants();
  const currentRestaurants = sortedRestaurants.slice(
    restaurantPage * restaurantsPerPage,
    (restaurantPage + 1) * restaurantsPerPage,
  );

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
            restaurant: food.restaurant_id?.restaurant_name || food.restaurant,
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
    setShowClearCartModal(true);
  };

  const confirmClearCart = async () => {
    try {
      // Call API to clear entire cart
      await clearCart();

      // Clear local state
      setCartItems([]);

      console.log("✅ Cart cleared successfully");
    } catch (err) {
      console.error("Error clearing cart:", err);
      showError(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setShowClearCartModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className={`transition-all duration-300 ${
          isCartOpen && cartItems.length > 0 ? "sm:mr-96" : "mr-0"
        }`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-[#67A177] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div
                onClick={() => navigate("/")}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 bg-[#ACD4B1] rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-[#67A177]" />
                </div>
                <span className="text-2xl font-bold text-white">BiteNow</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-white hover:text-[#ACD4B1] transition-colors"
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
                    className="bg-[#ACD4B1] text-[#67A177] px-6 py-2 rounded-full hover:bg-[#DDEEDB] transition-all hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
                  >
                    Login / Sign Up
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-[#ACD4B1] text-[#67A177] px-6 py-2 rounded-full font-semibold flex items-center gap-2"
                    >
                      <HomeIcon className="w-5 h-5" />
                      Home
                    </button>
                    <button
                      onClick={() => navigate("/orderStatus")}
                      className="text-white hover:text-[#ACD4B1] transition-colors font-medium px-4 py-2 flex items-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      Orders
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="text-white hover:text-[#ACD4B1] transition-colors font-medium px-4 py-2 flex items-center gap-2"
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
        {/* Hero Slider */}
        <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="max-w-4xl mx-auto backdrop-blur-sm bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-8" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
        {/* Top 4 Most Sold Foods */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-3">
              Most Popular Dishes
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading foods...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topFoods.map((food) => (
                <FoodCard
                  key={food._id}
                  food={{
                    ...food,
                    id: food._id,
                    name: food.food_name,
                    description: food.food_description,
                    image: food.food_image?.url,
                    price: food.food_price,
                    rating: food.rating || 4.5,
                    restaurant: food.restaurant_id?.restaurant_name,
                  }}
                  showDiscount={false}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>
        {/* Top 4 Discounted Foods */}
        {/* <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-3">Hot Deals Today</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading discounts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {discountedFoods.map((food) => (
                <FoodCard 
                  key={food._id} 
                  food={{
                    ...food,
                    id: food._id,
                    name: food.food_name,
                    image: food.food_image?.url,
                    price: food.food_price,
                    originalPrice: food.food_price / (1 - food.discount_percentage / 100),
                    discount: food.discount_percentage,
                    rating: food.rating || 4.5,
                    restaurant: food.restaurant_id?.restaurant_name
                  }} 
                  showDiscount={true} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </section> */}
        {/* Restaurants List */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <div className="text-center mb-3">
              <h2 className="text-4xl font-bold text-primary mb-3">
                Explore Restaurants
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="flex justify-end mt-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-2 border-2 border-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 font-medium cursor-pointer hover:border-accent transition-colors"
              >
                <option value="date">Sort by Date</option>
                <option value="price-low">Sort by Price: Low to High</option>
                <option value="price-high">Sort by Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading restaurants...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={{
                      ...restaurant,
                      id: restaurant._id,
                      name: restaurant.restaurant_name,
                      image: restaurant.restaurant_image?.url,
                      location: restaurant.restaurant_address,
                      rating: restaurant.rating || 4.5,
                      cuisine: restaurant.cuisine_type || "Restaurant",
                      deliveryTime: "20-30 min",
                    }}
                  />
                ))}
              </div>

              {(restaurantPage + 1) * restaurantsPerPage <
                sortedRestaurants.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setRestaurantPage(restaurantPage + 1)}
                    className="bg-primary text-white px-12 py-4 rounded-full hover:bg-accent transition-all font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Load More Restaurants
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        {/* Footer */}
        <footer className="bg-secondary text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BiteNow</span>
              </div>
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <a
                  href="#about"
                  className="text-white hover:text-accent-light transition-colors font-medium"
                >
                  About Us
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-accent-light transition-colors font-medium"
                >
                  Contact Us
                </a>
              </div>
              <p className="text-white/80">
                © 2026 BiteNow. All rights reserved.
              </p>
            </div>
          </div>
          \n{" "}
        </footer>
        \n{" "}
      </div>
      \n\n {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Clear Cart?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear your entire cart? This action
                cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmClearCart}
                  className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold"
                >
                  Yes, Clear Cart
                </button>
                <button
                  onClick={() => setShowClearCartModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-full hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default Home;
