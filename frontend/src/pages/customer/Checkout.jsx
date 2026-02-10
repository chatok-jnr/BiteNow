import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  MapPin,
  FileText,
  User,
  CreditCard,
  ArrowLeft,
  Plus,
  Home,
  Briefcase,
  Edit,
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import * as cartService from "../../utils/cartService";
import {
  getCustomerAddresses,
  getCustomerProfile,
} from "../../utils/customerService";
import { useNotification } from "../../contexts/NotificationContext";

function Checkout() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [cart, setCart] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Editable contact information for this order only
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  // Store original profile data for Cancel button
  const [originalContactInfo, setOriginalContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

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

        const userObj = JSON.parse(userData);
        const customerId =
          userObj.id || userObj.userId || userObj._id || userObj.customer_id;

        console.log(
          "🔄 Fetching cart, addresses, and user profile for checkout...",
        );

        // Fetch user profile to get latest contact information from database
        try {
          const profileResponse = await getCustomerProfile(customerId);

          // Access customer data from response (backend returns it in data.userRespone)
          const latestProfile = profileResponse.data?.userRespone;

          if (
            latestProfile &&
            (latestProfile.name || latestProfile.email || latestProfile.phone)
          ) {
            const profileData = {
              name: latestProfile.name || "",
              phone: latestProfile.phone || "",
              email: latestProfile.email || "",
            };

            // Update contactInfo with latest profile data from database
            setContactInfo(profileData);
            setOriginalContactInfo(profileData);
            console.log(
              "✅ Contact information auto-filled from database:",
              profileData,
            );
          } else {
            console.warn(
              "⚠️ Customer data not found. Please update your profile.",
            );
          }
        } catch (profileError) {
          console.error("❌ Error fetching user profile:", profileError);
        }

        // Fetch cart from backend
        const cartData = await cartService.getCart();

        console.log("✅ Cart data received:", {
          hasCart: !!cartData,
          itemCount: cartData?.items?.length || 0,
          restaurantId: cartData?.restaurant_id,
        });

        if (!cartData || !cartData.items || cartData.items.length === 0) {
          // No cart or empty cart - redirect to home
          showWarning(
            "Your cart is empty. Please add items before checking out.",
          );
          setTimeout(() => navigate("/"), 1500);
          return;
        }

        setCart(cartData);

        // Fetch saved addresses
        try {
          const addressResponse = await getCustomerAddresses(customerId);
          const addresses = addressResponse.data?.addresses || [];
          setSavedAddresses(addresses);

          // Auto-select default address
          const defaultAddr = addresses.find((addr) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
          } else if (addresses.length > 0) {
            // If no default, select first address
            setSelectedAddressId(addresses[0]._id);
          }
        } catch (addressError) {
          console.error("Error fetching addresses:", addressError);
          // Continue even if address fetch fails
        }

        // Fetch restaurant details if restaurant_id exists
        if (cartData.restaurant_id) {
          try {
            const restaurantResponse = await axiosInstance.get(
              "/api/v1/restaurants",
            );
            if (restaurantResponse.data.status === "success") {
              const foundRestaurant =
                restaurantResponse.data.data.restaurants.find(
                  (r) => r._id === cartData.restaurant_id,
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
        showError("Failed to load checkout data. Please try again.");
        setTimeout(() => navigate("/"), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate, showError, showWarning]);

  const handleConfirmOrder = async () => {
    // Validate address selection
    if (!selectedAddressId) {
      showWarning("Please select a delivery address");
      return;
    }

    const selectedAddress = savedAddresses.find(
      (addr) => addr._id === selectedAddressId,
    );

    if (!selectedAddress) {
      showError("Invalid address selected");
      return;
    }

    try {
      setSubmitting(true);

      // Create order from cart via backend API
      const orderPayload = {
        delivery_address: {
          street: selectedAddress.address,
          city: "City", // You may want to add city to your address model
          state: "State", // You may want to add state to your address model
          zip_code: "00000", // You may want to add zip_code to your address model
          country: "Country", // You may want to add country to your address model
        },
        payment_method: "cash",
        special_instructions: specialInstructions || undefined,
      };

      const response = await axiosInstance.post(
        "/api/v1/orders/",
        orderPayload,
      );

      if (response.data.status === "success") {
        // Show success message
        showSuccess("Order placed successfully!");

        // Navigate to order status page
        setTimeout(() => navigate("/orderStatus"), 1500);
      }
    } catch (error) {
      console.error("Error placing order:", error);

      if (error.response?.data?.message) {
        showError(`Failed to place order: ${error.response.data.message}`);
      } else {
        showError("Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getLabelIcon = (label) => {
    switch (label?.toLowerCase()) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "office":
      case "work":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getLabelColor = (label) => {
    switch (label?.toLowerCase()) {
      case "home":
        return "bg-blue-100 text-blue-600";
      case "office":
      case "work":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-green-100 text-green-600";
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
            <h1 className="text-2xl font-bold text-gray-900">
              Review & Place Order
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                <button
                  onClick={() => navigate("/addresses")}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Manage Addresses
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No saved addresses found</p>
                  <button
                    onClick={() => navigate("/address/add")}
                    className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-accent transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getLabelColor(
                            address.label,
                          )}`}
                        >
                          {getLabelIcon(address.label)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {address.label || "Other"}
                            </h3>
                            {address.isDefault && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {address.address}
                          </p>
                          {address.latitude && address.longitude && (
                            <p className="text-xs text-gray-400 mt-1">
                              📍 {address.latitude.toFixed(4)},{" "}
                              {address.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>
                        {selectedAddressId === address._id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                {!isEditingContact ? (
                  <button
                    onClick={() => setIsEditingContact(true)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit for this order
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingContact(false);
                        // Reset to original profile data
                        setContactInfo(originalContactInfo);
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditingContact(false)}
                      className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {isEditingContact ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) =>
                        setContactInfo({ ...contactInfo, name: e.target.value })
                      }
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Changes here are for this delivery
                      only and won't update your profile.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium w-20">
                      Name:
                    </span>
                    <span className="text-gray-900">
                      {contactInfo.name || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium w-20">
                      Phone:
                    </span>
                    <span className="text-gray-900">
                      {contactInfo.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium w-20">
                      Email:
                    </span>
                    <span className="text-gray-900">
                      {contactInfo.email || "Not provided"}
                    </span>
                  </div>
                </div>
              )}
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
                  <p className="font-semibold text-gray-900">
                    Cash on Delivery
                  </p>
                  <p className="text-sm text-gray-600">
                    Pay when you receive your order
                  </p>
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
                {cart &&
                  cart.items &&
                  cart.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-primary">
                            {item.quantity}x
                          </span>
                          <span className="text-sm text-gray-900 font-medium">
                            {item.food_id?.name ||
                              `Item #${item.food_id?.slice?.(-6) || index + 1}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ৳{item.total_price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ৳{cart?.subtotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">
                    ৳{cart?.delivery_charge?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary text-xl">
                    ৳{cart?.total_amount?.toFixed(2) || "0.00"}
                  </span>
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
