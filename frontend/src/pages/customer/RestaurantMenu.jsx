import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import { mockRestaurants, mockMenuItems } from "./mockData";

function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const foundRestaurant = mockRestaurants.find((r) => r.id === parseInt(id));
    if (foundRestaurant) {
      setRestaurant(foundRestaurant);
      setMenuItems(mockMenuItems[id] || []);
    } else {
      navigate("/customer-dashboard");
    }
  }, [id, navigate]);

  const categories = menuItems.length
    ? ["All", ...new Set(menuItems.map((item) => item.category))]
    : ["All"];

  // Expand items with variants into separate items
  const expandedMenuItems = menuItems.flatMap((item) => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.map((variant, index) => ({
        ...item,
        id: `${item.id}-${index}`,
        name: `${item.name} (${variant.name})`,
        price: variant.price,
        variants: null, // Remove variants from expanded items
      }));
    }
    return [item];
  });

  const filteredItems =
    selectedCategory === "All"
      ? expandedMenuItems
      : expandedMenuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item) => {
    const cartItem = {
      ...item,
      finalPrice: item.price,
      quantity: 1,
      cartId: `${Date.now()}-${Math.random()}`, // Ensure unique ID
    };
    setCart([...cart, cartItem]);
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );
  const deliveryFee = restaurant?.deliveryFee || 0;
  const total = subtotal + deliveryFee;
  const minOrder = 50; // Fixed minimum order amount

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Save order data for checkout page
    const checkoutData = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.finalPrice
      })),
      subtotal,
      deliveryFee,
      total,
    };
    
    localStorage.setItem("pendingCheckout", JSON.stringify(checkoutData));
    
    // Check if user is authenticated
    const userData = localStorage.getItem("user");
    if (!userData) {
      // Guest user - save intended destination and redirect to login
      localStorage.setItem("intendedDestination", "/customer-dashboard/checkout");
      navigate("/login");
      return;
    }
    
    // Authenticated user - proceed to checkout
    navigate("/customer-dashboard/checkout");
  };

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
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <span className="text-5xl">{restaurant.image}</span>
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
                  <span className="font-semibold">{restaurant.rating}</span>
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
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-4xl">{item.image}</span>
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
                          <p className="text-lg font-bold text-primary">
                            ৳{item.price}
                          </p>
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
              ))}
            </div>
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Cart ({cart.length})
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🛒</p>
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.cartId}
                        className="border-b border-gray-200 pb-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.cartId, item.quantity - 1)
                              }
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.cartId, item.quantity + 1)
                              }
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-sm">
                            ৳{item.finalPrice * item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    disabled={subtotal < minOrder}
                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors ${
                      subtotal >= minOrder
                        ? "bg-secondary text-white hover:bg-secondary/90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {subtotal < minOrder
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
