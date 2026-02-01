import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, FileText, User, CreditCard, ArrowLeft } from "lucide-react";
import axiosInstance from "../../utils/axios";
import * as cartService from "../../utils/cartService";

function Checkout() {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: ""
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [cart, setCart] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        
        // Check authentication first
        const userData = localStorage.getItem("user");
        if (!userData) {
          localStorage.setItem("intendedDestination", "/checkout");
          navigate("/login");
          return;
        }
        
        console.log('🔄 Fetching cart for checkout...');
        
        // Fetch cart from backend
        const cartData = await cartService.getCart();
        
        console.log("✅ Cart data received:", {
          hasCart: !!cartData,
          itemCount: cartData?.items?.length || 0,
          restaurantId: cartData?.restaurant_id
        });
        
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          // No cart or empty cart - redirect to home
          alert("Your cart is empty. Please add items before checking out.");
          navigate("/");
          return;
        }
        
        setCart(cartData);
        
        // Fetch restaurant details if restaurant_id exists
        if (cartData.restaurant_id) {
          try {
            const restaurantResponse = await axiosInstance.get("/api/v1/restaurants");
            if (restaurantResponse.data.status === "success") {
              const foundRestaurant = restaurantResponse.data.data.restaurants.find(
                (r) => r._id === cartData.restaurant_id
              );
              
              if (foundRestaurant) {
                setRestaurant({
                  id: foundRestaurant._id,
                  name: foundRestaurant.restaurant_name,
                });
              }
            }
          } catch (restError) {
            console.error("Error fetching restaurant:", restError);
            // Continue even if restaurant fetch fails
          }
        }
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        alert("Failed to load checkout data. Please try again.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate]);

  const handleConfirmOrder = async () => {
    // Validate delivery address fields
    if (!deliveryAddress.street.trim() || !deliveryAddress.city.trim() || 
        !deliveryAddress.state.trim() || !deliveryAddress.zip_code.trim() || 
        !deliveryAddress.country.trim()) {
      alert("Please fill in all delivery address fields");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create order from cart via backend API
      const orderPayload = {
        delivery_address: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zip_code: deliveryAddress.zip_code,
          country: deliveryAddress.country
        },
        payment_method: "cash",
        special_instructions: specialInstructions || undefined
      };
      
      const response = await axiosInstance.post("/api/v1/orders/", orderPayload);
      
      if (response.data.status === "success") {
        // Show success message
        alert("Order placed successfully!");
        
        // Navigate to order status page
        navigate("/orderStatus");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      
      if (error.response?.data?.message) {
        alert(`Failed to place order: ${error.response.data.message}`);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Review & Place Order</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                    placeholder="e.g., 123 Main Street, Apt 4B"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                      placeholder="e.g., New York"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, state: e.target.value})}
                      placeholder="e.g., NY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.zip_code}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, zip_code: e.target.value})}
                      placeholder="e.g., 10001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.country}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, country: e.target.value})}
                      placeholder="e.g., USA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Special Instructions
                </h2>
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special delivery instructions? (e.g., Please ring the doorbell twice)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium w-20">Name:</span>
                  <span className="text-gray-900">{user.name || "Customer"}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium w-20">Phone:</span>
                  <span className="text-gray-900">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium w-20">Email:</span>
                  <span className="text-gray-900">{user.email || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary">
                <span className="text-3xl">💵</span>
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Your order from
              </h2>
              <p className="text-xl font-bold text-primary mb-6">
                {restaurant?.name || "Restaurant"}
              </p>

              {/* Items List */}
              <div className="space-y-3 mb-4 border-b border-gray-200 pb-4 max-h-64 overflow-y-auto">
                {cart && cart.items && cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-primary">{item.quantity}x</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {item.food_id?.name || `Item #${item.food_id?.slice?.(-6) || index + 1}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${item.total_price?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">${cart?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">${cart?.delivery_charge?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary text-xl">${cart?.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmOrder}
                disabled={submitting}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                  submitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Placing Order...
                  </span>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
