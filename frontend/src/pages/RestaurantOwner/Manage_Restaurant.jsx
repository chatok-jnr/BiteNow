import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Plus,
  X,
  Search,
  MoreVertical,
  Edit2,
  Package,
  Trash2,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ChefHat,
  Bike,
  AlertCircle,
  Loader,
  ArrowLeft,
} from "lucide-react";
import ApprovalMessage from "../../components/ApprovalMessage";
import { useNotification } from "../../contexts/NotificationContext";
import foodService from "../../utils/foodService";
import {
  getOrdersByRestaurant,
  updateOrderStatusByRestaurant,
  verifyRiderPin,
} from "../../utils/orderService";
import { getMyRestaurantById } from "../../utils/restaurantService";

const Manage_Restaurant = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [activeMode, setActiveMode] = useState("food");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [showFoodDetailsModal, setShowFoodDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [riderPin, setRiderPin] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Get restaurant ID from localStorage or context
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [ownerStatus, setOwnerStatus] = useState(null);
  const [restaurantStatus, setRestaurantStatus] = useState(null);

  const [foods, setFoods] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  const [foodForm, setFoodForm] = useState({
    food_name: "",
    food_description: "",
    food_price: "",
    food_quantity: "",
    discount_percentage: 0,
    tags: "",
  });

  // Load restaurant info on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("User data:", user);

        // Check owner status
        setOwnerStatus(user.restaurant_owner_status || user.status);

        // Try to find restaurant ID from user data
        if (user.restaurant_id) {
          setRestaurantId(user.restaurant_id);
        } else if (user.restaurants && user.restaurants.length > 0) {
          setRestaurantId(user.restaurants[0]._id || user.restaurants[0]);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // Get restaurant status from navigation state
    const navState = window.history.state?.usr;
    if (navState?.restaurant) {
      setRestaurant(navState.restaurant);
      setRestaurantStatus(navState.restaurant.restaurant_status);
    }
  }, []);

  // Fetch restaurant details when restaurant ID is available
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      console.log("Fetching restaurant details for ID:", restaurantId);

      const response = await getMyRestaurantById(restaurantId);
      console.log("Restaurant details response:", response);

      if (response.status === "success" && response.data?.restaurant) {
        const restaurantData = response.data.restaurant;
        setRestaurant(restaurantData);
        setRestaurantStatus(restaurantData.restaurant_status);
        console.log(
          "Restaurant status set to:",
          restaurantData.restaurant_status,
        );
      }
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      showError(
        err.response?.data?.message || "Failed to fetch restaurant details",
      );
      // If fetch fails, redirect back to restaurants page
      setTimeout(() => {
        navigate("/restaurant_owner/restaurants");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch foods when restaurant ID changes
  useEffect(() => {
    if (restaurantId) {
      fetchFoods();
    }
  }, [restaurantId]);

  // Fetch orders when restaurant ID changes or active mode changes
  useEffect(() => {
    if (restaurantId && activeMode === "order") {
      fetchOrders();
    }
  }, [restaurantId, activeMode]);

  const fetchFoods = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const response = await foodService.getFoodsByRestaurant(restaurantId);
      console.log("Foods response:", response);
      setFoods(response.data?.foods || []);
    } catch (err) {
      console.error("Error fetching foods:", err);
      showError(err.response?.data?.message || "Failed to fetch foods");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const response = await getOrdersByRestaurant(restaurantId);
      console.log("Orders response:", response);
      setAllOrders(response.data?.myOrder || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (
      !foodForm.food_name ||
      !foodForm.food_price ||
      !foodForm.food_quantity ||
      !foodForm.food_description
    ) {
      showError("Please fill all required fields");
      return;
    }

    if (parseFloat(foodForm.food_price) < 50) {
      showError("Food price cannot be less than 50");
      return;
    }

    if (foodForm.food_description.trim().length < 10) {
      showError("Food description must be at least 10 characters");
      return;
    }

    // Check approval status
    if (ownerStatus !== "Approved") {
      showError("Your account must be approved before you can add food items");
      return;
    }

    if (restaurantStatus !== "Accepted") {
      showError(
        "This restaurant must be accepted before you can add food items",
      );
      return;
    }

    try {
      setLoading(true);

      const foodData = {
        restaurant_id: restaurantId,
        food_name: foodForm.food_name,
        food_description: foodForm.food_description,
        food_price: parseFloat(foodForm.food_price),
        food_quantity: parseInt(foodForm.food_quantity),
        discount_percentage: parseInt(foodForm.discount_percentage) || 0,
        tags: foodForm.tags
          ? foodForm.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      const response = await foodService.createFood(foodData);
      console.log("Food created:", response);

      const newFood = response.data?.newFood || response.data;

      // Upload image if one was selected
      if (imageFile && newFood._id) {
        try {
          console.log("Uploading image for food:", newFood._id);
          await foodService.uploadFoodImage(newFood._id, imageFile);
          console.log("Image uploaded successfully");
        } catch (imgError) {
          console.error("Image upload failed:", imgError);
          // Don't fail the whole operation if image upload fails
          showSuccess(
            "Food added but image upload failed. You can add an image later.",
          );
        }
      }

      if (!imageFile || newFood._id) {
        showSuccess("Food added successfully!");
      }

      setShowAddFoodModal(false);
      setFoodForm({
        food_name: "",
        food_description: "",
        food_price: "",
        food_quantity: "",
        discount_percentage: 0,
        tags: "",
      });
      setImageFile(null);
      setImagePreview(null);

      // Refresh foods list
      await fetchFoods();
    } catch (err) {
      console.error("Error adding food:", err);
      showError(err.response?.data?.message || "Failed to add food");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFood = async () => {
    if (
      !selectedFood ||
      !foodForm.food_name ||
      !foodForm.food_price ||
      !foodForm.food_description
    ) {
      showError("Please fill all required fields");
      return;
    }

    if (parseFloat(foodForm.food_price) < 50) {
      showError("Food price cannot be less than 50");
      return;
    }

    if (foodForm.food_description.trim().length < 10) {
      showError("Food description must be at least 10 characters");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        food_name: foodForm.food_name,
        food_description: foodForm.food_description,
        food_price: parseFloat(foodForm.food_price),
        food_quantity: parseInt(foodForm.food_quantity),
        discount_percentage: parseInt(foodForm.discount_percentage) || 0,
        tags: foodForm.tags
          ? foodForm.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      await foodService.updateFood(selectedFood._id, updateData);

      showSuccess("Food updated successfully!");
      setShowEditFoodModal(false);
      setSelectedFood(null);

      // Refresh foods list
      await fetchFoods();
    } catch (err) {
      console.error("Error updating food:", err);
      showError(err.response?.data?.message || "Failed to update food");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!foodToDelete) return;

    try {
      setLoading(true);

      await foodService.deleteFood(foodToDelete);

      showSuccess("Food deleted successfully!");
      setShowDeleteConfirmModal(false);
      setFoodToDelete(null);

      // Refresh foods list
      await fetchFoods();
    } catch (err) {
      console.error("Error deleting food:", err);
      showError(err.response?.data?.message || "Failed to delete food");
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (foodId) => {
    const quantity = prompt("Enter quantity to add to stock:");

    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      showError("Please enter a valid quantity");
      return;
    }

    try {
      setLoading(true);

      setActiveDropdown(null);

      await foodService.restockFood(foodId, parseInt(quantity));

      showSuccess("Food restocked successfully!");

      // Refresh foods list
      await fetchFoods();
    } catch (err) {
      console.error("Error restocking food:", err);
      showError(err.response?.data?.message || "Failed to restock food");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // Check approval status
    if (ownerStatus !== "Approved") {
      showError("Your account must be approved to manage orders");
      return;
    }

    if (restaurantStatus !== "Accepted") {
      showError("This restaurant must be accepted to manage orders");
      return;
    }

    try {
      setLoading(true);

      console.log("Updating order status:", { orderId, newStatus });
      const response = await updateOrderStatusByRestaurant(orderId, newStatus);
      console.log("Update response:", response);

      showSuccess(`Order status updated to ${newStatus}!`);

      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      console.error("Error details:", err.response?.data);
      showError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!riderPin || riderPin.length !== 4) {
      showError("Please enter a valid 4-digit PIN");
      return;
    }

    try {
      setLoading(true);

      // Call API to verify the rider PIN
      await verifyRiderPin(selectedOrder._id, riderPin);

      setShowPinModal(false);
      setRiderPin("");
      showSuccess("Rider verified! Order is now out for delivery.");

      // Refresh orders after successful verification
      await fetchOrders();
    } catch (err) {
      console.error("Error verifying rider PIN:", err);
      showError(err.response?.data?.message || "Failed to verify PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleFoodImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should not exceed 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (food) => {
    setSelectedFood(food);
    setFoodForm({
      food_name: food.food_name,
      food_description: food.food_description,
      food_price: food.food_price,
      food_quantity: food.food_quantity,
      discount_percentage: food.discount_percentage || 0,
      tags: food.tags ? food.tags.join(", ") : "",
    });
    setShowEditFoodModal(true);
    setActiveDropdown(null);
  };

  // Filter foods by search query
  const filteredFoods = foods.filter((f) =>
    f.food_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter and categorize orders
  const categorizeOrders = () => {
    const categorized = {
      pending: [],
      look_rider: [],
      preparing: [],
      ready_for_pickup: [],
      out_for_delivery: [],
      delivered: [],
      cancelled: [],
    };

    allOrders.forEach((order) => {
      const status = order.order_status;
      if (categorized[status]) {
        categorized[status].push(order);
      }
    });

    return categorized;
  };

  const categorizedOrders = categorizeOrders();
  const filteredOrders = (
    categorizedOrders[orderStatus]?.filter(
      (o) =>
        o.customer_id?.customer_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const OrderCard = ({ order }) => {
    const subtotal = order.subtotal || 0;
    const deliveryCharge = order.delivery_charge || 0;
    const total = order.total_amount || subtotal + deliveryCharge;

    const statusColors = {
      pending: "bg-yellow-500",
      look_rider: "bg-blue-500",
      preparing: "bg-purple-500",
      ready_for_pickup: "bg-indigo-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };

    const statusLabels = {
      pending: "Pending",
      look_rider: "Looking for Rider",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return (
      <div
        className="bg-tertiary rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => {
          setSelectedOrder(order);
          setShowOrderDetailsModal(true);
        }}
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-xl font-bold text-gray-800 truncate">
            #{order.order_id}
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap flex-shrink-0 ${statusColors[order.order_status]}`}
          >
            {statusLabels[order.order_status]}
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Customer</p>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {typeof order.customer_id === "object" &&
              order.customer_id !== null
                ? order.customer_id.customer_name || "Unknown Customer"
                : `Customer #${
                    String(order.customer_id || "")
                      .slice(-6)
                      .toUpperCase() || "—"
                  }`}
            </span>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Delivery</span>
            <span className="font-semibold">৳{deliveryCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-secondary/30">
            <span className="font-bold">Total</span>
            <span className="font-bold text-primary">৳{total.toFixed(2)}</span>
          </div>
        </div>

        {order.order_status === "pending" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateOrderStatus(order._id, "cancelled");
              }}
              className="bg-red-500 text-white py-2 rounded-full hover:bg-red-600 font-semibold whitespace-nowrap text-sm"
            >
              Reject
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateOrderStatus(order._id, "look_rider");
              }}
              className="bg-primary text-white py-2 rounded-full hover:bg-accent-dark font-semibold whitespace-nowrap text-sm"
            >
              Accept
            </button>
          </div>
        )}

        {order.order_status === "look_rider" &&
          (order.rider_id ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateOrderStatus(order._id, "preparing");
              }}
              className="w-full bg-green-500 text-white py-3 rounded-full hover:bg-green-600 font-semibold flex items-center justify-center gap-2"
            >
              <ChefHat className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Start Preparing</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showWarning(
                  "Rider not found yet. Please wait until a rider accepts the order.",
                );
              }}
              className="w-full bg-gray-300 text-gray-500 py-3 rounded-full font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <ChefHat className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Waiting for Rider...</span>
            </button>
          ))}

        {order.order_status === "preparing" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateOrderStatus(order._id, "ready_for_pickup");
            }}
            className="w-full bg-primary text-white py-3 rounded-full hover:bg-accent-dark font-semibold flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Mark Ready for Pickup</span>
          </button>
        )}

        {order.order_status === "ready_for_pickup" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
              setShowPinModal(true);
            }}
            className="w-full bg-primary text-white py-3 rounded-full hover:bg-accent-dark font-semibold flex items-center justify-center gap-2"
          >
            <Bike className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Hand to Rider</span>
          </button>
        )}
      </div>
    );
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Restaurant Found
          </h2>
          <p className="text-gray-600">
            Please create a restaurant first or log in as a restaurant owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgPrimary">
      {/* Header */}
      <div className="bg-secondary py-4 sm:py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button
              onClick={() => navigate("/restaurant_owner/restaurants")}
              className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-full transition-all duration-200 flex items-center justify-center backdrop-blur-sm flex-shrink-0"
              title="Back to All Restaurants"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <Store className="w-10 h-10 sm:w-16 sm:h-16 text-white flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-white mb-1 truncate">
                {restaurant?.restaurant_name || "Manage Restaurant"}
              </h1>
              <p className="text-white/90 text-sm">Food & Order Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Check if owner or restaurant is not approved */}
      {(ownerStatus && ownerStatus !== "Approved") ||
      (restaurantStatus && restaurantStatus !== "Accepted") ? (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            {ownerStatus && ownerStatus !== "Approved" ? (
              <ApprovalMessage
                status={ownerStatus}
                entityType="restaurant owner account"
                message="Your account is pending approval. You can view but cannot add food or manage orders until approved."
              />
            ) : (
              <ApprovalMessage
                status={restaurantStatus}
                entityType="restaurant"
                message="This restaurant is pending acceptance. You can view but cannot add food or manage orders until accepted by admin."
              />
            )}
          </div>
        </div>
      ) : null}

      {/* Mode Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveMode("food")}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-full font-semibold transition-all text-sm sm:text-base ${activeMode === "food" ? "bg-primary text-white shadow-lg" : "bg-tertiary text-gray-700"}`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Manage </span>Food
          </button>
          <button
            onClick={() => setActiveMode("order")}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-full font-semibold transition-all text-sm sm:text-base ${activeMode === "order" ? "bg-primary text-white shadow-lg" : "bg-tertiary text-gray-700"}`}
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Manage </span>Orders
          </button>
        </div>

        {/* FOOD MANAGEMENT */}
        {activeMode === "food" && (
          <div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="w-full sm:max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search foods..."
                  className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>
              <button
                onClick={() => {
                  if (ownerStatus !== "Approved") {
                    alert(
                      "Your account must be approved before you can add food items",
                    );
                    return;
                  }
                  if (restaurantStatus !== "Accepted") {
                    alert(
                      "This restaurant must be accepted before you can add food items",
                    );
                    return;
                  }
                  setShowAddFoodModal(true);
                }}
                disabled={
                  ownerStatus !== "Approved" || restaurantStatus !== "Accepted"
                }
                className="bg-primary text-white px-6 py-3 rounded-full hover:bg-accent-dark font-semibold flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
              >
                <Plus className="w-5 h-5" />
                <span>Add Food</span>
              </button>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-16">
                <Loader className="w-12 h-12 text-primary animate-spin" />
              </div>
            )}

            {!loading && filteredFoods.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-600">
                  No Food Items
                </h3>
                <p className="text-gray-500 mt-2">
                  Add your first food item to get started
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="bg-tertiary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video overflow-hidden bg-gray-200 flex items-center justify-center">
                    {food.food_image?.url ? (
                      <img
                        src={food.food_image.url}
                        alt={food.food_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
                      {food.food_name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 h-8">
                      {food.food_description}
                    </p>
                    <div className="mb-2">
                      {food.discount_percentage > 0 ? (
                        <div className="flex items-center space-x-1 flex-wrap">
                          <span className="text-lg font-bold text-primary">
                            ৳
                            {(
                              food.food_price *
                              (1 - food.discount_percentage / 100)
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            ৳{food.food_price.toFixed(2)}
                          </span>
                          <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                            {food.discount_percentage}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          ৳{food.food_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="bg-surface px-2 py-1 rounded-lg mb-3">
                      <p className="text-xs text-gray-600">
                        Stock:{" "}
                        <span
                          className={`font-bold ${food.food_quantity < 10 ? "text-red-600" : "text-gray-800"}`}
                        >
                          {food.food_quantity}
                        </span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openEditModal(food)}
                        className="bg-primary text-white py-2 px-3 rounded-lg hover:bg-accent-dark font-semibold text-xs flex items-center justify-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update</span>
                      </button>
                      <button
                        onClick={() => {
                          setFoodToDelete(food._id);
                          setShowDeleteConfirmModal(true);
                        }}
                        className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 font-semibold text-xs flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDER MANAGEMENT */}
        {activeMode === "order" && (
          <div>
            <div className="mb-4 sm:mb-6">
              <div className="relative max-w-full sm:max-w-md mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  "pending",
                  "look_rider",
                  "preparing",
                  "ready_for_pickup",
                  "out_for_delivery",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatus(status)}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-semibold transition-all text-xs text-center w-full ${
                      orderStatus === status
                        ? "bg-primary text-white shadow-md"
                        : "bg-tertiary text-gray-700 hover:bg-secondary/20"
                    }`}
                  >
                    <span className="leading-tight">
                      {status
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        orderStatus === status
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {categorizedOrders[status]?.length || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-16">
                <Loader className="w-12 h-12 text-primary animate-spin" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}

              {!loading && filteredOrders.length === 0 && (
                <div className="col-span-1 md:col-span-3 text-center py-16">
                  <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600">
                    No Orders
                  </h3>
                  <p className="text-gray-500 mt-2">
                    No {orderStatus} orders at the moment
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddFoodModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddFoodModal(false);
              setImageFile(null);
              setImagePreview(null);
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Add New Food</h2>
              <button
                onClick={() => {
                  setShowAddFoodModal(false);
                  setFoodForm({
                    food_name: "",
                    food_description: "",
                    food_price: "",
                    food_quantity: "",
                    discount_percentage: 0,
                    tags: "",
                  });
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={foodForm.food_name}
                  onChange={(e) =>
                    setFoodForm({ ...foodForm, food_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Food Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFoodImageUpload}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white text-sm"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-secondary"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Price * (min: 50)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    value={foodForm.food_price}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, food_price: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={foodForm.food_quantity}
                    onChange={(e) =>
                      setFoodForm({
                        ...foodForm,
                        food_quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={foodForm.discount_percentage}
                  onChange={(e) =>
                    setFoodForm({
                      ...foodForm,
                      discount_percentage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={foodForm.tags}
                  onChange={(e) =>
                    setFoodForm({ ...foodForm, tags: e.target.value })
                  }
                  placeholder="vegetarian, spicy, popular"
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description * (min: 10 characters)
                </label>
                <textarea
                  value={foodForm.food_description}
                  onChange={(e) =>
                    setFoodForm({
                      ...foodForm,
                      food_description: e.target.value,
                    })
                  }
                  rows="3"
                  minLength="10"
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white resize-none"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowAddFoodModal(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFood}
                  className="flex-1 bg-primary text-white py-3 rounded-full hover:bg-accent-dark font-semibold"
                >
                  Add Food
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditFoodModal && selectedFood && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditFoodModal(false);
              setSelectedFood(null);
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Edit Food</h2>
              <button
                onClick={() => {
                  setShowEditFoodModal(false);
                  setSelectedFood(null);
                  setFoodForm({
                    food_name: "",
                    food_description: "",
                    food_price: "",
                    food_quantity: "",
                    discount_percentage: 0,
                    tags: "",
                  });
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={foodForm.food_name}
                  onChange={(e) =>
                    setFoodForm({ ...foodForm, food_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Price * (min: 50)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    value={foodForm.food_price}
                    onChange={(e) =>
                      setFoodForm({ ...foodForm, food_price: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={foodForm.food_quantity}
                    onChange={(e) =>
                      setFoodForm({
                        ...foodForm,
                        food_quantity: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={foodForm.discount_percentage}
                  onChange={(e) =>
                    setFoodForm({
                      ...foodForm,
                      discount_percentage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={foodForm.tags}
                  onChange={(e) =>
                    setFoodForm({ ...foodForm, tags: e.target.value })
                  }
                  placeholder="vegetarian, spicy, popular"
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description * (min: 10 characters)
                </label>
                <textarea
                  value={foodForm.food_description}
                  onChange={(e) =>
                    setFoodForm({
                      ...foodForm,
                      food_description: e.target.value,
                    })
                  }
                  rows="3"
                  minLength="10"
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white resize-none"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowEditFoodModal(false);
                    setSelectedFood(null);
                  }}
                  className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFood}
                  className="flex-1 bg-primary text-white py-3 rounded-full hover:bg-accent-dark font-semibold"
                >
                  Update Food
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirmModal(false);
              setFoodToDelete(null);
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Delete Food Item
              </h2>
              <p className="text-gray-600">
                Are you sure you want to delete this food item? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setFoodToDelete(null);
                }}
                className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFood}
                className="flex-1 bg-red-500 text-white py-3 rounded-full hover:bg-red-600 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showFoodDetailsModal && selectedFood && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFoodDetailsModal(false);
              setSelectedFood(null);
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedFood.name}</h2>
              <button
                onClick={() => {
                  setShowFoodDetailsModal(false);
                  setSelectedFood(null);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={selectedFood.image}
              alt={selectedFood.name}
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
            <div className="space-y-3">
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ৳{selectedFood.price.toFixed(2)}
                </p>
              </div>
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm text-gray-600">Stock</p>
                <p className="text-xl font-bold">
                  {selectedFood.quantity} units
                </p>
              </div>
              {selectedFood.discount > 0 && (
                <div className="bg-tertiary p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Discount</p>
                  <p className="text-xl font-bold text-red-600">
                    {selectedFood.discount}%
                  </p>
                </div>
              )}
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800">
                  {selectedFood.description || "No description"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPinModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPinModal(false);
              setRiderPin("");
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Verify Rider PIN</h2>
            <p className="text-gray-600 mb-4">
              Enter the PIN from the rider to confirm pickup
            </p>
            <input
              type="text"
              value={riderPin}
              onChange={(e) => setRiderPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 rounded-lg border-2 border-secondary focus:border-primary focus:outline-none bg-white mb-4 text-center text-2xl font-bold tracking-widest"
              maxLength="4"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setRiderPin("");
                }}
                className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPin}
                className="flex-1 bg-primary text-white py-3 rounded-full hover:bg-accent-dark font-semibold"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderDetailsModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderDetailsModal(false);
              setSelectedOrder(null);
            }
          }}
        >
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Order Details - #{selectedOrder.order_id}
              </h2>
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false);
                  setSelectedOrder(null);
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-tertiary p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                      selectedOrder.order_status === "pending"
                        ? "bg-yellow-500"
                        : selectedOrder.order_status === "look_rider"
                          ? "bg-orange-500"
                          : selectedOrder.order_status === "ready_for_pickup"
                            ? "bg-purple-500"
                            : selectedOrder.order_status === "preparing"
                              ? "bg-blue-500"
                              : selectedOrder.order_status ===
                                  "out_for_delivery"
                                ? "bg-green-500"
                                : selectedOrder.order_status === "delivered"
                                  ? "bg-primary"
                                  : "bg-gray-500"
                    }`}
                  >
                    {selectedOrder.order_status
                      ? selectedOrder.order_status
                          .replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")
                      : "Unknown"}
                  </div>
                </div>
              </div>
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Customer Information
                </p>
                {typeof selectedOrder.customer_id === "object" &&
                selectedOrder.customer_id !== null ? (
                  <div className="space-y-2">
                    {selectedOrder.customer_id.customer_name && (
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">
                          {selectedOrder.customer_id.customer_name}
                        </span>
                      </div>
                    )}
                    {selectedOrder.customer_id.customer_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{selectedOrder.customer_id.customer_phone}</span>
                      </div>
                    )}
                    {selectedOrder.customer_id.customer_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{selectedOrder.customer_id.customer_email}</span>
                      </div>
                    )}
                    {selectedOrder.special_instruction && (
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="italic">
                          {selectedOrder.special_instruction}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <User className="w-5 h-5" />
                    <span className="text-sm">
                      Customer #
                      {String(selectedOrder.customer_id)
                        .slice(-6)
                        .toUpperCase()}
                    </span>
                    {selectedOrder.special_instruction && (
                      <span className="ml-2 text-xs italic text-gray-400">
                        — {selectedOrder.special_instruction}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Order Items
                </p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b border-secondary/30 last:border-0"
                    >
                      <div>
                        <p className="font-semibold">{item.food_name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        ৳
                        {(
                          item.total_price ||
                          (item.unit_price || 0) * (item.quantity || 1)
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.rider_id && (
                <div className="bg-primary p-4 rounded-xl text-white">
                  <p className="text-sm font-semibold mb-3">
                    Rider Information
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {typeof selectedOrder.rider_id === "object"
                          ? selectedOrder.rider_id?.rider_name ||
                            "Assigned Rider"
                          : "Assigned Rider"}
                      </p>
                      <p className="text-sm opacity-80">
                        {typeof selectedOrder.rider_id === "object"
                          ? selectedOrder.rider_id?.rider_email || ""
                          : ""}
                      </p>
                    </div>
                    <Bike className="w-8 h-8" />
                  </div>
                </div>
              )}
              <div className="bg-tertiary p-4 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Payment Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Food Subtotal</span>
                    <span className="font-semibold">
                      ৳{(selectedOrder.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-semibold">
                      ৳{(selectedOrder.delivery_charge || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl pt-2 border-t border-secondary/30">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">
                      ৳{(selectedOrder.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage_Restaurant;
