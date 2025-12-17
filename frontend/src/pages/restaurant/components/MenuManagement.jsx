import { useState } from "react";

function MenuManagement({ restaurantId, foodItems: initialFoodItems }) {
  const [foodItems, setFoodItems] = useState(initialFoodItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState("");

  const categories = ["all", "Appetizers", "Main Course", "Desserts", "Drinks"];

  const [formData, setFormData] = useState({
    food_name: "",
    food_description: "",
    food_price: "",
    food_quantity: "",
    discount_percentage: "",
    food_category: "Main Course",
    food_image_url: null,
  });

  const handleAddFood = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.food_image_url) {
      alert("Food image file is required");
      return;
    }
    
    // TODO: API call
    const newFood = {
      _id: `FOOD${Date.now()}`,
      restaurant_id: restaurantId,
      ...formData,
      food_price: parseFloat(formData.food_price),
      food_quantity: parseInt(formData.food_quantity),
      discount_percentage: parseInt(formData.discount_percentage) || 0,
      is_available: true,
      tags: [],
      average_rating: 0,
      rating_count: 0,
      food_images: [formData.food_image_url],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFoodItems([...foodItems, newFood]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditFood = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.food_image_url) {
      alert("Food image file is required");
      return;
    }
    
    // TODO: API call
    setFoodItems(
      foodItems.map((item) =>
        item._id === selectedFood._id
          ? {
              ...item,
              ...formData,
              food_price: parseFloat(formData.food_price),
              food_quantity: parseInt(formData.food_quantity),
              discount_percentage: parseInt(formData.discount_percentage) || 0,
              food_images: [formData.food_image_url],
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    setShowEditModal(false);
    setSelectedFood(null);
    resetForm();
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    // TODO: API call
    setFoodItems(foodItems.filter((item) => item._id !== foodId));
  };

  const handleToggleAvailability = async (foodId) => {
    // TODO: API call
    setFoodItems(
      foodItems.map((item) =>
        item._id === foodId
          ? { ...item, is_available: !item.is_available, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleRestock = async () => {
    if (!restockQuantity || parseInt(restockQuantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    // TODO: API call
    setFoodItems(
      foodItems.map((item) =>
        item._id === selectedFood._id
          ? {
              ...item,
              food_quantity: item.food_quantity + parseInt(restockQuantity),
              is_available: true,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
    setShowRestockModal(false);
    setRestockQuantity("");
    setSelectedFood(null);
  };

  const resetForm = () => {
    setFormData({
      food_name: "",
      food_description: "",
      food_price: "",
      food_quantity: "",
      discount_percentage: "",
      food_category: "Main Course",
      food_image_url: null,
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

  return (
    <div className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Image *</label>
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
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload an image file for the food item</p>
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Add Item
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Image *</label>
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
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload an image file for the food item</p>
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
