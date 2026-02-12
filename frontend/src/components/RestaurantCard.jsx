import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Clock, Store, ArrowRight } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 cursor-pointer relative animate-fade-in-up"
    >
      
      {/* Rating Badge - Top Right */}
      <div className="absolute top-3 right-3 z-20 glass-card rounded-full px-3 py-1.5 shadow-soft flex items-center space-x-1 float-badge">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-bold text-gray-800">
          {restaurant.rating}
        </span>
      </div>

      {/* Image */}
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Store className="w-16 h-16 text-gray-300" />
        )}
        
        {/* Delivery time badge */}
        <div className="absolute bottom-3 left-3 glass-card rounded-full px-3 py-1.5 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-gray-800">
            {restaurant.deliveryTime}
          </span>
        </div>
      </div>

      <div className="p-4 relative z-10">
        <h3 className="text-lg font-bold text-textPrimary mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {restaurant.name}
        </h3>

        <div className="flex items-center space-x-1.5 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="line-clamp-1">{restaurant.location}</span>
        </div>

        <button className="w-full bg-gradient-accent text-textPrimary py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-soft hover:shadow-lg transition-all duration-300 group/btn">
          <span>Order Now</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
