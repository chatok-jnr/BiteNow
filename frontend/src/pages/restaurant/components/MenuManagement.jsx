import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function MenuManagement({ restaurantId, foodItems: initialFoodItems }) {
  const [foodItems, setFoodItems] = useState(initialFoodItems || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["all", "Appetizers", "Main Course", "Desserts", "Drinks"];

  const [formData, setFormData] = useState({
    food_name: "",
    food_description: "",
    food_price: "",
    food_quantity: "",
    discount_percentage: "",
    tags: [],
    food_category: "Main Course",
    food_image_url: null,
  });

  useEffect(() => {
    if (restaurantId) {
      fetchFoodItems();
    }
  }, [restaurantId]);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/food/restaurant/${restaurantId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const data = await response.json();
      console.log('Food items response:', data);
      
      if (data.status === 'success' && data.data?.foods) {
        // Add food_category for frontend filtering
        const foodsWithCategory = data.data.foods.map(food => ({
          ...food,
          food_category: food.tags?.[0] || "Main Course"
        }));
        setFoodItems(foodsWithCategory);
      } else {
        setFoodItems([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setFoodItems([]);
      setLoading(false);
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      const requestBody = {
        restaurant_id: restaurantId,
        food_name: formData.food_name,
        food_description: formData.food_description,
        food_price: parseFloat(formData.food_price),
        food_quantity: parseInt(formData.food_quantity),
        tags: formData.tags,
        discount_percentage: parseInt(formData.discount_percentage) || 0,
      };

      console.log('=== CREATING FOOD ITEM ===');
      console.log('Restaurant ID:', restaurantId);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/v1/food`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create food item');
      }
      
      alert("Food item added successfully!");
      // Refetch the food list to ensure consistency
      await fetchFoodItems();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding food item:", error);
      alert(error.message || "Failed to create food item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFood = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      const requestBody = {
        food_name: formData.food_name,
        food_description: formData.food_description,
        food_price: parseFloat(formData.food_price),
        food_quantity: parseInt(formData.food_quantity),
        tags: formData.tags,
        discount_percentage: parseInt(formData.discount_percentage) || 0,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/food/${selectedFood._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update food item');
      }
      
      alert("Food item updated successfully!");
      await fetchFoodItems();
      setShowEditModal(false);
      setSelectedFood(null);
      resetForm();
    } catch (error) {
      console.error("Error updating food item:", error);
      alert(error.message || "Failed to update food item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/food/${foodId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete food item');
      }
      
      alert("Food item deleted successfully!");
      await fetchFoodItems();
    } catch (error) {
      console.error("Error deleting food item:", error);
      alert(error.message || "Failed to delete food item. Please try again.");
    }
  };

  const handleToggleAvailability = async (foodId) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      const currentFood = foodItems.find(item => item._id === foodId);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/food/${foodId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_available: !currentFood.is_available })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability');
      }
      
      await fetchFoodItems();
    } catch (error) {
      console.error("Error updating availability:", error);
      alert(error.message || "Failed to update availability. Please try again.");
    }
  };

  const handleRestock = async () => {
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("Please login again");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/food/${selectedFood._id}/restock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(restockQuantity) })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to restock food item');
      }
      
      alert("Food item restocked successfully!");
      await fetchFoodItems();
      setShowRestockModal(false);
      setRestockQuantity("");
      setSelectedFood(null);
    } catch (error) {
      console.error("Error restocking food item:", error);
      alert(error.message || "Failed to restock food item. Please try again.");
      setShowRestockModal(false);
      setRestockQuantity("");
      setSelectedFood(null);
    }
  };

  const resetForm = () => {
    setFormData({
      food_name: "",
      food_description: "",
      food_price: "",
      food_quantity: "",
      discount_percentage: "",
      tags: [],
      food_category: "Main Course",
      food_image_url: null,
    });
    setTagInput("");
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
    setTagInput("");
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const openEditModal = (food) => {
    setSelectedFood(food);
    setFormData({
      food_name: food.food_name,
      food_description: food.food_description,
      food_price: food.food_price.toString(),
      food_quantity: food.food_quantity.toString(),
      discount_percentage: food.discount_percentage.toString(),
      tags: food.tags || [],
      food_category: food.food_category,
      food_image_url: null,
    });
    setShowEditModal(true);
  };

  const openRestockModal = (food) => {
    setSelectedFood(food);
    setShowRestockModal(true);
  };

  const filteredItems =
    filterCategory === "all"
      ? foodItems
      : foodItems.filter((item) => item.food_category === filterCategory);

  const discountedItems = foodItems.filter((item) => item.discount_percentage > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">{/* Header */}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-500">{foodItems.length} items in menu</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{foodItems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {foodItems.filter((item) => item.is_available).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {foodItems.filter((item) => item.food_quantity === 0).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">On Discount</p>
          <p className="text-2xl font-bold text-primary">{discountedItems.length}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              filterCategory === category
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category === "all" ? "All Items" : category}
          </button>
        ))}
      </div>

      {/* Food Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first food item to the menu</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((food) => (
          <div
            key={food._id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              !food.is_available ? "border-red-200 bg-red-50" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{food.food_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{food.food_description}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {food.food_category}
                </span>
              </div>
              {!food.is_available && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  Unavailable
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-yellow-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">{food.average_rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({food.rating_count} reviews)</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              {food.discount_percentage > 0 ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    ৳{(food.food_price * (1 - food.discount_percentage / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">৳{food.food_price}</span>
                  <span className="px-2 py-1 bg-red-100 text-primary text-xs font-semibold rounded">
                    -{food.discount_percentage}%
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">৳{food.food_price}</span>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Stock:</span>
                <span
                  className={`text-sm font-semibold ${
                    food.food_quantity === 0
                      ? "text-red-600"
                      : food.food_quantity < 10
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {food.food_quantity} units
                </span>
              </div>
              {food.food_quantity < 10 && food.food_quantity > 0 && (
                <p className="text-xs text-yellow-600">Low stock!</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => openEditModal(food)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => openRestockModal(food)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Restock
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggleAvailability(food._id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  food.is_available
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {food.is_available ? "Mark Unavailable" : "Mark Available"}
              </button>
              <button
                onClick={() => handleDeleteFood(food._id)}
                className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Food Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Add New Food Item</h2>
            <form onSubmit={handleAddFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label>
                <input
                  type="text"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Opu vai er vat"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.food_description}
                  onChange={(e) => setFormData({ ...formData, food_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="e.g., lets try again"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput.trim());
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., best, Kabab, spicy"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput.trim())}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Add Tag
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or click Add Tag to add tags</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, food_image_url: file });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Image can be uploaded later</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.food_category}
                    onChange={(e) => setFormData({ ...formData, food_category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {categories.filter((c) => c !== "all").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.food_price}
                    onChange={(e) => setFormData({ ...formData, food_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quantity *</label>
                  <input
                    type="number"
                    value={formData.food_quantity}
                    onChange={(e) => setFormData({ ...formData, food_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditModal(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Edit Food Item</h2>
            <form onSubmit={handleEditFood} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label>
                <input
                  type="text"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.food_description}
                  onChange={(e) => setFormData({ ...formData, food_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput.trim());
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., best, Kabab, spicy"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput.trim())}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Add Tag
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or click Add Tag to add tags</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, food_image_url: file });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">Upload new image or leave empty to keep existing</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.food_category}
                    onChange={(e) => setFormData({ ...formData, food_category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {categories.filter((c) => c !== "all").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.food_price}
                    onChange={(e) => setFormData({ ...formData, food_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Quantity</label>
                  <input
                    type="number"
                    value={formData.food_quantity}
                    onChange={(e) => setFormData({ ...formData, food_quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFood(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Restock Item</h2>
            <p className="text-gray-600 mb-4">
              <strong>{selectedFood?.food_name}</strong>
              <br />
              Current stock: <span className="font-semibold">{selectedFood?.food_quantity} units</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Quantity</label>
              <input
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                min="1"
                placeholder="Enter quantity to add"
              />
            </div>
            {restockQuantity && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  New stock will be:{" "}
                  <strong>{selectedFood?.food_quantity + parseInt(restockQuantity || 0)} units</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setRestockQuantity("");
                  setSelectedFood(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuManagement;
