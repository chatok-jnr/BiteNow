import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Store } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#ACD4B1] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
    >
      {/* Rating Badge - Top Right */}
      <div className="absolute top-2 right-2 z-10 bg-white rounded-full px-2 py-1 shadow-md flex items-center space-x-1">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        <span className="text-xs font-bold text-gray-800">
          {restaurant.rating}
        </span>
      </div>

      <div className="aspect-video overflow-hidden bg-gray-200 flex items-center justify-center">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Store className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <div className="p-3">
        <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
          {restaurant.name}
        </h3>

        <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{restaurant.location}</span>
        </div>

        <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
          <Clock className="w-3 h-3" />
          <span>{restaurant.deliveryTime}</span>
        </div>

        {/* Spacer to match food card height */}
        <div className="mb-2">
          <div className="h-8"></div>
        </div>

        <button className="w-full bg-[#67A177] text-white py-2 px-3 rounded-lg hover:bg-[#5a8f68] font-semibold text-xs flex items-center justify-center space-x-1">
          <span>Order Now</span>
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
