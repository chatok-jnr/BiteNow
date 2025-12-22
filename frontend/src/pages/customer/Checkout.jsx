import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import * as cartService from "../../utils/cartService";
import axiosInstance from "../../utils/axios";

function Checkout() {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
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
          localStorage.setItem("intendedDestination", "/customer-dashboard/checkout");
          navigate("/login");
          return;
        }
        
        // Fetch cart from backend
        const cartData = await cartService.getCart();
        
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          // No cart or empty cart - redirect to dashboard
          navigate("/customer-dashboard");
          return;
        }
        
        setCart(cartData);
        
        // Fetch restaurant details
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
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        alert("Failed to load checkout data. Please try again.");
        navigate("/customer-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate]);

  const handleConfirmOrder = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create order via backend API
      const orderPayload = {
        restaurant_id: cart.restaurant_id,
        delivery_address: deliveryAddress,
        payment_method: "cash_on_delivery",
        // Items are already in the cart on backend
      };
      
      const response = await axiosInstance.post("/api/v1/orders", orderPayload);
      
      if (response.data.status === "success") {
        // Clear the cart after successful order
        await cartService.clearCart();
        
        // Show success message
        alert("Order placed successfully!");
        
        // Navigate to orders page
        navigate("/customer-dashboard/orders");
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
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Review & Place Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📍 Delivery Address
              </h2>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address (House/Flat, Street, Area, City)"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                👤 Personal Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-medium w-20">Name:</span>
                  <span className="text-gray-900">{user.name || "Customer"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-medium w-20">Phone:</span>
                  <span className="text-gray-900">{user.phone || "+880 1XXX-XXXXXX"}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-medium w-20">Email:</span>
                  <span className="text-gray-900">{user.email || "customer@example.com"}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💳 Payment Method
              </h2>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-primary">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your order from
              </h2>
              <p className="text-lg font-semibold text-primary mb-6">
                {restaurant?.name || "Restaurant"}
              </p>

              {/* Items List */}
              <div className="space-y-3 mb-4 border-b border-gray-200 pb-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">{item.quantity} x </span>
                      <span className="text-sm text-gray-900">
                        Item #{item.food_id.slice(-6)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ৳{item.total_price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{cart.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">৳{cart.delivery_charge}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary">৳{cart.total_amount}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmOrder}
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  submitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-secondary text-white hover:bg-secondary/90"
                }`}
              >
                {submitting ? "Placing Order..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
