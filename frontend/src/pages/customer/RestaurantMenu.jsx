import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import axiosInstance from "../../utils/axios";
import * as cartService from "../../utils/cartService";

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

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

  // Fetch existing cart on page load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const existingCart = await cartService.getCart();
        
        if (existingCart) {
          setCart(existingCart);
        }
      } catch (error) {
        // Cart fetch errors are not critical - user can still browse
        console.log('ℹ️ No existing cart found');
      }
    };

    if (id) {
      fetchCart();
    }
  }, [id]);

  // Fetch restaurant and food items from API
  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantResponse = await axiosInstance.get("/api/v1/restaurants");
        
        if (restaurantResponse.data.status === "success") {
          const foundRestaurant = restaurantResponse.data.data.restaurants.find(
            (r) => r._id === id
          );
          
          if (!foundRestaurant) {
            navigate("/customer-dashboard");
            return;
          }

          // Transform restaurant data
          const transformedRestaurant = {
            id: foundRestaurant._id,
            name: foundRestaurant.restaurant_name,
            cuisine: foundRestaurant.restaurant_category.join(", "),
            rating: foundRestaurant.restaurant_rating.average || 0,
            deliveryTime: "25-35",
            deliveryFee: 30,
            image: "🍽️",
            address: foundRestaurant.restaurant_address,
            restaurantImage: foundRestaurant.restaurant_image.url,
          };

          setRestaurant(transformedRestaurant);

          // Fetch food items for this restaurant
          const foodResponse = await axiosInstance.get(
            `/api/v1/food/restaurant/${id}`
          );

          if (foodResponse.data.status === "success") {
            // Transform food items data
            const transformedFoodItems = foodResponse.data.data.foods.map((food) => ({
              id: food._id,
              restaurant_id: food.restaurant_id, // Include restaurant_id for cart validation
              name: food.food_name,
              description: food.food_description,
              price: food.discounted_price || food.food_price,
              originalPrice: food.food_price,
              category: food.tags && food.tags.length > 0 ? food.tags[0] : "Other",
              image: "🍔", // Default emoji
              popular: food.average_rating >= 4.0,
              available: food.is_available && food.in_stock,
              rating: food.average_rating,
              foodImage: food.food_image.url,
              tags: food.tags,
              quantity: food.food_quantity,
            }));

            // Filter only available items
            const availableItems = transformedFoodItems.filter((item) => item.available);
            setMenuItems(availableItems);
          }
        }
      } catch (err) {
        console.error("Error fetching restaurant/menu:", err);
        setError("Failed to load restaurant menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantAndMenu();
    }
  }, [id, navigate]);

  const categories = menuItems.length
    ? ["All", ...new Set(menuItems.map((item) => item.category))]
    : ["All"];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addToCart = async (item) => {
    try {
      setCartLoading(true);
      
      // Use the cart state that was already fetched on page load
      // Only fetch again if cart state is null (shouldn't happen normally)
      let currentCart = cart;
      
      if (!currentCart) {
        try {
          currentCart = await cartService.getCart();
          setCart(currentCart);
        } catch (error) {
          console.log('ℹ️ No existing cart found');
        }
      }
      
      // Check if current cart exists and is from a different restaurant
      // Compare the food item's restaurant_id with the cart's restaurant_id
      if (currentCart && currentCart.restaurant_id && item.restaurant_id) {
        // Handle both populated and non-populated restaurant_id
        const cartRestaurantId = typeof currentCart.restaurant_id === 'object' 
          ? currentCart.restaurant_id._id?.toString().trim() 
          : currentCart.restaurant_id.toString().trim();
          
        const foodRestaurantId = item.restaurant_id.toString().trim();
        
        console.log('🔍 Restaurant Validation:', {
          cart_restaurant_id_raw: currentCart.restaurant_id,
          cart_restaurant_id_final: cartRestaurantId,
          food_restaurant_id_raw: item.restaurant_id,
          food_restaurant_id_final: foodRestaurantId,
          are_equal: cartRestaurantId === foodRestaurantId
        });
        
        if (cartRestaurantId !== foodRestaurantId) {
          console.log('⚠️ Cart is from different restaurant');
          
          const confirmSwitch = window.confirm(
            "You have items from another restaurant in your cart. Adding this item will clear your current cart. Continue?"
          );
          
          if (!confirmSwitch) {
            setCartLoading(false);
            return;
          }
          
          // Clear existing cart
          console.log('🗑️ Clearing cart from different restaurant');
          await cartService.clearCart();
          setCart(null);
          currentCart = null;
        } else {
          console.log('✅ Cart is from same restaurant, proceeding to add item');
        }
      } else {
        console.log('ℹ️ No existing cart or new cart, proceeding to add item');
      }
      
      // Add item to cart
      console.log('➕ Adding item to cart via API');
      const updatedCart = await cartService.addToCart(item.id, 1);
      console.log('✅ Cart updated:', updatedCart);
      setCart(updatedCart);
      
      // Show success notification
      setShowCart(true);
      setTimeout(() => setShowCart(false), 2000);
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      console.error("Error response:", error.response?.data);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        // If it's the "different restaurant" error, offer to clear cart
        if (errorMessage.includes('different restaurant')) {
          const confirmClear = window.confirm(
            `${errorMessage}\n\nWould you like to clear your current cart and add this item?`
          );
          
          if (confirmClear) {
            try {
              await cartService.clearCart();
              setCart(null);
              // Retry adding the item
              const updatedCart = await cartService.addToCart(item.id, 1);
              setCart(updatedCart);
              setShowCart(true);
              setTimeout(() => setShowCart(false), 2000);
            } catch (retryError) {
              console.error("Failed to retry adding item:", retryError);
              alert("Failed to add item. Please try again.");
            }
          }
        } else {
          alert(errorMessage);
        }
      } else {
        alert("Failed to add item to cart. Please try again.");
      }
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (foodId) => {
    try {
      setCartLoading(true);
      console.log('🗑️ Removing from cart:', {
        foodId,
        currentCart: cart
      });
      
      const updatedCart = await cartService.removeFromCart(foodId, 'all');
      console.log('✅ Cart after removal:', updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error("❌ Error removing from cart:", error);
      console.error("Error response:", error.response?.data);
      
      // Show user-friendly error message
      const errorMsg = error.response?.data?.message || "Failed to remove item from cart. Please try again.";
      alert(errorMsg);
      
      // Refresh cart to get current state
      try {
        const currentCart = await cartService.getCart();
        setCart(currentCart);
      } catch (refreshError) {
        console.error("Failed to refresh cart:", refreshError);
      }
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (foodId, currentQuantity, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromCart(foodId);
      return;
    }
    
    try {
      setCartLoading(true);
      
      const quantityDiff = newQuantity - currentQuantity;
      
      if (quantityDiff > 0) {
        // Add more items
        const updatedCart = await cartService.addToCart(foodId, quantityDiff);
        setCart(updatedCart);
      } else {
        // Remove items
        const updatedCart = await cartService.removeFromCart(foodId, Math.abs(quantityDiff));
        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  // Helper function to get cart item by food ID
  const getCartItem = (foodId) => {
    if (!cart || !cart.items) return null;
    return cart.items.find(item => item.food_id === foodId);
  };

  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.delivery_charge || restaurant?.deliveryFee || 50;
  const total = cart?.total_amount || 0;
  const minOrder = 50; // Fixed minimum order amount

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    
    // Check if user is authenticated
    const userData = localStorage.getItem("user");
    if (!userData) {
      // Guest user - must login to checkout
      alert("Please login or signup to complete your order");
      localStorage.setItem("intendedDestination", `/customer-dashboard/restaurant/${id}`);
      navigate("/login");
      return;
    }
    
    // Authenticated user - proceed to checkout
    navigate("/customer-dashboard/checkout");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading menu...</p>
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
                onClick={() => navigate("/customer-dashboard")}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
                {restaurant.restaurantImage ? (
                  <img 
                    src={restaurant.restaurantImage} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{restaurant.image}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🕒</span>
                  <span>{restaurant.deliveryTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>💵</span>
                  <span>৳{restaurant.deliveryFee} delivery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📦</span>
                  <span>Min: ৳50</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/customer-dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-2 bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-4xl mb-2">🍽️</p>
                  <p className="text-gray-600">No items available in this category</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.foodImage ? (
                          <img 
                            src={item.foodImage} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">{item.image}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                              {item.popular && (
                                <span className="ml-2 text-xs bg-secondary text-white px-2 py-1 rounded">
                                  Popular
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-bold text-primary">
                                ৳{item.price}
                              </p>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-sm text-gray-400 line-through">
                                  ৳{item.originalPrice}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="mt-3 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Cart ({cart?.items?.length || 0})
              </h2>

              {!cart || !cart.items || cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🛒</p>
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => {
                      // food_id can be either a string (ID) or object (populated)
                      const foodId = typeof item.food_id === 'object' ? item.food_id._id : item.food_id;
                      const foodName = typeof item.food_id === 'object' && item.food_id.food_name 
                        ? item.food_id.food_name 
                        : menuItems.find(m => m.id === foodId)?.name || 'Unknown Item';
                      
                      return (
                        <div
                          key={item._id || foodId}
                          className="border-b border-gray-200 pb-3"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {foodName}
                              </h4>
                            </div>
                            <button
                              onClick={() => removeFromCart(foodId)}
                              disabled={cartLoading}
                              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateQuantity(foodId, item.quantity, item.quantity - 1)
                                }
                                disabled={cartLoading}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(foodId, item.quantity, item.quantity + 1)
                                }
                                disabled={cartLoading}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-semibold text-sm">
                              ৳{item.total_price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-300 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">৳{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                      <span>Total</span>
                      <span className="text-primary">৳{total}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={subtotal < minOrder || cartLoading}
                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
                      subtotal >= minOrder && !cartLoading
                        ? "bg-secondary text-white hover:bg-secondary/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {cartLoading
                      ? "Updating..."
                      : subtotal < minOrder
                      ? `Min order: ৳${minOrder}`
                      : "Checkout"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Notification */}
      {showCart && (
        <div className="fixed top-24 right-4 bg-secondary text-white px-6 py-4 rounded-lg shadow-xl z-50">
          <p className="font-semibold">✓ Added to cart!</p>
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;
