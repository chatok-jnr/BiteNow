import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Navigation,
  CheckCircle,
  Star,
  User,
  UserCircle,
  X,
  LogOut,
} from "lucide-react";
import ApprovalMessage from "../../components/ApprovalMessage";
import Footer from "../../components/Footer";
import axiosInstance from "../../utils/axios";
import RiderMap from "./RiderMap";
import { useNotification } from "../../contexts/NotificationContext";

const Home = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerPin, setCustomerPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [completedOrders, setCompletedOrders] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [riderStatus, setRiderStatus] = useState(null);
  const [riderStats, setRiderStats] = useState({
    todaysEarnings: "0.00",
    deliveriesCompleted: 0,
    availableRequests: 0,
  });

  const [activeOrders, setActiveOrders] = useState([]);
  const [riderProfile, setRiderProfile] = useState({
    image: null,
    gender: null,
    name: null,
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch order requests and accepted orders from API
  useEffect(() => {
    // Fetch rider profile first (includes status check from API)
    // This will call GET /api/v1/riders/profile to get rider data including account_status
    fetchRiderProfile();
    fetchOrderRequests();
    fetchAcceptedOrders();
    fetchRiderStats();
  }, []);

  const fetchOrderRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/v1/order/rider");

      if (response.data && response.data.data && response.data.data.needRider) {
        // Transform API data to match component structure
        const transformedOrders = response.data.data.needRider.map((order) => {
          // Extract delivery address - handle string or object formats
          let deliveryAddress = "Delivery Location";

          // Check if delivery_address is a string
          if (
            typeof order.delivery_address === "string" &&
            order.delivery_address
          ) {
            deliveryAddress = order.delivery_address;
          }
          // Check if delivery_address is an object with street property (GeoJSON format)
          else if (
            order.delivery_address &&
            typeof order.delivery_address === "object"
          ) {
            if (order.delivery_address.street) {
              deliveryAddress = order.delivery_address.street;
            } else if (
              order.delivery_address.city ||
              order.delivery_address.country
            ) {
              // Build address from available fields
              const parts = [];
              if (order.delivery_address.city)
                parts.push(order.delivery_address.city);
              if (
                order.delivery_address.country &&
                order.delivery_address.country !== "Country"
              )
                parts.push(order.delivery_address.country);
              if (parts.length > 0) {
                deliveryAddress = parts.join(", ");
              }
            }
          }
          // Check delivery_address_text field
          else if (order.delivery_address_text) {
            deliveryAddress = order.delivery_address_text;
          }
          // Check customer address
          else if (
            typeof order.customer_id?.address === "string" &&
            order.customer_id.address
          ) {
            deliveryAddress = order.customer_id.address;
          }

          return {
            id: order._id,
            restaurant:
              order.restaurant_id?.restaurant_name || "Unknown Restaurant",
            restaurantImage:
              order.restaurant_id?.restaurant_image ||
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
            restaurantAddress: order.restaurant_id?.restaurant_address || "",
            customerName: order.customer_id?.name || "Customer",
            customerAddress: deliveryAddress,
            items: order.items?.map((item) => item.food_name) || [],
            orderValue: order.total_amount || 0,
            deliveryFee: order.delivery_charge || 0,
            distance: order.distance || "N/A",
            estimatedTime: order.estimated_delivery_time
              ? new Date(order.estimated_delivery_time).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit" },
                )
              : "N/A",
            orderTime: order.createdAt
              ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
          };
        });

        setOrderRequests(transformedOrders);
      }
    } catch (err) {
      console.error("Error fetching order requests:", err);
      setError(err.response?.data?.message || "Failed to fetch order requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchRiderStats = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/riders/stats");

      if (response.data && response.data.data) {
        setRiderStats({
          todaysEarnings: response.data.data.todaysEarnings,
          deliveriesCompleted: response.data.data.deliveriesCompleted,
          availableRequests: response.data.data.availableRequests,
        });
      }
    } catch (err) {
      console.error("Error fetching rider stats:", err);
      // Keep default values if error occurs
    }
  };

  const fetchRiderProfile = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/riders/profile");

      // Get rider data from response
      const riderData = response.data?.rider;

      if (riderData) {
        // Extract image URL - handle both string and object formats
        const imageData = riderData.image;
        const imageUrl =
          typeof imageData === "object" ? imageData?.url : imageData;

        // Update rider profile state
        setRiderProfile({
          image: imageUrl,
          gender: riderData.gender,
          name: riderData.name,
        });

        // Update rider status from API response
        if (riderData.account_status) {
          setRiderStatus(riderData.account_status);
        }
      }
    } catch (err) {
      console.error("Error fetching rider profile:", err);
      // Keep default values if error occurs
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/v1/orders/rider/my-order");

      if (response.data && response.data.myOrder) {
        // Transform API data to match component structure
        const transformedOrders = response.data.myOrder.map((order) => {
          // Extract restaurant image URL - handle both string and object formats
          const restaurantImageData = order.restaurant_id?.restaurant_image;
          const restaurantImageUrl =
            typeof restaurantImageData === "object"
              ? restaurantImageData?.url
              : restaurantImageData ||
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80";

          // Extract delivery address - handle string or object formats
          let deliveryAddress = "Delivery Location";

          // Check if delivery_address is a string
          if (
            typeof order.delivery_address === "string" &&
            order.delivery_address
          ) {
            deliveryAddress = order.delivery_address;
          }
          // Check if delivery_address is an object with street property (GeoJSON format)
          else if (
            order.delivery_address &&
            typeof order.delivery_address === "object"
          ) {
            if (order.delivery_address.street) {
              deliveryAddress = order.delivery_address.street;
            } else if (
              order.delivery_address.city ||
              order.delivery_address.country
            ) {
              // Build address from available fields
              const parts = [];
              if (order.delivery_address.city)
                parts.push(order.delivery_address.city);
              if (
                order.delivery_address.country &&
                order.delivery_address.country !== "Country"
              )
                parts.push(order.delivery_address.country);
              if (parts.length > 0) {
                deliveryAddress = parts.join(", ");
              }
            }
          }
          // Check delivery_address_text field
          else if (order.delivery_address_text) {
            deliveryAddress = order.delivery_address_text;
          }
          // Check customer address
          else if (
            typeof order.customer_id?.address === "string" &&
            order.customer_id.address
          ) {
            deliveryAddress = order.customer_id.address;
          }

          const transformedOrder = {
            id: order._id,
            restaurant:
              order.restaurant_id?.restaurant_name || "Unknown Restaurant",
            restaurantImage: restaurantImageUrl,
            restaurantAddress: order.restaurant_id?.restaurant_address || "",
            customerName: order.customer_id?.name || "Customer",
            customerPhone: order.customer_id?.phone || "",
            customerAddress: deliveryAddress,
            items: order.items?.map((item) => item.food_name) || [],
            orderValue: order.total_amount || 0,
            deliveryFee: order.delivery_charge || 0,
            distance: order.distance || "N/A",
            status: order.order_status || "preparing",
            riderPin: order.rider_pin || "",
            confirmationPin: order.customer_pin || "",
            acceptedTime: order.updatedAt
              ? new Date(order.updatedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            estimatedPickup: order.estimated_delivery_time
              ? new Date(order.estimated_delivery_time).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit" },
                )
              : "",
            pickedUpTime: order.picked_up_at
              ? new Date(order.picked_up_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            completedTime: order.delivered_at
              ? new Date(order.delivered_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            orderTime: order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
          };
          return transformedOrder;
        });

        // Filter orders by status
        const delivered = transformedOrders.filter(
          (order) => order.status.toLowerCase() === "delivered",
        );
        const active = transformedOrders.filter(
          (order) => order.status.toLowerCase() !== "delivered",
        );

        setCompletedOrders(delivered);
        setActiveOrders(active);
      }
    } catch (err) {
      console.error("Error fetching accepted orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      setError(null);

      // Get rider_id from localStorage (stored during login)
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const riderId = user?.id || user?._id;

      if (!riderId) {
        setError("Rider ID not found. Please login again.");
        return;
      }

      const response = await axiosInstance.patch(
        `/api/v1/order/rider/${orderId}`,
        {
          rider_id: riderId,
        },
      );

      // Backend returns {status: "Accepted", data: {...}} instead of {success: true}
      if (response.status === 200 && response.data) {
        // Remove from order requests
        setOrderRequests(orderRequests.filter((order) => order.id !== orderId));

        // Refresh both lists and stats
        await Promise.all([
          fetchOrderRequests(),
          fetchAcceptedOrders(),
          fetchRiderStats(),
        ]);

        // Switch to active orders tab
        setActiveTab("active");

        showSuccess("Order accepted successfully!");
      } else {
        showWarning(
          "Order acceptance response was unexpected. Please refresh the page.",
        );
      }
    } catch (err) {
      console.error("Error accepting order:", err);
      setError(err.response?.data?.message || "Failed to accept order");
      showError(err.response?.data?.message || "Failed to accept order");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      preparing: "Preparing",
      ready_for_pickup: "Ready to Pick Up",
      out_for_delivery: "Out for Delivery",
      picked_up: "Picked Up",
      on_the_way: "On the Way",
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "preparing":
        return "bg-blue-500";
      case "ready_for_pickup":
      case "ready to pick up":
        return "bg-purple-500";
      case "out_for_delivery":
      case "picked_up":
      case "on_the_way":
        return "bg-primary";
      default:
        return "bg-gray-500";
    }
  };

  const handleCompleteDelivery = (orderId) => {
    const order = activeOrders.find((order) => order.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowPinModal(true);
      setCustomerPin("");
      setPinError("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/rider/login");
  };

  const handleVerifyPin = async () => {
    if (!customerPin || customerPin.length !== 4) {
      setPinError("Please enter a 4-digit PIN");
      return;
    }

    try {
      setLoading(true);
      setPinError("");

      const response = await axiosInstance.patch(
        "/api/v1/orders/rider/verify-customer",
        {
          order_id: selectedOrder.id,
          customer_pin: customerPin,
        },
      );

      if (response.data && response.data.success) {
        // Move order to completed
        const newCompletedOrder = {
          id: selectedOrder.id,
          restaurant: selectedOrder.restaurant,
          restaurantImage: selectedOrder.restaurantImage,
          customerName: selectedOrder.customerName,
          customerAddress: selectedOrder.customerAddress,
          items: selectedOrder.items,
          deliveryFee: selectedOrder.deliveryFee,
          distance: selectedOrder.distance,
          completedTime: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          orderTime: selectedOrder.acceptedTime,
        };

        setCompletedOrders([newCompletedOrder, ...completedOrders]);
        setActiveOrders(
          activeOrders.filter((order) => order.id !== selectedOrder.id),
        );

        // Refresh stats to update today's earnings and deliveries
        await fetchRiderStats();

        // Close modal
        setShowPinModal(false);
        setSelectedOrder(null);
        setCustomerPin("");
      }
    } catch (err) {
      console.error("Error verifying PIN:", err);
      setPinError(
        err.response?.data?.message || "Invalid PIN. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const OrderRequestCard = ({ order }) => (
    <div className="bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={order.restaurantImage}
              alt={order.restaurant}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {order.restaurant}
              </h3>
              <p className="text-xs text-gray-600">#{order.id}</p>
            </div>
          </div>
          <div className="bg-orange-500 text-white px-2 py-1 rounded-full font-semibold text-xs">
            New
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-surface p-2 rounded-lg">
            <div className="flex items-center space-x-1 mb-0.5">
              <Navigation className="w-3 h-3 text-primary" />
              <p className="text-xs text-gray-600">Distance</p>
            </div>
            <p className="font-bold text-sm text-gray-800">{order.distance}</p>
          </div>
          <div className="bg-surface p-2 rounded-lg">
            <div className="flex items-center space-x-1 mb-0.5">
              <Clock className="w-3 h-3 text-primary" />
              <p className="text-xs text-gray-600">Est. Time</p>
            </div>
            <p className="font-bold text-sm text-gray-800">
              {order.estimatedTime}
            </p>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="mb-2 bg-surface p-2 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Pickup</p>
          <div className="flex items-start space-x-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700 line-clamp-1">
              {order.restaurant}
            </p>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="mb-3 bg-surface p-2 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Deliver To</p>
          <div className="flex items-start space-x-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700 line-clamp-2">
              {order.customerAddress}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Items ({order.items.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 2).map((item, index) => (
              <span
                key={index}
                className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs">
                +{order.items.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Earnings */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary/30 mb-3">
          <div>
            <p className="text-xs text-gray-600">Earnings</p>
            <p className="text-lg font-bold text-primary">
              ৳{order.deliveryFee.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Value</p>
            <p className="text-sm font-semibold text-gray-800">
              ৳{order.orderValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Accept Button */}
        <button
          onClick={() => {
            if (riderStatus !== "Approved") {
              showWarning(
                "Your account must be approved before you can accept orders",
              );
              return;
            }
            handleAcceptOrder(order.id);
          }}
          disabled={riderStatus !== "Approved"}
          className="w-full bg-primary text-white py-2 rounded-full hover:bg-accent-dark transition-all font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          {riderStatus !== "Approved" ? "Account Not Approved" : "Accept Order"}
        </button>
      </div>
    </div>
  );

  const ActiveOrderCard = ({ order }) => (
    <div className="bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={order.restaurantImage}
              alt={order.restaurant}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {order.restaurant}
              </h3>
              <p className="text-xs text-gray-600">#{order.id}</p>
            </div>
          </div>
          <div
            className={`${getStatusColor(order.status)} text-white px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap`}
          >
            {formatStatus(order.status)}
          </div>
        </div>

        {/* Rider PIN - Show to Restaurant only when ready_for_pickup */}
        {order.status === "ready_for_pickup" && (
          <div className="mb-3 bg-primary p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">
                  Your PIN (Show to Restaurant)
                </p>
              </div>
              <div className="bg-white px-4 py-1.5 rounded-lg">
                <p className="text-xl font-bold text-primary tracking-wider">
                  {order.riderPin || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="mb-3 bg-surface p-2 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-xs text-gray-800">
                  {order.customerName}
                </p>
                <p className="text-xs text-gray-600">{order.customerPhone}</p>
              </div>
            </div>
            <a
              href={`tel:${order.customerPhone}`}
              className="bg-primary text-white p-2 rounded-full hover:bg-accent-dark transition-all"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="mb-2 bg-surface p-2 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Pickup</p>
          <div className="flex items-start space-x-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700 line-clamp-1">
              {order.restaurant}
            </p>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="mb-3 bg-surface p-2 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Deliver To</p>
          <div className="flex items-start space-x-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700 line-clamp-2">
              {order.customerAddress}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Items ({order.items.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 2).map((item, index) => (
              <span
                key={index}
                className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs">
                +{order.items.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Earnings */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary/30 mb-3">
          <div>
            <p className="text-xs text-gray-600">Earnings</p>
            <p className="text-lg font-bold text-primary">
              ৳{order.deliveryFee.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Navigation className="w-3 h-3" />
            <span>{order.distance}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSelectedOrderId(order.id);
              setShowMapModal(true);
            }}
            className="bg-surface text-primary py-2 rounded-full hover:bg-bgPrimary transition-all font-semibold text-sm flex items-center justify-center gap-1"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>
          <button
            onClick={() => handleCompleteDelivery(order.id)}
            className="bg-primary text-white py-2 rounded-full hover:bg-accent-dark transition-all font-semibold text-sm"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );

  const CompletedOrderCard = ({ order }) => (
    <div className="bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={order.restaurantImage}
              alt={order.restaurant}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {order.restaurant}
              </h3>
              <p className="text-xs text-gray-600">#{order.id}</p>
            </div>
          </div>
          <div className="bg-green-600 text-white px-2 py-1 rounded-full flex items-center space-x-1 font-semibold text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Done</span>
          </div>
        </div>

        {/* Customer & Address */}
        <div className="mb-3 bg-surface p-2 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Delivered To
          </p>
          <div className="flex items-start space-x-1">
            <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-700 line-clamp-2">
              {order.customerAddress}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Items ({order.items.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 2).map((item, index) => (
              <span
                key={index}
                className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs">
                +{order.items.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-surface p-2 rounded-lg">
            <p className="text-xs text-gray-600">Order</p>
            <p className="font-semibold text-gray-800 text-xs">
              {order.orderTime}
            </p>
          </div>
          <div className="bg-surface p-2 rounded-lg">
            <p className="text-xs text-gray-600">Completed</p>
            <p className="font-semibold text-gray-800 text-xs">
              {order.completedTime}
            </p>
          </div>
        </div>

        {/* Earnings */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary/30">
          <div>
            <p className="text-xs text-gray-600">Earned</p>
            <p className="text-lg font-bold text-primary">
              ৳{order.deliveryFee.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Navigation className="w-3 h-3" />
            <span>{order.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {riderProfile.image ? (
                <img
                  src={riderProfile.image}
                  alt="Rider profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    console.error("Image failed to load:", riderProfile.image);
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                style={{ display: riderProfile.image ? "none" : "flex" }}
              >
                {riderProfile.gender?.toLowerCase() === "female" ? (
                  <UserCircle className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-primary" />
                )}
              </div>
              <span className="text-2xl font-bold text-white">
                {riderProfile.name || "BiteNow Rider"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/rider/profile")}
                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent-dark transition-all font-semibold flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-all font-semibold flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Stats Header */}
      <div className="bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <p className="text-white/80 text-sm mb-2">Today's Earnings</p>
              <p className="text-3xl font-bold text-white">
                ৳{riderStats.todaysEarnings}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <p className="text-white/80 text-sm mb-2">Deliveries Completed</p>
              <p className="text-3xl font-bold text-white">
                {riderStats.deliveriesCompleted}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <p className="text-white/80 text-sm mb-2">Available Requests</p>
              <p className="text-3xl font-bold text-white">
                {riderStats.availableRequests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
              activeTab === "requests"
                ? "bg-surface text-primary shadow-lg"
                : "bg-tertiary text-gray-600 hover:bg-surface/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Order Requests</span>
              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                {orderRequests.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
              activeTab === "active"
                ? "bg-surface text-primary shadow-lg"
                : "bg-tertiary text-gray-600 hover:bg-surface/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Bike className="w-5 h-5" />
              <span>Active Orders</span>
              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                {activeOrders.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-surface text-primary shadow-lg"
                : "bg-tertiary text-gray-600 hover:bg-surface/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Completed</span>
              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                {completedOrders.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Show approval notice if not approved */}
          {riderStatus && riderStatus !== "Approved" && (
            <div className="mb-6">
              <ApprovalMessage
                status={riderStatus}
                entityType="rider account"
                message="Your account is pending approval. You can view orders but cannot accept them until approved by admin."
              />
            </div>
          )}

          {activeTab === "requests" ? (
            <div>
              {orderRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderRequests.map((order) => (
                    <OrderRequestCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    No Available Requests
                  </h3>
                  <p className="text-gray-500">
                    New delivery requests will appear here
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "active" ? (
            <div>
              {activeOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOrders.map((order) => (
                    <ActiveOrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bike className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    No Active Orders
                  </h3>
                  <p className="text-gray-500">
                    Accept orders to start delivering
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {completedOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedOrders.map((order) => (
                    <CompletedOrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    No Completed Orders
                  </h3>
                  <p className="text-gray-500">
                    Completed deliveries will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* PIN Verification Modal */}
      {showPinModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Verify Customer PIN
              </h3>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setSelectedOrder(null);
                  setCustomerPin("");
                  setPinError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-tertiary p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-semibold text-gray-800">
                  #{selectedOrder.id}
                </p>
              </div>
              <div className="bg-tertiary p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Customer</p>
                <p className="font-semibold text-gray-800">
                  {selectedOrder.customerName}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter 4-Digit PIN
              </label>
              <input
                type="text"
                maxLength="4"
                pattern="[0-9]*"
                inputMode="numeric"
                value={customerPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setCustomerPin(value);
                  setPinError("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:border-primary focus:outline-none"
                placeholder="••••"
                autoFocus
              />
              {pinError && (
                <p className="text-red-500 text-sm mt-2">{pinError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setSelectedOrder(null);
                  setCustomerPin("");
                  setPinError("");
                }}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || customerPin.length !== 4}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedOrderId && (
        <RiderMap
          orderId={selectedOrderId}
          onClose={() => {
            setShowMapModal(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
