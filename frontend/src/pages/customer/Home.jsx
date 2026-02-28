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
import Footer from "../../components/Footer";
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

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [heroSlides.length]);

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
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCartOpen && cartItems.length > 0 ? "sm:mr-96" : "mr-0"
        }`}
      >
        {/* Premium Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-large transition-all duration-400">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <div
                onClick={() => navigate("/")}
                className="group flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-accent rounded-lg sm:rounded-xl flex items-center justify-center shadow-glow-yellow transform group-hover:rotate-12 transition-all duration-300">
                  <span className="text-xl sm:text-2xl">🍔</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold text-white font-display tracking-tight">
                  BiteNow
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 sm:p-2.5 text-white hover:text-accent-light transition-all duration-300 hover:scale-110"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-glow-red animate-pulse-slow">
                      {cartItems.length}
                    </span>
                  )}
                </button>
                {!isLoggedIn ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-gradient-accent text-textPrimary px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-xl-yellow transition-all transform hover:-translate-y-0.5 font-semibold text-xs sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden xs:inline">Login / Sign Up</span>
                    <span className="xs:hidden">Login</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/")}
                      className="glass-card text-textPrimary px-2 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-semibold flex items-center gap-1 sm:gap-2 hover:shadow-soft transition-all text-xs sm:text-sm"
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span className="hidden lg:inline">Home</span>
                    </button>
                    <button
                      onClick={() => navigate("/orderStatus")}
                      className="text-white hover:text-accent-light transition-all font-medium px-2 py-2 sm:px-3 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 text-xs sm:text-sm"
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden lg:inline">Orders</span>
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="text-white hover:text-accent-light transition-all font-medium px-2 py-2 sm:px-3 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 text-xs sm:text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline">Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("guest_session_id");
                        setIsLoggedIn(false);
                        navigate("/login");
                      }}
                      className="text-white hover:text-red-300 transition-all font-medium px-2 py-2 sm:px-3 sm:py-2 flex items-center gap-1 sm:gap-2 hover:scale-105 text-xs sm:text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        {/* Premium Hero Slider */}
        <div className="relative h-screen overflow-hidden mt-16 sm:mt-20">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute inset-0 bg-mesh-gradient opacity-20" />

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-20">
                <div className="max-w-5xl mx-auto">
                  <div className="bg-secondary/80 backdrop-blur-lg rounded-3xl p-8 md:p-14 border border-white/20 shadow-glass animate-fade-in-up">
                    <h2 className="text-4xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-2xl text-white/95 leading-relaxed max-w-3xl">
                      {slide.description}
                    </p>
                    <button
                      className="mt-8 font-bold px-8 py-4 rounded-xl shadow-xl-red hover:shadow-glow-red transform hover:-translate-y-1 transition-all duration-300 text-lg"
                      style={{ backgroundColor: "#E63946", color: "white" }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:shadow-glow-red transition-all duration-300 hover:scale-110 group"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:shadow-glow-red transition-all duration-300 hover:scale-110 group"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-400 ${
                  index === currentSlide
                    ? "bg-white w-10 sm:w-12 shadow-glow-yellow"
                    : "bg-white/50 w-6 sm:w-8 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
        {/* Top 4 Most Sold Foods */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4">
              <span className="gradient-text">Most Popular</span> Dishes
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
              Discover what everyone's craving. Our most-loved dishes delivered
              fresh to your door.
            </p>
            <div className="w-20 sm:w-24 h-1.5 bg-gradient-primary mx-auto rounded-full shadow-glow-red"></div>
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
        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="mb-8 sm:mb-12">
              <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4">
                  Explore{" "}
                  <span className="gradient-text-accent">Restaurants</span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
                  Browse through our curated selection of top-rated restaurants
                  near you.
                </p>
                <div className="w-20 sm:w-24 h-1.5 bg-gradient-accent mx-auto rounded-full shadow-glow-yellow"></div>
              </div>
              <div className="flex justify-end mt-6 sm:mt-8">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-gray-700 font-semibold cursor-pointer hover:border-accent transition-all shadow-soft hover:shadow-medium text-sm sm:text-base"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price-low">Sort by Price: Low to High</option>
                  <option value="price-high">Sort by Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse"
                  >
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
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
                  <div className="text-center mt-12 sm:mt-16">
                    <button
                      onClick={() => setRestaurantPage(restaurantPage + 1)}
                      className="bg-gradient-accent text-textPrimary px-8 py-3 sm:px-12 sm:py-4 rounded-xl hover:shadow-xl-yellow transition-all font-bold text-base sm:text-lg transform hover:-translate-y-1 duration-300"
                    >
                      Load More Restaurants
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Premium Footer */}
        <Footer />
      </div>
      {/* Premium Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-large transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-soft">
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-2 sm:mb-3 font-display">
                Clear Cart?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Are you sure you want to clear your entire cart? This action
                cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmClearCart}
                  className="w-full bg-gradient-primary text-white py-3 sm:py-4 rounded-xl hover:shadow-xl-red transition-all font-bold text-base sm:text-lg transform hover:-translate-y-0.5 duration-300"
                >
                  Yes, Clear Cart
                </button>
                <button
                  onClick={() => setShowClearCartModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 sm:py-4 rounded-xl hover:bg-gray-200 transition-all font-semibold text-base sm:text-lg"
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
