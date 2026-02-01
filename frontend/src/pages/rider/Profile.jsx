import React, { useState, useEffect } from 'react';
import { Bike, User, Mail, Phone, Calendar, FileText, DollarSign, Package, Star, Edit2, X, Camera, Eye, EyeOff, ArrowLeft, Trash2, MapPin, CheckCircle, Clock, Upload, XCircle } from 'lucide-react';
import { getRiderProfile, updateRider, deleteRider, uploadRiderImage, uploadRiderDocuments, deleteRiderDocument } from '../../utils/riderService';
import { getMyOrderList } from '../../utils/orderService';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const [editForm, setEditForm] = useState({
    rider_name: '',
    rider_date_of_birth: '',
    rider_gender: '',
    rider_address: '',
    'rider_contact_info.emergency_contact': '',
    'rider_contact_info.alternative_phone': '',
    rider_password: '',
    confirmPassword: '',
    imageFile: null
  });

  // Fetch rider profile and orders on component mount
  useEffect(() => {
    fetchRiderProfile();
    fetchCompletedOrders();
  }, []);

  const fetchRiderProfile = async () => {
    try {
      setLoading(true);
      const response = await getRiderProfile();
      if (response.status === 'success') {
        setProfileData(response.rider);
        // Initialize edit form with current data
        setEditForm({
          rider_name: response.rider.name || '',
          rider_date_of_birth: response.rider.date_of_birth ? new Date(response.rider.date_of_birth).toISOString().split('T')[0] : '',
          rider_gender: response.rider.gender || '',
          rider_address: response.rider.address || '',
          'rider_contact_info.emergency_contact': response.rider.contact_info?.emergency_contact || '',
          'rider_contact_info.alternative_phone': response.rider.contact_info?.alternative_phone || '',
          rider_password: '',
          confirmPassword: '',
          imageFile: null
        });
      }
    } catch (error) {
      console.error('Error fetching rider profile:', error);
      alert('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await getMyOrderList();
      if (response.status === 'success' && response.myOrder) {
        // Filter only completed/delivered orders
        const completed = response.myOrder.filter(
          order => order.order_status === 'delivered'
        );
        setCompletedOrders(completed);
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && profileData) {
      // Reset form when canceling edit
      setEditForm({
        rider_name: profileData.name || '',
        rider_date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth).toISOString().split('T')[0] : '',
        rider_gender: profileData.gender || '',
        rider_address: profileData.address || '',
        'rider_contact_info.emergency_contact': profileData.contact_info?.emergency_contact || '',
        'rider_contact_info.alternative_phone': profileData.contact_info?.alternative_phone || '',
        rider_password: '',
        confirmPassword: '',
        imageFile: null
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setEditForm(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate password match if changing password
      if (editForm.rider_password && editForm.rider_password !== editForm.confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      // Prepare update data
      const updateData = {
        rider_name: editForm.rider_name,
        rider_date_of_birth: editForm.rider_date_of_birth,
        rider_gender: editForm.rider_gender,
        rider_address: editForm.rider_address,
        'rider_contact_info.emergency_contact': editForm['rider_contact_info.emergency_contact'],
        'rider_contact_info.alternative_phone': editForm['rider_contact_info.alternative_phone'],
      };

      // Add password only if it's being changed
      if (editForm.rider_password) {
        updateData.rider_password = editForm.rider_password;
      }

      // Update profile information
      const response = await updateRider(profileData.id, updateData);
      
      if (response.status === 'success') {
        // If there's a new image, upload it
        if (editForm.imageFile) {
          try {
            await uploadRiderImage(profileData.id, editForm.imageFile);
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
            alert('Profile updated but image upload failed. Please try uploading the image separately.');
          }
        }

        // Refresh profile data
        await fetchRiderProfile();
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await deleteRider(profileData.id);
      if (response.status === 'success') {
        alert('Account deleted successfully');
        // Clear local storage and redirect to login
        localStorage.clear();
        navigate('/rider/login');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files (max 5)
    if (files.length > 5) {
      alert('You can upload a maximum of 5 documents at once');
      return;
    }

    // Validate file types (accept common document formats)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please upload only PDF or image files (JPG, JPEG, PNG)');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Each file should be less than 5MB');
      return;
    }

    setDocumentFiles(files);
  };

  const handleUploadDocuments = async () => {
    if (documentFiles.length === 0) {
      alert('Please select documents to upload');
      return;
    }

    try {
      setUploadingDocs(true);
      const response = await uploadRiderDocuments(profileData.id, documentFiles);
      
      if (response.status === 'success') {
        alert('Documents uploaded successfully!');
        setDocumentFiles([]);
        // Clear the file input
        const fileInput = document.getElementById('document-upload');
        if (fileInput) fileInput.value = '';
        // Refresh profile to show new documents
        await fetchRiderProfile();
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert(error.response?.data?.message || 'Failed to upload documents. Please try again.');
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await deleteRiderDocument(profileData.id, docId);
      
      if (response.status === 'success') {
        alert('Document deleted successfully!');
        // Refresh profile to remove deleted document
        await fetchRiderProfile();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.response?.data?.message || 'Failed to delete document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#C4E2C4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#67A177] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#67A177] font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#C4E2C4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load profile</p>
          <button 
            onClick={() => navigate('/rider/home')}
            className="mt-4 bg-[#67A177] text-white px-6 py-2 rounded-full hover:bg-[#5a8f68]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#C4E2C4]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#8DBC96] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#67A177] rounded-full flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">BiteNow Rider</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCompletedOrders(!showCompletedOrders)}
                className="text-white hover:text-[#DDEEDB] transition-colors font-medium"
              >
                {showCompletedOrders ? 'Hide' : 'View'} Completed Orders
              </button>
              <button 
                onClick={() => navigate('/rider/home')}
                className="text-white hover:text-[#DDEEDB] transition-colors font-medium flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-[#8DBC96] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">My Profile</h1>
          <p className="text-white/90 text-lg">Manage your account information and settings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating Card */}
            <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-[#67A177] rounded-full flex items-center justify-center">
                  <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Rider Rating</p>
                <p className="text-4xl font-bold text-[#67A177]">{profileData.stats?.average_rating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-gray-500 mt-2">Based on customer reviews</p>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-[#67A177]">{profileData.stats?.total_deliveries || 0}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#8DBC96]/30">
                <p className="text-xs text-gray-600">Completed Orders</p>
                <p className="text-sm font-semibold text-gray-800">{completedOrders.length}</p>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-[#ACD4B1] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#67A177] rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="text-2xl font-bold text-[#67A177]">{profileData.account_status || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-[#ACD4B1] rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-[#8DBC96] p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="bg-[#67A177] text-white px-4 py-2 rounded-full hover:bg-[#5a8f68] transition-all font-semibold flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all font-semibold flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-[#67A177] overflow-hidden bg-gray-200 flex items-center justify-center">
                      {(editForm.imageFile || profileData?.image?.url) ? (
                        <img
                          src={editForm.imageFile 
                            ? URL.createObjectURL(editForm.imageFile) 
                            : profileData.image.url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-[#67A177] text-white p-2 rounded-full cursor-pointer hover:bg-[#5a8f68] transition-all">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 text-[#67A177]" />
                      <span>Full Name</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="rider_name"
                        value={editForm.rider_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{profileData.name}</p>
                    )}
                  </div>

                  {/* Email (Read Only) */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Mail className="w-4 h-4 text-[#67A177]" />
                      <span>Email Address</span>
                    </label>
                    <p className="text-lg font-semibold text-gray-800">{profileData.email}</p>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 text-[#67A177]" />
                      <span>Emergency Contact</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="rider_contact_info.emergency_contact"
                        value={editForm['rider_contact_info.emergency_contact']}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{profileData.contact_info?.emergency_contact || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Alternative Phone */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Phone className="w-4 h-4 text-[#67A177]" />
                      <span>Alternative Phone</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="rider_contact_info.alternative_phone"
                        value={editForm['rider_contact_info.alternative_phone']}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{profileData.contact_info?.alternative_phone || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 text-[#67A177]" />
                      <span>Gender</span>
                    </label>
                    {isEditing ? (
                      <select
                        name="rider_gender"
                        value={editForm.rider_gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{profileData.gender || 'Not specified'}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 text-[#67A177]" />
                      <span>Address</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="rider_address"
                        value={editForm.rider_address}
                        onChange={handleInputChange}
                        maxLength={50}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">{profileData.address || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 text-[#67A177]" />
                      <span>Date of Birth</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="rider_date_of_birth"
                        value={editForm.rider_date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-800">
                        {profileData.date_of_birth 
                          ? new Date(profileData.date_of_birth).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'Not provided'
                        }
                      </p>
                    )}
                  </div>

                  {/* Password Fields (Only in Edit Mode) */}
                  {isEditing && (
                    <>
                      <div className="bg-[#DDEEDB] p-4 rounded-xl">
                        <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>New Password (Leave blank to keep current)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="rider_password"
                            value={editForm.rider_password}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#67A177]"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#DDEEDB] p-4 rounded-xl">
                        <label className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <span>Confirm New Password</span>
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={editForm.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 rounded-lg border-2 border-[#8DBC96] focus:border-[#67A177] focus:outline-none bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full bg-[#67A177] text-white py-3 rounded-full hover:bg-[#5a8f68] transition-all font-semibold text-lg hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {/* Delete Account Button */}
                {!isEditing && (
                  <div className="mt-6 pt-6 border-t border-[#8DBC96]/30">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold text-lg hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete Account</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      This action cannot be undone
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section - Always Visible */}
            <div className="bg-[#ACD4B1] rounded-2xl shadow-lg overflow-hidden mt-6">
              <div className="bg-[#8DBC96] p-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-6 h-6" />
                  <span>My Documents</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-[#DDEEDB] p-4 rounded-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <FileText className="w-4 h-4 text-[#67A177]" />
                      <span>Rider Documents</span>
                    </label>
                    
                    {/* Upload Documents Section */}
                    <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-[#8DBC96]">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <label 
                            htmlFor="document-upload" 
                            className="cursor-pointer bg-[#67A177] text-white px-4 py-2 rounded-full hover:bg-[#5a8f68] transition-all font-semibold text-sm flex items-center space-x-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Choose Documents</span>
                            <input
                              id="document-upload"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleDocumentChange}
                              className="hidden"
                              disabled={uploadingDocs}
                            />
                          </label>
                          {documentFiles.length > 0 && (
                            <button
                              onClick={handleUploadDocuments}
                              disabled={uploadingDocs}
                              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{uploadingDocs ? 'Uploading...' : 'Upload'}</span>
                            </button>
                          )}
                        </div>
                        
                        {documentFiles.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 font-medium">Selected files:</p>
                            {documentFiles.map((file, index) => (
                              <div key={index} className="text-xs text-gray-700 flex items-center space-x-2">
                                <FileText className="w-3 h-3 text-[#67A177]" />
                                <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Upload up to 5 documents (PDF, JPG, PNG). Max 5MB each.
                        </p>
                      </div>
                    </div>

                    {/* Existing Documents */}
                    {profileData.documents && profileData.documents.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</p>
                        {profileData.documents.map((doc, index) => (
                          <div
                            key={doc._id || index}
                            className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-[#67A177] hover:text-[#5a8f68] transition-colors font-medium text-sm flex-1"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Document {index + 1}</span>
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc._id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Delete document"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents uploaded yet</p>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Orders Section */}
      {showCompletedOrders && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#ACD4B1] rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#8DBC96] p-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <CheckCircle className="w-6 h-6" />
                <span>Completed Orders ({completedOrders.length})</span>
              </h2>
            </div>
            <div className="p-6">
              {completedOrders.length > 0 ? (
                <div className="space-y-4">
                  {completedOrders.map((order, index) => (
                    <div key={order._id || index} className="bg-[#DDEEDB] rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="font-semibold text-gray-800">{order._id?.substring(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold text-green-600">{order.order_status}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Restaurant</p>
                          <p className="font-semibold text-gray-800">{order.restaurant_id?.restaurant_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivery Fee</p>
                          <p className="font-semibold text-gray-800">${order.delivery_fee?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-semibold text-gray-800">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="font-semibold text-gray-800">${order.total_amount?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">No completed orders yet</p>
                  <p className="text-sm text-gray-500 mt-2">Your completed deliveries will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Account?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-all font-semibold"
                >
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-full hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#8DBC96] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#67A177] rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">BiteNow Rider</span>
          </div>
          <p className="text-white/80">© 2024 BiteNow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;