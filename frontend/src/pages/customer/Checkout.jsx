import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import LocationPickerModal from "../../components/Map/LocationPickerModal";

function Checkout() {
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Check authentication first
    const userData = localStorage.getItem("user");
    if (!userData) {
      localStorage.setItem("intendedDestination", "/customer-dashboard/checkout");
      navigate("/login");
      return;
    }
    
    // Get order data from localStorage
    const pendingOrder = JSON.parse(localStorage.getItem("pendingCheckout") || "null");
    
    if (!pendingOrder) {
      navigate("/customer-dashboard");
      return;
    }
    
    setOrderData(pendingOrder);
  }, [navigate]);

  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    setShowLocationPicker(false);
    
    // Try to update backend with delivery location (optional - works without backend)
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng
        })
      }).catch(err => console.warn('Backend not available, continuing with mock data:', err));
    }
  };

  const handleConfirmOrder = () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address");
      return;
    }

    if (!deliveryLocation) {
      alert("Please select your delivery location on the map");
      return;
    }

    // Create final order with delivery address and location
    const newOrder = {
      ...orderData,
      deliveryAddress,
      deliveryLocation: {
        type: 'Point',
        coordinates: [deliveryLocation.lng, deliveryLocation.lat]
      },
      id: `ORD${Date.now()}`,
      status: "pending",
      orderTime: new Date().toLocaleString(),
      isActive: true,
    };

    // Save to orders
    const existingOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
    localStorage.setItem("customerOrders", JSON.stringify([newOrder, ...existingOrders]));
    
    // Clear pending checkout
    localStorage.removeItem("pendingCheckout");
    
    // Navigate to orders page
    navigate("/customer-dashboard/orders");
  };

  if (!orderData) {
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
                📍 Delivery Location & Address
              </h2>
              
              {/* Map Location Picker Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    deliveryLocation
                      ? 'bg-secondary/10 text-secondary border-2 border-secondary'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {deliveryLocation ? (
                    <span className="flex items-center justify-center gap-2">
                      ✓ Location Selected ({deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)})
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      📍 Select Delivery Location on Map
                    </span>
                  )}
                </button>
                {deliveryLocation && (
                  <p className="text-sm text-gray-600 mt-2">
                    Click to change location
                  </p>
                )}
              </div>

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
                {orderData.restaurantName}
              </p>

              {/* Items List */}
              <div className="space-y-3 mb-4 border-b border-gray-200 pb-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">{item.quantity} x </span>
                      <span className="text-sm text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{orderData.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">৳{orderData.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary">৳{orderData.total}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmOrder}
                className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        title="Select Your Delivery Location"
      />
    </div>
  );
}

export default Checkout;
