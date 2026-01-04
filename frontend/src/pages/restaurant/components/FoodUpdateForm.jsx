import { useState, useEffect, useRef } from "react";
import foodService from "../../../utils/foodService";

/**
 * FoodUpdateForm Component
 * A standalone component to fetch and update a single food item by ID
 *
 * Features:
 * - Fetches food by ID on mount
 * - Pre-fills form with existing data
 * - Shows current food image from Cloudinary
 * - Allows replacing image (optional)
 * - Image preview before upload
 * - Loading states and error handling
 * - Success/error messages
 */
function FoodUpdateForm({ foodId, onSuccess, onCancel }) {
  // Form state
  const [formData, setFormData] = useState({
    food_name: "",
    food_description: "",
    food_price: "",
    food_quantity: "",
    discount_percentage: "",
    tags: [],
    food_category: "Main Course",
  });

  // Original food data
  const [originalFood, setOriginalFood] = useState(null);

  // Image handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Loading and status states
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tag input
  const [tagInput, setTagInput] = useState("");

  const categories = ["Appetizers", "Main Course", "Desserts", "Drinks"];

  // Fetch food data on mount
  useEffect(() => {
    if (foodId) {
      fetchFoodData();
    }
  }, [foodId]);

  const fetchFoodData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await foodService.getFood(foodId);

      if (response.status === "success" && response.data?.food) {
        const food = response.data.food;
        setOriginalFood(food);

        // Pre-fill form with existing data
        setFormData({
          food_name: food.food_name || "",
          food_description: food.food_description || "",
          food_price: food.food_price?.toString() || "",
          food_quantity: food.food_quantity?.toString() || "",
          discount_percentage: food.discount_percentage?.toString() || "0",
          tags: food.tags || [],
          food_category: food.tags?.[0] || "Main Course",
        });
      } else {
        setError("Food item not found");
      }
    } catch (err) {
      console.error("Error fetching food:", err);
      setError(err.response?.data?.message || "Failed to fetch food details");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Update food details
      const updateData = {
        food_name: formData.food_name,
        food_description: formData.food_description,
        food_price: parseFloat(formData.food_price),
        food_quantity: parseInt(formData.food_quantity),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        tags: formData.tags,
      };

      await foodService.updateFood(foodId, updateData);

      // If there's a new image, upload/update it
      if (imageFile) {
        setIsUploadingImage(true);
        try {
          const hasExistingImage = originalFood?.food_image?.public_id;
          await foodService.uploadOrUpdateImage(
            foodId,
            imageFile,
            hasExistingImage
          );
        } catch (imgError) {
          console.error("Image upload error:", imgError);
          setError(
            `Food updated but image upload failed: ${
              imgError.response?.data?.message || imgError.message
            }`
          );
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        }
        setIsUploadingImage(false);
      }

      setSuccess("Food item updated successfully!");

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      console.error("Error updating food:", err);
      setError(err.response?.data?.message || "Failed to update food item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      setError("");

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete existing food image
  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await foodService.deleteFoodImage(foodId);
      setOriginalFood({
        ...originalFood,
        food_image: { url: null, public_id: null, altText: "Food image" },
      });
      setSuccess("Image deleted successfully!");
    } catch (err) {
      console.error("Error deleting image:", err);
      setError(err.response?.data?.message || "Failed to delete image");
    }
  };

  // Tag management
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (!originalFood && !loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || "Food item not found"}</p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Update Food Item</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Food Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Name *
          </label>
          <input
            type="text"
            value={formData.food_name}
            onChange={(e) =>
              setFormData({ ...formData, food_name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.food_description}
            onChange={(e) =>
              setFormData({ ...formData, food_description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            required
            minLength={10}
            maxLength={500}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
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
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput.trim());
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={() => addTag(tagInput.trim())}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Add
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Image
          </label>

          {/* Current Image */}
          {originalFood?.food_image?.url && !imagePreview && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Current Image:</p>
              <div className="relative inline-block">
                <img
                  src={originalFood.food_image.url}
                  alt={originalFood.food_image.altText || "Food image"}
                  className="w-40 h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  title="Delete image"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* New Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">New Image Preview:</p>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            {originalFood?.food_image?.url
              ? "Select a new image to replace the current one"
              : "Max size: 5MB. Supported: JPG, PNG, GIF, WebP"}
          </p>
        </div>

        {/* Price and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.food_category}
              onChange={(e) =>
                setFormData({ ...formData, food_category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (৳) *
            </label>
            <input
              type="number"
              value={formData.food_price}
              onChange={(e) =>
                setFormData({ ...formData, food_price: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              min="50"
              max="10000"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Quantity and Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.food_quantity}
              onChange={(e) =>
                setFormData({ ...formData, food_quantity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_percentage: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting || isUploadingImage}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isSubmitting || isUploadingImage}
          >
            {(isSubmitting || isUploadingImage) && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSubmitting
              ? "Updating..."
              : isUploadingImage
              ? "Uploading Image..."
              : "Update Food Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FoodUpdateForm;
