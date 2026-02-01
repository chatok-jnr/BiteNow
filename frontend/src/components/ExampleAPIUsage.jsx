import { useState, useEffect } from 'react';
import { getAllRestaurants } from '../utils/restaurantService';
import { getFoodsByRestaurant } from '../utils/foodService';
import { addToCart, getCart } from '../utils/cartService';

/**
 * Example component showing how to use the API services
 * This demonstrates fetching restaurants, foods, and managing cart
 */
const ExampleAPIUsage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
    fetchCart();
  }, []);

  // Fetch foods when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      fetchFoods(selectedRestaurant._id);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllRestaurants({ limit: 20, page: 1 });
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getFoodsByRestaurant(restaurantId);
      setFoods(response.data.foods || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch foods');
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleAddToCart = async (foodId) => {
    try {
      setError(null);
      
      const updatedCart = await addToCart(foodId, 1);
      setCart(updatedCart);
      
      alert('Item added to cart!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
      console.error('Error adding to cart:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {/* Cart Summary */}
      {cart && (
        <div className="bg-blue-100 border border-blue-400 p-4 rounded mb-6">
          <h3 className="font-bold mb-2">Cart Summary</h3>
          <p>Items: {cart.items?.length || 0}</p>
          <p>Restaurant: {cart.restaurant_id?.restaurant_name || 'N/A'}</p>
        </div>
      )}

      {/* Restaurants List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => setSelectedRestaurant(restaurant)}
              className={`border p-4 rounded cursor-pointer hover:shadow-lg transition ${
                selectedRestaurant?._id === restaurant._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              {restaurant.restaurant_image?.url && (
                <img
                  src={restaurant.restaurant_image.url}
                  alt={restaurant.restaurant_name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold">{restaurant.restaurant_name}</h3>
              <p className="text-sm text-gray-600">{restaurant.restaurant_address}</p>
              <p className="text-sm text-gray-500">
                {restaurant.is_open ? '🟢 Open' : '🔴 Closed'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Foods List */}
      {selectedRestaurant && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Menu from {selectedRestaurant.restaurant_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => (
              <div key={food._id} className="border border-gray-300 p-4 rounded">
                {food.food_image?.url && (
                  <img
                    src={food.food_image.url}
                    alt={food.food_name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-bold">{food.food_name}</h3>
                <p className="text-sm text-gray-600 mb-2">{food.food_description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">₹{food.food_price}</p>
                    {food.discount_percentage > 0 && (
                      <p className="text-sm text-green-600">
                        {food.discount_percentage}% OFF
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(food._id)}
                    disabled={!food.is_available}
                    className={`px-4 py-2 rounded ${
                      food.is_available
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {food.is_available ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExampleAPIUsage;
