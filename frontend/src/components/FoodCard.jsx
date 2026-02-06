import React from "react";
import { Star, Tag, Package } from "lucide-react";

const FoodCard = ({ food, showDiscount = false, onAddToCart }) => {
  const hasDiscount = showDiscount && food.discount > 0;

  return (
    <div className="bg-[#ACD4B1] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
      {/* Rating Badge - Top Right */}
      <div className="absolute top-2 right-2 z-10 bg-white rounded-full px-2 py-1 shadow-md flex items-center space-x-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs font-bold text-gray-800">{food.rating}</span>
      </div>

      <div className="aspect-video overflow-hidden bg-gray-200 flex items-center justify-center">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <div className="p-3">
        <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
          {food.name}
        </h3>
        {food.description && (
          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
            {food.description}
          </p>
        )}
        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
          {food.restaurant}
        </p>

        <div className="mb-2">
          {hasDiscount ? (
            <div className="flex items-center space-x-1">
              <span className="text-lg font-bold text-[#67A177]">
                ৳{food.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                ৳{food.originalPrice.toFixed(2)}
              </span>
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                {food.discount}% OFF
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-[#67A177]">
              ৳{food.price.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart && onAddToCart(food)}
          className="w-full bg-[#67A177] text-white py-2 px-3 rounded-lg hover:bg-[#5a8f68] font-semibold text-xs flex items-center justify-center space-x-1"
        >
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
