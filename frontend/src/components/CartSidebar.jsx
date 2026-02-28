import React from "react";
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";

const CartSidebar = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <>
      {/* Backdrop with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Premium Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-glass z-50 transform transition-all duration-400 ease-smooth ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-secondary opacity-100" />
          <div className="absolute inset-0 bg-mesh-gradient opacity-10" />
          <div className="relative flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-textPrimary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  Your Cart
                </h2>
                <p className="text-xs text-white/70">
                  {cartItems.length} items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && onClearCart && (
                <button
                  onClick={onClearCart}
                  className="text-xs bg-red-500/90 hover:bg-red-600 text-white px-2 sm:px-3 py-1.5 rounded-lg transition-all shadow-soft hover:shadow-medium font-medium"
                  title="Clear entire cart"
                >
                  <span className="hidden xs:inline">Clear All</span>
                  <span className="xs:hidden">Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items with Custom Scrollbar */}
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar"
          style={{ height: "calc(100vh - 280px)" }}
        >
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in-up">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-600">
                Your cart is empty
              </p>
              <p className="text-xs sm:text-sm mt-2 text-gray-500">
                Add some delicious items!
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-in-right border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-textPrimary text-xs sm:text-sm line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1 sm:mb-2 line-clamp-1">
                      {item.restaurant}
                    </p>
                    <p className="gradient-text font-bold text-base sm:text-lg">
                      ৳{item.price}
                    </p>

                    {/* Premium Quantity Controls */}
                    <div className="flex items-center space-x-1.5 sm:space-x-2 mt-2 sm:mt-3">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-gray-300 hover:shadow-soft transition-all duration-300 active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-bold text-textPrimary text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary text-white rounded-lg sm:rounded-xl flex items-center justify-center hover:shadow-soft transition-all duration-300 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Footer - Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-4 sm:px-5 pt-4 sm:pt-5 pb-6 sm:pb-8 bg-white shadow-large">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <span className="text-base sm:text-lg font-semibold text-gray-600">
                Total:
              </span>
              <span className="text-2xl sm:text-3xl font-bold gradient-text font-display">
                ৳{totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-accent text-textPrimary py-3 sm:py-4 rounded-xl hover:shadow-xl-yellow transition-all duration-300 font-bold text-base sm:text-lg shadow-soft transform hover:-translate-y-1 flex items-center justify-center gap-2 group mb-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
