import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-tertiary rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-50 flex flex-col group cursor-pointer"
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover transition-transform duration-50 group-hover:scale-110" 
        />
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{restaurant.name}</h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{restaurant.location}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <Clock className="w-4 h-4" />
          <span>{restaurant.deliveryTime}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-primary bg-surface px-3 py-1 rounded-full">
            {restaurant.cuisine}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-700">{restaurant.rating}</span>
          </div>
        </div>
        
        <div className="mt-auto flex justify-end">
          <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-colors duration-300 font-semibold text-sm">
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
