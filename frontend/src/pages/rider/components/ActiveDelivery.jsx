import { useState } from "react";
import axiosInstance from "../../../utils/axios";

function ActiveDelivery({ activeDeliveries, deliverySteps, setDeliverySteps, onDropRequest, onCompleteDelivery }) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [customerPin, setCustomerPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [error, setError] = useState("");

  // Get selected delivery or first one
  const activeDelivery = activeDeliveries?.find(d => d.id === selectedDeliveryId) || activeDeliveries?.[0];

  if (!activeDeliveries || activeDeliveries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl">
        <p className="text-6xl mb-4">🚴</p>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Active Delivery
        </h3>
        <p className="text-gray-600">
          Accept a request to start delivering
        </p>
      </div>
    );
  }

  const handleVerifyPin = async () => {
    try {
      // Verify customer PIN with backend API
      const response = await axiosInstance.patch("/api/v1/order/rider/verify-customer", {
        order_id: activeDelivery._id || activeDelivery.id,
        customer_pin: customerPin
      });

      if (response.data.status === "success") {
        setShowPinModal(false);
        setCustomerPin("");
        setError("");
        
        // Call completion handler
        setTimeout(() => {
          onCompleteDelivery(activeDelivery);
          // Reset selected delivery if multiple exist
          if (activeDeliveries.length > 1) {
            const remainingDeliveries = activeDeliveries.filter(d => d.id !== activeDelivery.id);
            setSelectedDeliveryId(remainingDeliveries[0]?.id);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying customer PIN:", error);
      setError(error.response?.data?.message || "Invalid PIN. Please check with customer.");
    }
  };

  const handleDrop = () => {
    setShowDropModal(true);
  };

  const confirmDrop = () => {
    setShowDropModal(false);
    onDropRequest(activeDelivery);
  };

  return (
    <div className="animate-fadeIn">
      {/* Delivery Tabs - Show all active deliveries */}
      {activeDeliveries.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {activeDeliveries.map((delivery, index) => {
            const isSelected = activeDelivery?.id === delivery.id;
            return (
              <button
                key={delivery.id}
                onClick={() => setSelectedDeliveryId(delivery.id)}
                className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary"
                }`}
              >
                <div className="text-sm">Delivery #{index + 1}</div>
                <div className="text-xs opacity-75">
                  {delivery.restaurant_name || delivery.restaurant?.restaurant_name}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-6 bg-secondary/10 rounded-full mb-4">
            <span className="text-6xl">🚴💨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Active Delivery
          </h2>
          <p className="text-gray-600">
            Order #{activeDelivery.order_id || activeDelivery._id?.slice(-6)}
          </p>
          
          {/* PIN Display */}
          <div className="mt-4 flex justify-center gap-4">
            <div className="bg-primary/10 px-6 py-3 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Rider PIN</p>
              <p className="text-3xl font-bold text-primary tracking-widest">
                {activeDelivery.pin1 || activeDelivery.rider_pin || "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-2">Your verification PIN</p>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-4">
              {activeDelivery.restaurant_name || activeDelivery.restaurant?.restaurant_name}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-semibold text-gray-900">
                    {activeDelivery.restaurant_address || activeDelivery.pickup_address}
                  </p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                  Navigate
                </button>
              </div>
              <div className="border-l-2 border-primary h-8 ml-3"></div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏠</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Delivery Location</p>
                  <p className="font-semibold text-gray-900">
                    {activeDelivery.customer_address || activeDelivery.delivery_address}
                  </p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                  Navigate
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {activeDelivery.items && activeDelivery.items.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
              <div className="space-y-2">
                {activeDelivery.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{item.food_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">৳{item.total_price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Food Cost</p>
              <p className="text-xl font-bold text-gray-900">
                ৳{activeDelivery.food_cost || activeDelivery.subtotal || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Delivery Charge</p>
              <p className="text-xl font-bold text-secondary">
                ৳{activeDelivery.delivery_charge || 50}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Total to Collect</p>
              <p className="text-xl font-bold text-primary">
                ৳{activeDelivery.total_amount || ((activeDelivery.food_cost || activeDelivery.subtotal || 0) + (activeDelivery.delivery_charge || 50))}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleDrop}
            className="flex-1 px-6 py-4 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors"
          >
            🗑️ Drop Request
          </button>
          <button
            onClick={() => setShowPinModal(true)}
            className="flex-1 px-6 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all transform hover:scale-105"
          >
            ✓ Complete Delivery
          </button>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Customer PIN
            </h3>
            <p className="text-gray-600 mb-6">
              Customer will provide you a 4-digit PIN. Enter it to complete the delivery.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter PIN from Customer
              </label>
              <input
                type="text"
                maxLength="4"
                value={customerPin}
                onChange={(e) => {
                  setCustomerPin(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-6 py-4 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="bg-secondary/10 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Collect Payment:</strong>
              </p>
              <p className="text-2xl font-bold text-secondary">
                ৳{activeDelivery.total_amount || ((activeDelivery.food_cost || activeDelivery.subtotal || 0) + (activeDelivery.delivery_charge || 50))}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                (Food: ৳{activeDelivery.food_cost || activeDelivery.subtotal || 0} + Delivery: ৳{activeDelivery.delivery_charge || 50})
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setCustomerPin("");
                  setError("");
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                disabled={customerPin.length !== 4}
                className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Verify & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Request Confirmation Modal */}
      {showDropModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Drop This Request?
              </h3>
              <p className="text-gray-600">
                Are you sure you want to drop this delivery request? It will be returned to the available requests.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDropModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDrop}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
              >
                Yes, Drop It
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ActiveDelivery;
