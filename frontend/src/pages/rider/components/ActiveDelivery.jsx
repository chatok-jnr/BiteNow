import { useState } from "react";

function ActiveDelivery({ activeDeliveries, deliverySteps, setDeliverySteps, onDropRequest, onCompleteDelivery }) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [pin2, setPin2] = useState("");
  const [showPin2Modal, setShowPin2Modal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [error, setError] = useState("");

  // Get current delivery step
  const getDeliveryStep = (deliveryId) => {
    return deliverySteps[deliveryId] || "going_to_restaurant";
  };

  // Set delivery step
  const setDeliveryStep = (deliveryId, step) => {
    setDeliverySteps({ ...deliverySteps, [deliveryId]: step });
  };

  // Get selected delivery or first one
  const activeDelivery = activeDeliveries?.find(d => d.id === selectedDeliveryId) || activeDeliveries?.[0];
  const deliveryStep = activeDelivery ? getDeliveryStep(activeDelivery.id) : "going_to_restaurant";

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

  const handleReachedRestaurant = () => {
    setDeliveryStep(activeDelivery.id, "at_restaurant");
  };

  const handleFoodPickedUp = () => {
    // Restaurant has verified PIN1 on their end, rider confirms pickup
    setDeliveryStep(activeDelivery.id, "picked_up");
  };

  const handleStartDelivery = () => {
    setDeliveryStep(activeDelivery.id, "delivering");
  };

  const handleReachedCustomer = () => {
    setDeliveryStep(activeDelivery.id, "at_customer");
    setShowPin2Modal(true);
  };

  const handleVerifyPin2 = () => {
    // Verify PIN2 with backend
    if (pin2 === activeDelivery.pin2) {
      setShowPin2Modal(false);
      setDeliveryStep(activeDelivery.id, "completed");
      setPin2("");
      setError("");
      // Call completion API
      setTimeout(() => {
        onCompleteDelivery(activeDelivery);
        // Reset selected delivery if multiple exist
        if (activeDeliveries.length > 1) {
          const remainingDeliveries = activeDeliveries.filter(d => d.id !== activeDelivery.id);
          setSelectedDeliveryId(remainingDeliveries[0]?.id);
        }
      }, 2000);
    } else {
      setError("Invalid PIN. Please check with customer.");
    }
  };

  const handleDrop = () => {
    if (deliveryStep === "going_to_restaurant") {
      setShowDropModal(true);
    } else {
      alert("Cannot drop request after picking up food from restaurant!");
    }
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
            const step = getDeliveryStep(delivery.id);
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
                <div className="text-xs mt-1">
                  {step === "going_to_restaurant" && "📍 Going to restaurant"}
                  {step === "at_restaurant" && "🏪 At restaurant"}
                  {step === "picked_up" && "📦 Picked up"}
                  {step === "delivering" && "🚴 Delivering"}
                  {step === "at_customer" && "🏠 At customer"}
                  {step === "completed" && "✅ Completed"}
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
            <span className="text-6xl">
              {deliveryStep === "going_to_restaurant" && "🚴"}
              {deliveryStep === "at_restaurant" && "🏪"}
              {deliveryStep === "picked_up" && "📦"}
              {deliveryStep === "delivering" && "🚴💨"}
              {deliveryStep === "at_customer" && "🏠"}
              {deliveryStep === "completed" && "✅"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {deliveryStep === "going_to_restaurant" && "Going to Restaurant"}
            {deliveryStep === "at_restaurant" && "At Restaurant - Verify PIN"}
            {deliveryStep === "picked_up" && "Food Picked Up"}
            {deliveryStep === "delivering" && "Delivering to Customer"}
            {deliveryStep === "at_customer" && "At Customer - Verify PIN"}
            {deliveryStep === "completed" && "Delivery Completed!"}
          </h2>
          <p className="text-gray-600">
            Order #{activeDelivery.order_id || activeDelivery._id?.slice(-6)}
          </p>
          
          {/* PIN Display */}
          <div className="mt-4 flex justify-center gap-4">
            {(deliveryStep === "going_to_restaurant" || deliveryStep === "at_restaurant") && (
              <div className="bg-primary/10 px-6 py-3 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Your PIN for Restaurant</p>
                <p className="text-3xl font-bold text-primary tracking-widest">
                  {activeDelivery.pin1 || "1234"}
                </p>
                <p className="text-xs text-gray-500 mt-2">Show this to restaurant</p>
              </div>
            )}
            {(deliveryStep === "picked_up" || deliveryStep === "delivering" || deliveryStep === "at_customer") && (
              <div className="bg-secondary/10 px-6 py-3 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Customer PIN</p>
                <p className="text-3xl font-bold text-secondary tracking-widest">
                  {activeDelivery.pin2 || "5678"}
                </p>
                <p className="text-xs text-gray-500 mt-2">Get this from customer</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-secondary z-0 transition-all duration-500"
              style={{ 
                width: deliveryStep === "going_to_restaurant" ? "0%" : 
                       deliveryStep === "at_restaurant" ? "25%" :
                       deliveryStep === "picked_up" ? "50%" :
                       deliveryStep === "delivering" ? "75%" : "100%"
              }}
            ></div>
            
            {["📍", "🏪", "📦", "🚴", "✅"].map((emoji, index) => (
              <div key={index} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  (index === 0 && deliveryStep !== "going_to_restaurant") ||
                  (index === 1 && (deliveryStep === "picked_up" || deliveryStep === "delivering" || deliveryStep === "at_customer" || deliveryStep === "completed")) ||
                  (index === 2 && (deliveryStep === "delivering" || deliveryStep === "at_customer" || deliveryStep === "completed")) ||
                  (index === 3 && (deliveryStep === "at_customer" || deliveryStep === "completed")) ||
                  (index === 4 && deliveryStep === "completed")
                    ? "bg-secondary" : "bg-gray-200"
                }`}>
                  {emoji}
                </div>
              </div>
            ))}
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
                {deliveryStep === "going_to_restaurant" && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                    Navigate
                  </button>
                )}
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
                {(deliveryStep === "picked_up" || deliveryStep === "delivering") && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                    Navigate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Food Cost</p>
              <p className="text-xl font-bold text-gray-900">
                ৳{activeDelivery.food_cost || activeDelivery.total_amount || 0}
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
                ৳{(activeDelivery.food_cost || activeDelivery.total_amount || 0) + (activeDelivery.delivery_charge || 50)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {deliveryStep === "going_to_restaurant" && (
            <>
              <button 
                onClick={handleDrop}
                className="flex-1 px-6 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors"
              >
                🗑️ Drop Request
              </button>
              <button
                onClick={handleReachedRestaurant}
                className="flex-1 px-6 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all transform hover:scale-105"
              >
                Reached Restaurant
              </button>
            </>
          )}

          {deliveryStep === "at_restaurant" && (
            <button
              onClick={handleFoodPickedUp}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              ✓ Food Picked Up
            </button>
          )}

          {deliveryStep === "picked_up" && (
            <button
              onClick={handleStartDelivery}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
            >
              Start Delivery to Customer
            </button>
          )}

          {deliveryStep === "delivering" && (
            <button
              onClick={handleReachedCustomer}
              className="w-full px-6 py-4 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all transform hover:scale-105"
            >
              Reached Customer
            </button>
          )}

          {deliveryStep === "completed" && (
            <div className="w-full text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-secondary mb-2">
                Delivery Completed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                You earned ৳50 from this delivery
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PIN2 Verification Modal (Customer) */}
      {showPin2Modal && (
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
                value={pin2}
                onChange={(e) => {
                  setPin2(e.target.value.replace(/\D/g, ""));
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
                ৳{(activeDelivery.food_cost || activeDelivery.total_amount || 0) + (activeDelivery.delivery_charge || 50)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                (Food: ৳{activeDelivery.food_cost || activeDelivery.total_amount || 0} + Delivery: ৳{activeDelivery.delivery_charge || 50})
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPin2Modal(false);
                  setDeliveryStep(activeDelivery.id, "delivering");
                  setPin2("");
                  setError("");
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin2}
                disabled={pin2.length !== 4}
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
