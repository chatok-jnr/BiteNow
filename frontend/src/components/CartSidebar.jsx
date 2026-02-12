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
          <div className="relative flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow-yellow">
                <ShoppingCart className="w-5 h-5 text-textPrimary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display">Your Cart</h2>
                <p className="text-xs text-white/70">{cartItems.length} items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && onClearCart && (
                <button
                  onClick={onClearCart}
                  className="text-xs bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-soft hover:shadow-medium font-medium"
                  title="Clear entire cart"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items with Custom Scrollbar */}
        <div
          className="flex-1 overflow-y-auto p-5 custom-scrollbar"
          style={{ height: "calc(100vh - 220px)" }}
        >
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in-up">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-600">Your cart is empty</p>
              <p className="text-sm mt-2 text-gray-500">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 flex items-center space-x-4 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-in-right border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-textPrimary text-sm line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{item.restaurant}</p>
                    <p className="gradient-text font-bold text-lg">৳{item.price}</p>

                    {/* Premium Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-300 hover:shadow-soft transition-all duration-300 active:scale-95"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-bold text-textPrimary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gradient-primary text-white rounded-xl flex items-center justify-center hover:shadow-soft transition-all duration-300 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
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
          <div className="border-t border-gray-100 p-5 bg-white shadow-large">
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-semibold text-gray-600">
                Total:
              </span>
              <span className="text-3xl font-bold gradient-text font-display">
                ৳{totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-accent text-textPrimary py-4 rounded-xl hover:shadow-xl-yellow transition-all duration-300 font-bold text-lg shadow-soft transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
