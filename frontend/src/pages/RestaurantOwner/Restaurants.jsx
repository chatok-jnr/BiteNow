import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, X, MapPin, Mail, Menu, Image, FileText, ChevronRight, Star, Package, Phone, Trash2 } from 'lucide-react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getMyRestaurants, createRestaurant, deleteRestaurant, uploadRestaurantImage } from '../../utils/restaurantService';

const Restaurants = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Store actual file for upload

  const [formData, setFormData] = useState({
    restaurant_name: '',
    restaurant_description: '',
    restaurant_address: '', // This should be a string
    address_details: { // Internal use only for the form
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    coordinates: [90.4125, 23.8103], // Dhaka, Bangladesh
    restaurant_contact_info: {
      phone: '',
      email: ''
    },
    restaurant_category: [], // Note: singular 'category'
    restaurant_opening_hours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    }
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const restaurantTypes = ['Italian', 'Chinese', 'Japanese', 'American', 'Mexican', 'Indian', 'Thai', 'Bangladeshi', 'Mediterranean', 'Korean', 'BBQ', 'Grill', 'Fast Food'];

  // Fetch restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyRestaurants();
      
      console.log('Fetch restaurants response:', response);
      
      if (response.status === 'success' || response.success) {
        // Handle different response formats
        const restaurantList = response.data?.restaurants || response.data || response.restaurants || [];
        
        // Ensure it's an array
        if (Array.isArray(restaurantList)) {
          setRestaurants(restaurantList);
        } else {
          console.warn('Restaurant data is not an array:', restaurantList);
          setRestaurants([]);
        }
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err.message || 'Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.startsWith('address_')) {
      const field = name.replace('address_', '');
      setFormData(prev => {
        const newAddressDetails = { ...prev.address_details, [field]: value };
        // Build the full address string
        const addressParts = [
          newAddressDetails.street,
          newAddressDetails.city,
          newAddressDetails.state,
          newAddressDetails.country,
          newAddressDetails.zipCode
        ].filter(part => part && part.trim());
        
        return {
          ...prev,
          address_details: newAddressDetails,
          restaurant_address: addressParts.join(', ')
        };
      });
    } else if (name.startsWith('contact_')) {
      const field = name.replace('contact_', '');
      setFormData(prev => ({
        ...prev,
        restaurant_contact_info: { ...prev.restaurant_contact_info, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = prev.restaurant_category.includes(category)
        ? prev.restaurant_category.filter(c => c !== category)
        : [...prev.restaurant_category, category];
      return { ...prev, restaurant_category: categories };
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      restaurant_opening_hours: { 
        ...prev.restaurant_opening_hours, 
        [day]: { ...prev.restaurant_opening_hours[day], [field]: value } 
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        e.target.value = '';
        return;
      }
      
      setImageFile(file); // Store the actual file
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, restaurant_image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.restaurant_name || !formData.restaurant_description || 
        !formData.address_details.street || !formData.restaurant_contact_info.phone) {
      alert('Please fill in all required fields (Name, Description, Street, Phone)');
      return;
    }

    if (formData.restaurant_category.length === 0) {
      alert('Please select at least one category');
      return;
    }

    try {
      setLoading(true);
      
      // Get owner_id from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const owner_id = user._id || user.id;

      if (!owner_id) {
        alert('Owner ID not found. Please login again.');
        return;
      }

      // Build full address string from parts
      const addressParts = [
        formData.address_details.street,
        formData.address_details.city,
        formData.address_details.state,
        formData.address_details.country,
        formData.address_details.zipCode
      ].filter(part => part && part.trim());
      
      const fullAddress = addressParts.join(', ');

      // Prepare data for API matching backend schema
      const restaurantData = {
        owner_id,
        restaurant_name: formData.restaurant_name.trim(),
        restaurant_address: fullAddress || formData.address_details.street, // String format
        restaurant_location: {
          type: "Point",
          coordinates: formData.coordinates // [longitude, latitude]
        },
        restaurant_description: formData.restaurant_description.trim(),
        restaurant_contact_info: {
          phone: formData.restaurant_contact_info.phone.trim(),
          ...(formData.restaurant_contact_info.email && { email: formData.restaurant_contact_info.email.trim() })
        },
        restaurant_category: formData.restaurant_category, // Note: singular
        restaurant_opening_hours: formData.restaurant_opening_hours
      };

      console.log('Creating restaurant with data:', restaurantData);

      const response = await createRestaurant(restaurantData);
      
      console.log('✅ API Response received:', response);
      
      if (response.status === 'success' || response.success) {
        const newRestaurant = response.data?.restaurant || response.data;
        
        // Upload image if one was selected
        if (imageFile && newRestaurant._id) {
          try {
            console.log('Uploading image for restaurant:', newRestaurant._id);
            await uploadRestaurantImage(newRestaurant._id, imageFile);
            console.log('Image uploaded successfully');
          } catch (imgError) {
            console.error('Image upload failed:', imgError);
            // Don't fail the whole operation if image upload fails
            alert('Restaurant created but image upload failed. You can add an image later.');
          }
        }
        
        alert('Restaurant created successfully!');
        setShowAddModal(false);
        resetForm();
        setImageFile(null);
        // Refresh the list
        await fetchRestaurants();
      } else {
        alert(response.message || 'Failed to create restaurant');
      }
    } catch (err) {
      console.error('Error creating restaurant:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      // Extract error message from various possible formats
      let errorMsg = 'Failed to create restaurant';
      
      if (err.message) {
        errorMsg = err.message;
      } else if (err.error) {
        errorMsg = err.error;
      } else if (err.msg) {
        errorMsg = err.msg;
      }
      
      // Check for validation errors
      if (err.errors && typeof err.errors === 'object') {
        const errorDetails = Object.entries(err.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        errorMsg += '\n\nValidation Errors:\n' + errorDetails;
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteRestaurant(restaurantId);
      
      // Refresh the restaurant list
      await fetchRestaurants();
      
      alert('Restaurant deleted successfully!');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      alert(err.message || 'Failed to delete restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleManageRestaurant = (restaurant) => {
    // Store restaurant ID in localStorage for the Manage Restaurant page to use
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.restaurant_id = restaurant._id;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Navigate to the Manage Restaurant page
    navigate('/restaurant_owner/manage_restaurant');
  };

  const resetForm = () => {
    setFormData({
      restaurant_name: '',
      restaurant_description: '',
      restaurant_address: '',
      address_details: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      coordinates: [90.4125, 23.8103], // Dhaka, Bangladesh
      restaurant_contact_info: {
        phone: '',
        email: ''
      },
      restaurant_category: [],
      restaurant_opening_hours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '09:00', close: '22:00' }
      }
    });
    setImageFile(null); // Clear image file
  };

  return (
    <div className="min-h-screen bg-[#C4E2C4] flex">
      <OwnerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-[#8DBC96] shadow-md lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-white"><Menu className="w-6 h-6" /></button>
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">BiteNow</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">My Restaurants</h1>
                <p className="text-gray-600">Manage all your restaurant locations</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)} 
                disabled={loading}
                className="bg-[#67A177] text-white px-6 py-3 rounded-full hover:bg-[#5a8f68] transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="w-5 h-5" /><span>Add Restaurant</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && restaurants.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#67A177]"></div>
                <p className="mt-4 text-gray-600">Loading restaurants...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && restaurants.length === 0 && (
              <div className="text-center py-12 bg-[#ACD4B1] rounded-2xl">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first restaurant</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#67A177] text-white px-6 py-3 rounded-full hover:bg-[#5a8f68] transition-all font-semibold inline-flex items-center space-x-2">
                  <Plus className="w-5 h-5" /><span>Add Restaurant</span>
                </button>
              </div>
            )}

            {/* Restaurant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="bg-[#ACD4B1] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={restaurant.restaurant_image?.url || restaurant.restaurant_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'} 
                      alt={restaurant.restaurant_name} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-[#67A177] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {restaurant.restaurant_category?.[0] || 'Restaurant'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{restaurant.restaurant_name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.restaurant_description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-[#67A177] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          {restaurant.restaurant_address || 'No address provided'}
                        </p>
                      </div>
                      {restaurant.restaurant_contact_info?.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-[#67A177] flex-shrink-0" />
                          <p className="text-sm text-gray-700">{restaurant.restaurant_contact_info.phone}</p>
                        </div>
                      )}
                      {restaurant.restaurant_contact_info?.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-[#67A177] flex-shrink-0" />
                          <p className="text-sm text-gray-700">{restaurant.restaurant_contact_info.email}</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[#DDEEDB] p-2 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /></div>
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="font-bold text-gray-800">{restaurant.restaurant_rating?.average || 'N/A'}</p>
                      </div>
                      <div className="bg-[#DDEEDB] p-2 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1"><Package className="w-4 h-4 text-[#67A177]" /></div>
                        <p className="text-xs text-gray-600">Sales</p>
                        <p className="font-bold text-gray-800">{restaurant.restaurant_total_sales || 0}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleManageRestaurant(restaurant)}
                        className="flex-1 bg-[#67A177] text-white py-3 rounded-full hover:bg-[#5a8f68] transition-all font-semibold flex items-center justify-center space-x-2"
                      >
                        <span>Manage</span><ChevronRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteRestaurant(restaurant._id)}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-3 rounded-full hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="bg-[#8DBC96] text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-white/80">© 2024 BiteNow. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#DDEEDB] rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DBC96] p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-white">Add New Restaurant</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#ACD4B1] p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Name *</label>
                  <input 
                    type="text" 
                    name="restaurant_name" 
                    value={formData.restaurant_name} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                    placeholder="Enter restaurant name" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Categories *</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {restaurantTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleCategoryToggle(type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.restaurant_category.includes(type)
                            ? 'bg-[#67A177] text-white'
                            : 'bg-white text-gray-700 border border-[#8DBC96] hover:border-[#67A177]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">Selected: {formData.restaurant_category.join(', ') || 'None'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea 
                    name="restaurant_description" 
                    value={formData.restaurant_description} 
                    onChange={handleInputChange} 
                    rows="3" 
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white resize-none" 
                    placeholder="Describe your restaurant" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Image</label>
                  <div className="flex items-center space-x-4">
                    {formData.restaurant_image && <img src={formData.restaurant_image} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-[#8DBC96] rounded-lg p-4 hover:border-[#67A177] transition-colors bg-white">
                        <div className="flex flex-col items-center space-y-2">
                          <Image className="w-8 h-8 text-[#67A177]" />
                          <span className="text-sm text-gray-600">Click to upload</span>
                        </div>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-[#ACD4B1] p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Location & Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street *</label>
                    <input 
                      type="text" 
                      name="address_street" 
                      value={formData.address_details.street} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                      placeholder="Street address" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input 
                      type="text" 
                      name="address_city" 
                      value={formData.address_details.city} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                      placeholder="City" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State/Division</label>
                    <input 
                      type="text" 
                      name="address_state" 
                      value={formData.address_details.state} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                      placeholder="State or Division" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input 
                      type="text" 
                      name="address_country" 
                      value={formData.address_details.country} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                      placeholder="Country" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                    <input 
                      type="text" 
                      name="address_zipCode" 
                      value={formData.address_details.zipCode} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                      placeholder="Zip code" 
                    />
                  </div>
                </div>
                {formData.restaurant_address && (
                  <div className="bg-[#DDEEDB] p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Full Address:</p>
                    <p className="text-sm font-medium text-gray-800">{formData.restaurant_address}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#ACD4B1] p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="contact_phone" 
                    value={formData.restaurant_contact_info.phone} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                    placeholder="+8801712345678" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                  <input 
                    type="email" 
                    name="contact_email" 
                    value={formData.restaurant_contact_info.email} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white" 
                    placeholder="restaurant@example.com" 
                  />
                </div>
              </div>

              <div className="bg-[#ACD4B1] p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Operating Hours</h3>
                <div className="space-y-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-[#DDEEDB] p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0 md:w-40">
                          <label className="text-sm font-semibold text-gray-700 capitalize">{day}</label>
                        </div>
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 mb-1 block">Opening</label>
                            <input 
                              type="time" 
                              value={formData.restaurant_opening_hours[day].open} 
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)} 
                              className="w-full px-3 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white text-sm" 
                            />
                          </div>
                          <span className="text-gray-600 mt-5">to</span>
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 mb-1 block">Closing</label>
                            <input 
                              type="time" 
                              value={formData.restaurant_opening_hours[day].close} 
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)} 
                              className="w-full px-3 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white text-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }} 
                  disabled={loading}
                  className="flex-1 bg-gray-400 text-white py-3 rounded-full hover:bg-gray-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 bg-[#67A177] text-white py-3 rounded-full hover:bg-[#5a8f68] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creating...' : 'Add Restaurant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;