import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Package,
  Clock,
  Search,
  CheckCircle,
  Truck,
  ChefHat,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import CustomerNavbar from "../../components/CustomerNavbar";
import CustomerTrackingMap from "../../components/CustomerTrackingMap";
import { getUserOrders } from "../../utils/orderService";
import { useNotification } from "../../contexts/NotificationContext";

const OrderStatus = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        return "bg-primary";
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
    return !["delivered", "cancelled", "rejected"].includes(statusLower);
  });

  const completedOrders = orders.filter((order) => {
    const statusLower = order.order_status?.toLowerCase();
    return statusLower === "delivered";
  });

  const cancelledOrders = orders.filter((order) => {
    const statusLower = order.order_status?.toLowerCase();
    return ["cancelled", "rejected"].includes(statusLower);
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
      address: "Delivery Location", // delivery_address is now GeoJSON coordinates
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
      className="bg-tertiary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={order.restaurantImage}
              alt={order.restaurant}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {order.restaurant}
              </h3>
              <p className="text-xs text-gray-600">
                Order #{order.id.slice(-8)}
              </p>
            </div>
          </div>
          <div
            className={`${getStatusColor(order.status)} text-white px-2 py-1 rounded-full flex items-center space-x-1 font-semibold`}
          >
            {getStatusIcon(order.status)}
            <span className="text-xs">{order.status.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {isActive && (
          <div className="mb-3">
            <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${getStatusProgress(order.status)}%` }}
              />
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1.5">Items:</p>
          <div className="flex flex-wrap gap-1.5">
            {order.items.slice(0, 2).map((item, index) => (
              <span
                key={index}
                className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-5 h-5 rounded object-cover"
                />
                {item.name.length > 10
                  ? item.name.substring(0, 10) + "..."
                  : item.name}
                <span className="text-primary font-semibold">
                  ৳{item.price.toFixed(0)}
                </span>
              </span>
            ))}
            {order.items.length > 2 && (
              <span className="bg-surface text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                +{order.items.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Confirmation Pin */}
        {isActive &&
          order.confirmationPin &&
          order.status?.toLowerCase() === "out_for_delivery" && (
            <div className="mb-3 bg-primary p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-medium mb-0.5">
                    Confirmation PIN
                  </p>
                  <p className="text-white text-xs opacity-90">
                    Share with rider
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg">
                  <p className="text-2xl font-bold text-primary tracking-wider">
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
            <div className="mb-3 bg-surface p-2.5 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Delivery Rider
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {order.rider.name}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs text-gray-600">
                        {order.rider.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="bg-primary text-white p-2 rounded-full hover:bg-accent-dark transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-surface p-2 rounded-lg">
            <p className="text-xs text-gray-600 mb-0.5">Order Time</p>
            <p className="text-xs font-semibold text-gray-800">
              {order.orderTime}
            </p>
          </div>
          {isActive ? (
            <div className="bg-surface p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-0.5">Est. Delivery</p>
              <p className="text-xs font-semibold text-gray-800">
                {order.estimatedTime}
              </p>
            </div>
          ) : (
            <div className="bg-surface p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-0.5">Delivered At</p>
              <p className="text-xs font-semibold text-gray-800">
                {order.deliveredTime}
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start space-x-1.5 mb-3">
          <MapPin className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-xs text-gray-600">Delivery Address</p>
            <p className="text-xs font-medium text-gray-800">{order.address}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary/30">
          <div>
            <p className="text-xs text-gray-600">Total Amount</p>
            <p className="text-xl font-bold text-primary">
              ৳{order.total.toFixed(2)}
            </p>
          </div>
          {isActive && order.status?.toLowerCase() === "out_for_delivery" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTrackingOrderId(order.id);
              }}
              className="bg-primary text-white px-3 py-1.5 rounded-full hover:bg-accent-dark transition-all font-semibold text-xs flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              Track
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgPrimary">
      <CustomerNavbar activeTab="orders" />

      <div className="pt-24">
        {/* Tracking Map Modal */}
        {trackingOrderId && (
          <CustomerTrackingMap
            orderId={trackingOrderId}
            onClose={() => setTrackingOrderId(null)}
          />
        )}

        {/* Modal for Food Item Details */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-2 text-primary">
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
                <p className="text-sm text-gray-600 mb-2">
                  Food Items Ordered:
                </p>
                <ul className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center space-x-3 bg-surface px-4 py-2 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="text-gray-800 font-medium flex-1">
                        {item.name}
                      </span>
                      <span className="text-primary font-semibold">
                        ৳{item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="text-primary font-semibold">
                    ৳
                    {selectedOrder.deliveryCharge
                      ? selectedOrder.deliveryCharge.toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-primary font-bold">
                    ৳{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                {selectedOrder.confirmationPin &&
                  selectedOrder.status?.toLowerCase() ===
                    "out_for_delivery" && (
                    <div className="flex justify-between items-center mt-4 bg-primary px-4 py-2 rounded-lg">
                      <span className="text-white font-medium">
                        Confirmation PIN
                      </span>
                      <span className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-xl tracking-wider">
                        {selectedOrder.confirmationPin}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-secondary py-12">
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
                  ? "bg-surface text-primary shadow-lg"
                  : "bg-tertiary text-gray-600 hover:bg-surface/50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Active Deliveries</span>
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
                <span>Completed Orders</span>
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                  {completedOrders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`flex-1 py-4 px-6 rounded-t-2xl font-semibold transition-all ${
                activeTab === "cancelled"
                  ? "bg-surface text-primary shadow-lg"
                  : "bg-tertiary text-gray-600 hover:bg-surface/50"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <X className="w-5 h-5" />
                <span>Cancelled Orders</span>
                <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                  {cancelledOrders.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Orders Content */}
        <div className="bg-surface min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {!loading && !error && activeTab === "cancelled" && (
              <div>
                {cancelledOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cancelledOrders.map((order) => (
                      <OrderCard
                        key={order._id || order.id}
                        order={transformOrder(order)}
                        isActive={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <X className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">
                      No Cancelled Orders
                    </h3>
                    <p className="text-gray-500">
                      Your cancelled or rejected orders will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
