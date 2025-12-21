import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import { mockOrders, orderStatuses } from "./mockData";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "customer") {
      navigate("/login");
    }

    // Load orders from localStorage (new orders) and merge with mock orders
    const storedOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]");
    const allOrders = [...storedOrders, ...mockOrders];
    
    setOrders(allOrders);
    setActiveOrders(allOrders.filter((order) => order.isActive));
    setPastOrders(allOrders.filter((order) => !order.isActive));

    // Simulate order status progression for active orders
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (!order.isActive) return order;

          // Auto-progress orders through statuses
          if (order.status === "pending") {
            return { ...order, status: "accepted" };
          } else if (order.status === "accepted") {
            return {
              ...order,
              status: "rider_assigned",
              pin: Math.floor(1000 + Math.random() * 9000).toString(),
            };
          }
          return order;
        })
      );
    }, 10000); // Progress every 10 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  // Update active and past orders when orders change
  useEffect(() => {
    setActiveOrders(orders.filter((order) => order.isActive));
    setPastOrders(orders.filter((order) => !order.isActive));
    
    // Update localStorage with new orders
    const newOrders = orders.filter(order => order.id.startsWith('ORD') && order.id.length > 6);
    localStorage.setItem("customerOrders", JSON.stringify(newOrders));
  }, [orders]);

  const getStatusColor = (status) => {
    const statusConfig = orderStatuses[status];
    const colors = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
      orange: "bg-orange-100 text-orange-800 border-orange-300",
      green: "bg-green-100 text-green-800 border-green-300",
      blue: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[statusConfig?.color] || colors.yellow;
  };

  const getProgressPercentage = (status) => {
    const percentages = {
      pending: 33,
      accepted: 66,
      rider_assigned: 100,
      delivered: 100,
    };
    return percentages[status] || 0;
  };

  const OrderCard = ({ order, isActive }) => {
    const statusConfig = orderStatuses[order.status];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {order.restaurantName}
            </h3>
            <p className="text-sm text-gray-600">Order #{order.id}</p>
            <p className="text-xs text-gray-500 mt-1">{order.orderTime}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
              order.status
            )}`}
          >
            {statusConfig?.icon} {statusConfig?.label}
          </span>
        </div>

        {/* Status Progress Bar (Active Orders Only) */}
        {isActive && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{statusConfig?.message}</span>
              {order.pin && (
                <span className="font-bold text-green-700">
                  PIN: {order.pin}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  order.status === "pending"
                    ? "bg-yellow-500"
                    : order.status === "accepted"
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${getProgressPercentage(order.status)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Pending</span>
              <span>Preparing</span>
              <span>On the way</span>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>
                  {item.quantity}x {item.name}
                  {item.variant && (
                    <span className="text-xs text-gray-500">
                      {" "}
                      ({item.variant})
                    </span>
                  )}
                </span>
                <span>৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-200 pt-4 space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>৳{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Fee</span>
            <span>৳{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
            <span>Total</span>
            <span className="text-primary">৳{order.total}</span>
          </div>
        </div>

        {/* Delivered Time */}
        {order.deliveredTime && (
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
            ✅ Delivered on {order.deliveredTime}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and order history</p>
        </div>

        {/* No Orders State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-6xl mb-4">📦</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start ordering from your favorite restaurants!
            </p>
            <button
              onClick={() => navigate("/customer-dashboard")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Active Orders
              </h2>
              <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                {activeOrders.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} isActive={true} />
              ))}
            </div>
          </div>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Past Orders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} isActive={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
