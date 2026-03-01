import React from "react";
import { Star, Tag, Package, ShoppingCart } from "lucide-react";

const FoodCard = ({ food, showDiscount = false, onAddToCart }) => {
  const hasDiscount = showDiscount && food.discount > 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 relative animate-fade-in-up">
      {/* Rating Badge - Top Right */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 glass-card rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-soft flex items-center space-x-1 float-badge">
        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-xs sm:text-sm font-bold text-gray-800">
          {food.rating}
        </span>
      </div>

      {/* Discount Badge - Top Left */}
      {hasDiscount && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 bg-gradient-primary text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-glow-red animate-pulse-slow">
          {food.discount}% OFF
        </div>
      )}

      {/* Image */}
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
        )}
      </div>

      <div className="p-3 sm:p-4 relative z-10">
        <h3 className="text-base sm:text-lg font-bold text-textPrimary mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {food.name}
        </h3>

        {food.description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        )}

        <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-1 flex items-center">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
          {food.restaurant}
        </p>

        <div className="mb-3 sm:mb-4">
          {hasDiscount ? (
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold gradient-text">
                ৳{food.price.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                ৳{food.originalPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xl sm:text-2xl font-bold gradient-text">
              ৳{food.price.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart && onAddToCart(food)}
          className="w-full bg-gradient-primary text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-soft hover:shadow-lg transition-all duration-300 group/btn"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
