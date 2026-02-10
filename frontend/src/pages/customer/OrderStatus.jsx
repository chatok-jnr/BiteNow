import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  ShoppingCart,
  Package,
  Clock,
  Search,
  CheckCircle,
  Truck,
  ChefHat,
  User,
  MapPin,
  Phone,
  Home as HomeIcon,
  LogOut,
} from "lucide-react";
import { getUserOrders } from "../../utils/orderService";

const OrderStatus = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserOrders();
      setOrders(response.data?.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "look_rider":
      case "look_for_rider":
        return <Search className="w-5 h-5" />;
      case "preparing":
        return <ChefHat className="w-5 h-5" />;
      case "ready_for_pickup":
      case "ready to pick up":
        return <Package className="w-5 h-5" />;
      case "out_for_delivery":
      case "out for delivery":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "pending":
        return "bg-yellow-500";
      case "look_rider":
      case "look_for_rider":
        return "bg-orange-500";
      case "preparing":
        return "bg-blue-500";
      case "ready_for_pickup":
      case "ready to pick up":
        return "bg-purple-500";
      case "out_for_delivery":
      case "out for delivery":
        return "bg-[#67A177]";
      case "delivered":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusProgress = (status) => {
    const statusOrder = [
      "pending",
      "look_rider",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
    ];
    const statusLower = status?.toLowerCase();
    const index = statusOrder.indexOf(statusLower);
    return index >= 0 ? ((index + 1) / statusOrder.length) * 100 : 0;
  };

  // Filter orders based on status
  const activeOrders = orders.filter((order) => {
    const statusLower = order.order_status?.toLowerCase();
    return !["delivered", "cancelled"].includes(statusLower);
  });

  const completedOrders = orders.filter((order) => {
    const statusLower = order.order_status?.toLowerCase();
    return ["delivered", "cancelled"].includes(statusLower);
  });

  // Transform API order data to match component expectations
  const transformOrder = (order) => {
    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const transformed = {
      id: order._id || order.id,
      restaurant: order.restaurant_id?.restaurant_name || "Restaurant",
      restaurantImage:
        order.restaurant_id?.restaurant_image?.url ||
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      items:
        order.items?.map((item) => ({
          name:
            item.food_id?.food_name || item.food_name || item.name || "Item",
          image:
            item.food_id?.food_image?.url ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
          price: item.unit_price || item.price || 0,
          quantity: item.quantity || 1,
        })) || [],
      deliveryCharge: order.delivery_charge || 0,
      total: order.total_amount || 0,
      status: order.order_status || "pending",
      orderTime: formatDate(order.createdAt),
      estimatedTime:
        formatDate(order.estimated_delivery_time) || "Calculating...",
      deliveredTime: formatDate(order.delivered_at),
      address:
        order.delivery_address?.formatted_address ||
        `${order.delivery_address?.street || ""}, ${order.delivery_address?.city || ""}`.trim() ||
        "Address not available",
      confirmationPin: order.customer_pin || null,
      rider: order.rider_id
        ? {
            name: order.rider_id.rider_name || "Rider",
            phone: order.rider_id.rider_contact_info?.emergency_contact || "",
            rating: order.rider_id.rider_stats?.average_rating || 4.5,
          }
        : null,
    };

    // Debug logging for PIN display
    console.log("Order Transform Debug:", {
      orderId: transformed.id,
      status: transformed.status,
      customer_pin: order.customer_pin,
      confirmationPin: transformed.confirmationPin,
      isOutForDelivery:
        transformed.status?.toLowerCase() === "out_for_delivery",
    });

    return transformed;
  };

  const OrderCard = ({ order, isActive }) => (
    <div
      className="bg-[#ACD4B1] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={order.restaurantImage}
              alt={order.restaurant}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {order.restaurant}
              </h3>
              <p className="text-sm text-gray-600">Order #{order.id}</p>
            </div>
          </div>
          <div
            className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full flex items-center space-x-2 font-semibold`}
          >
            {getStatusIcon(order.status)}
            <span className="text-sm">{order.status.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-6">
            <div className="w-full bg-[#DDEEDB] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#67A177] h-full rounded-full transition-all duration-500"
                style={{ width: `${getStatusProgress(order.status)}%` }}
              />
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Items:</p>
          <div className="flex flex-wrap gap-2">
            {order.items.map((item, index) => (
              <span
                key={index}
                className="bg-[#DDEEDB] text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-6 h-6 rounded object-cover"
                />
                {item.name}
                <span className="text-[#67A177] font-semibold">
                  ৳{item.price.toFixed(2)}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Confirmation Pin */}
        {isActive &&
          order.confirmationPin &&
          order.status?.toLowerCase() === "out_for_delivery" && (
            <div className="mb-4 bg-[#67A177] p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium mb-1">
                    Confirmation PIN
                  </p>
                  <p className="text-white text-xs opacity-90">
                    Share this PIN with your delivery rider
                  </p>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg">
                  <p className="text-3xl font-bold text-[#67A177] tracking-wider">
                    {order.confirmationPin}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Rider Info */}
        {isActive &&
          order.rider &&
          order.status?.toLowerCase() === "out_for_delivery" && (
            <div className="mb-4 bg-[#DDEEDB] p-4 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Your Delivery Rider
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.rider.name}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">
                        {order.rider.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="bg-[#67A177] text-white p-3 rounded-full hover:bg-[#5a8f68] transition-all"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#DDEEDB] p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Order Time</p>
            <p className="font-semibold text-gray-800">{order.orderTime}</p>
          </div>
          {isActive ? (
            <div className="bg-[#DDEEDB] p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
              <p className="font-semibold text-gray-800">
                {order.estimatedTime}
              </p>
            </div>
          ) : (
            <div className="bg-[#DDEEDB] p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Delivered At</p>
              <p className="font-semibold text-gray-800">
                {order.deliveredTime}
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-[#67A177] mt-0.5" />
          <div>
            <p className="text-xs text-gray-600">Delivery Address</p>
            <p className="text-sm font-medium text-gray-800">{order.address}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#8DBC96]/30">
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-[#67A177]">
              ৳{order.total.toFixed(2)}
            </p>
          </div>
          {isActive ? (
            <button className="bg-[#67A177] text-white px-6 py-2 rounded-full hover:bg-[#5a8f68] transition-all font-semibold text-sm">
              Track Order
            </button>
          ) : (
            <button className="bg-[#67A177] text-white px-6 py-2 rounded-full hover:bg-[#5a8f68] transition-all font-semibold text-sm">
              Reorder
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#C4E2C4]">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
                ? "bg-red-500"
                : toast.type === "warning"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
          } text-white flex items-center space-x-3 animate-fade-in-down`}
        >
          {toast.type === "success" && <CheckCircle className="w-6 h-6" />}
          {toast.type === "error" && <X className="w-6 h-6" />}
          {toast.type === "warning" && <Clock className="w-6 h-6" />}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="ml-4 hover:bg-white/20 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                onClick={() => navigate("/")}
                className="text-white hover:text-[#ACD4B1] transition-colors font-medium px-4 py-2 flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </button>
              <button
                onClick={() => navigate("/orderStatus")}
                className="bg-[#ACD4B1] text-[#67A177] px-6 py-2 rounded-full font-semibold flex items-center gap-2"
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
                  navigate("/login");
                }}
                className="text-white hover:text-red-300 transition-colors font-medium px-4 py-2 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal for Food Item Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-[#67A177]">
              Order #{selectedOrder.id}
            </h2>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {selectedOrder.restaurant}
            </h3>
            <div className="mb-4 flex items-center space-x-3">
              <img
                src={selectedOrder.restaurantImage}
                alt={selectedOrder.restaurant}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <span className="text-gray-700 font-medium">
                {selectedOrder.restaurant}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Food Items Ordered:</p>
              <ul className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center space-x-3 bg-[#DDEEDB] px-4 py-2 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-gray-800 font-medium flex-1">
                      {item.name}
                    </span>
                    <span className="text-[#67A177] font-semibold">
                      ৳{item.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="text-[#67A177] font-semibold">
                  ৳
                  {selectedOrder.deliveryCharge
                    ? selectedOrder.deliveryCharge.toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-[#67A177] font-bold">
                  ৳{selectedOrder.total.toFixed(2)}
                </span>
              </div>
              {selectedOrder.confirmationPin &&
                selectedOrder.status?.toLowerCase() === "out_for_delivery" && (
                  <div className="flex justify-between items-center mt-4 bg-[#67A177] px-4 py-2 rounded-lg">
                    <span className="text-white font-medium">
                      Confirmation PIN
                    </span>
                    <span className="bg-white text-[#67A177] font-bold px-4 py-2 rounded-lg text-xl tracking-wider">
                      {selectedOrder.confirmationPin}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-[#8DBC96] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            My Orders
          </h1>
          <p className="text-white/90 text-lg">
            Track and manage your food deliveries
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
              activeTab === "active"
                ? "bg-[#DDEEDB] text-[#67A177] shadow-lg"
                : "bg-[#ACD4B1] text-gray-600 hover:bg-[#DDEEDB]/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Active Deliveries</span>
              <span className="bg-[#67A177] text-white px-2 py-1 rounded-full text-xs">
                {activeOrders.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-[#DDEEDB] text-[#67A177] shadow-lg"
                : "bg-[#ACD4B1] text-gray-600 hover:bg-[#DDEEDB]/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Completed Orders</span>
              <span className="bg-[#67A177] text-white px-2 py-1 rounded-full text-xs">
                {completedOrders.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Orders Content */}
      <div className="bg-[#DDEEDB] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#67A177] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mx-auto max-w-md">
                <p className="font-bold mb-2">Error Loading Orders</p>
                <p>{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Orders Display */}
          {!loading && !error && activeTab === "active" && (
            <div>
              {activeOrders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order._id || order.id}
                      order={transformOrder(order)}
                      isActive={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    No Active Orders
                  </h3>
                  <p className="text-gray-500">
                    You don't have any active deliveries at the moment
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && activeTab === "completed" && (
            <div>
              {completedOrders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {completedOrders.map((order) => (
                    <OrderCard
                      key={order._id || order.id}
                      order={transformOrder(order)}
                      isActive={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CheckCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    No Completed Orders
                  </h3>
                  <p className="text-gray-500">
                    Your order history will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
