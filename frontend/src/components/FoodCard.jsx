import React from 'react';
import { Star, Tag } from 'lucide-react';

const FoodCard = ({ food, showDiscount = false, onAddToCart }) => {
  return (
    <div className="bg-tertiary rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-100 flex flex-col group relative">
      {showDiscount && food.discount && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 font-bold shadow-lg">
            <Tag className="w-4 h-4" />
            <span>{food.discount}% OFF</span>
          </div>
        </div>
      )}
      
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={food.image} 
          alt={food.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        />
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{food.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{food.restaurant}</p>
        
        <div className="flex items-center justify-between mb-3">
          {showDiscount && food.originalPrice ? (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">${food.price}</span>
              <span className="text-sm text-gray-500 line-through">${food.originalPrice}</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-primary">${food.price}</span>
          )}
          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-700">{food.rating}</span>
          </div>
        </div>
        
        <div className="mt-auto flex justify-end">
          <button 
            onClick={() => onAddToCart && onAddToCart(food)}
            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-colors duration-300 font-semibold text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
