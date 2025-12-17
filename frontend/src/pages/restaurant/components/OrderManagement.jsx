import { useState } from "react";

function OrderManagement({ restaurantId, orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [riderPin, setRiderPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);

  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.order_status === status);
  };

  const handleAcceptOrder = async (orderId) => {
    // TODO: API call
    setOrders(
      orders.map((order) =>
        order._id === orderId
          ? { ...order, order_status: "preparing", updated_at: new Date().toISOString() }
          : order
      )
    );
  };

  const handleRejectOrder = (order) => {
    setOrderToReject(order);
    setShowRejectModal(true);
  };

  const confirmRejectOrder = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    // TODO: API call
    setOrders(
      orders.map((order) =>
        order._id === orderToReject._id
          ? {
              ...order,
              order_status: "cancelled",
              rejection_reason: rejectionReason,
              updated_at: new Date().toISOString(),
            }
          : order
      )
    );
    setShowRejectModal(false);
    setRejectionReason("");
    setOrderToReject(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // TODO: API call
    setOrders(
      orders.map((order) =>
        order._id === orderId
          ? { ...order, order_status: newStatus, updated_at: new Date().toISOString() }
          : order
      )
    );
  };

  const handleVerifyPin = async () => {
    if (!selectedOrder) return;
    
    // TODO: API call to verify PIN
    // Mock PIN for testing
    const mockRiderPin = "1234";
    
    if (riderPin === mockRiderPin) {
      handleUpdateStatus(selectedOrder._id, "picked_up");
      setShowPinModal(false);
      setRiderPin("");
      setSelectedOrder(null);
      alert("PIN verified! Order handed over to rider.");
    } else {
      alert("Invalid PIN! Please try again.");
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const OrderCard = ({ order, statusLabel, statusColor, actions }) => (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${statusColor} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900">Order #{order._id}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.replace('border', 'bg').replace('200', '100')} ${statusColor.replace('border-', 'text-').replace('-200', '-700')}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-gray-700 font-medium">{order.customer_name}</p>
          <p className="text-sm text-gray-500">{order.customer_phone}</p>
          <p className="text-sm text-gray-500">{formatTime(order.created_at)}</p>
        </div>
        <p className="text-2xl font-bold text-primary">৳{order.total_amount.toLocaleString()}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.food_name}
                {item.discount_percentage > 0 && (
                  <span className="text-green-600 ml-2">(-{item.discount_percentage}%)</span>
                )}
              </span>
              <span className="font-medium text-gray-900">৳{(item.price * item.quantity * (1 - item.discount_percentage / 100)).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {order.special_instructions && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-yellow-800">Special Instructions:</p>
          <p className="text-sm text-yellow-700">{order.special_instructions}</p>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-600">
        <p className="font-semibold mb-1">Delivery Address:</p>
        <p>{order.delivery_address.street}, {order.delivery_address.city} - {order.delivery_address.zipCode}</p>
      </div>

      {order.assigned_rider_name && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
          <p className="text-sm font-semibold text-blue-800">Rider: {order.assigned_rider_name}</p>
        </div>
      )}

      <div className="flex gap-3">{actions}</div>
    </div>
  );

  const newOrders = getOrdersByStatus("new");
  const acceptedOrders = getOrdersByStatus("accepted");
  const preparingOrders = getOrdersByStatus("preparing");
  const readyOrders = getOrdersByStatus("ready");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">New Orders</p>
          <p className="text-2xl font-bold text-red-600">{newOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Preparing</p>
          <p className="text-2xl font-bold text-yellow-600">{preparingOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Ready</p>
          <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Today's Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
      </div>

      {/* 3-Column Kanban Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <div className="flex flex-col">
          <div className="bg-red-50 border-2 border-red-200 rounded-t-lg p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
              🔔 New Orders
            </h2>
            <span className="bg-red-200 text-red-900 text-sm font-bold px-3 py-1 rounded-full">
              {newOrders.length}
            </span>
          </div>
          <div className="space-y-4 bg-red-50/30 p-4 rounded-b-lg border-2 border-t-0 border-red-200 min-h-[600px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {newOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No new orders</p>
              </div>
            ) : (
              newOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  statusLabel="NEW"
                  statusColor="border-red-200"
                  actions={
                    <>
                      <button
                        onClick={() => handleRejectOrder(order)}
                        className="flex-1 px-3 py-2 border-2 border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
                      >
                        Accept
                      </button>
                    </>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing Orders */}
        <div className="flex flex-col">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-t-lg p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
              👨‍🍳 Preparing
            </h2>
            <span className="bg-yellow-200 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
              {preparingOrders.length}
            </span>
          </div>
          <div className="space-y-4 bg-yellow-50/30 p-4 rounded-b-lg border-2 border-t-0 border-yellow-200 min-h-[600px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No orders preparing</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  statusLabel="PREPARING"
                  statusColor="border-yellow-200"
                  actions={
                    <button
                      onClick={() => handleUpdateStatus(order._id, "ready")}
                      className="w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
                    >
                      Mark as Ready
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="flex flex-col">
          <div className="bg-green-50 border-2 border-green-200 rounded-t-lg p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
              🎯 Ready for Pickup
            </h2>
            <span className="bg-green-200 text-green-900 text-sm font-bold px-3 py-1 rounded-full">
              {readyOrders.length}
            </span>
          </div>
          <div className="space-y-4 bg-green-50/30 p-4 rounded-b-lg border-2 border-t-0 border-green-200 min-h-[600px] max-h-[calc(100vh-300px)] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No orders ready</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  statusLabel="READY"
                  statusColor="border-green-200"
                  actions={
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowPinModal(true);
                      }}
                      className="w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
                    >
                      Verify Rider PIN
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowPinModal(false);
            setRiderPin("");
            setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Verify Rider PIN</h2>
            <p className="text-gray-600 mb-4">
              Enter the 4-digit PIN shown by the rider to confirm handover.
            </p>
            <input
              type="text"
              value={riderPin}
              onChange={(e) => setRiderPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest mb-4"
              maxLength={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setRiderPin("");
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                disabled={riderPin.length !== 4}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowRejectModal(false);
            setRejectionReason("");
            setOrderToReject(null);
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Reject Order</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this order:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Out of ingredients, Too busy, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setOrderToReject(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectOrder}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
