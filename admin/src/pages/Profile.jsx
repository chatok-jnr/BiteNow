import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, Calendar, MapPin, Lock, Trash2, Save, Eye, EyeOff, AlertTriangle, Camera, Edit3, X } from 'lucide-react';
import axiosInstance from '../utils/axios';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    admin_dob: '',
    admin_address: '',
    admin_gender: '',
    admin_photo: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteData, setDeleteData] = useState({
    password: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'delete'
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/profile');
      if (response.data.status === 'success') {
        const data = response.data.data;
        setProfileData({
          admin_name: data.admin_name || '',
          admin_email: data.admin_email || '',
          admin_phone: data.admin_phone || '',
          admin_dob: data.admin_dob ? data.admin_dob.split('T')[0] : '',
          admin_address: data.admin_address || '',
          admin_gender: data.admin_gender || '',
          admin_photo: data.admin_photo || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDefaultAvatar = () => {
    return profileData.admin_gender === 'Female' ? '👩' : '👨';
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('admin_email', profileData.admin_email);
      formData.append('admin_phone', profileData.admin_phone);
      formData.append('admin_dob', profileData.admin_dob);
      formData.append('admin_address', profileData.admin_address);
      
      if (selectedPhoto) {
        formData.append('admin_photo', selectedPhoto);
      }

      const response = await axiosInstance.patch('/admin/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status === 'success') {
        setSuccess('Profile updated successfully');
        setIsEditMode(false);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        // Update profile data with new photo URL
        if (response.data.data.admin_photo) {
          setProfileData(prev => ({
            ...prev,
            admin_photo: response.data.data.admin_photo
          }));
        }
        // Update local storage if needed
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        localStorage.setItem('adminData', JSON.stringify({
          ...adminData,
          ...response.data.data
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedPhoto(null);
    setPhotoPreview(null);
    fetchProfile(); // Reset to original data
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New password and confirm password do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const response = await axiosInstance.patch('/admin/profile/change-password', passwordData);
      if (response.data.status === 'success') {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      setDeleting(true);
      setError(null);

      const response = await axiosInstance.delete('/admin/profile', {
        data: deleteData
      });

      if (response.data.status === 'success') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/login';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d11] text-gray-100">
      <Sidebar />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={clearMessages} className="ml-auto text-red-400 hover:text-red-300">×</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-3">
            <Save className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={clearMessages} className="ml-auto text-green-400 hover:text-green-300">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('profile'); clearMessages(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-[#1a1a22] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Info
          </button>
          <button
            onClick={() => { setActiveTab('password'); clearMessages(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-[#1a1a22] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
          <button
            onClick={() => { setActiveTab('delete'); clearMessages(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === 'delete'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-[#1a1a22] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-8">
                {/* Profile Header with Image */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/10">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500/30 bg-[#0d0d11] flex items-center justify-center">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : profileData.admin_photo ? (
                        <img 
                          src={profileData.admin_photo} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">{getDefaultAvatar()}</span>
                      )}
                    </div>
                    {isEditMode && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                        >
                          <Camera className="w-5 h-5 text-white" />
                        </label>
                        {(photoPreview || selectedPhoto) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-all shadow-lg"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Profile Info Summary */}
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{profileData.admin_name}</h2>
                    <p className="text-gray-400">{profileData.admin_email}</p>
                    <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profileData.admin_gender === 'Female' 
                          ? 'bg-pink-500/20 text-pink-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {profileData.admin_gender || 'Not specified'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                        Admin
                      </span>
                    </div>
                  </div>

                  {/* Edit Mode Toggle Button */}
                  <div>
                    {!isEditMode ? (
                      <button
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                      >
                        <Edit3 className="w-5 h-5" />
                        Update Profile
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 bg-[#0d0d11] border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Profile Information
                </h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Name (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={profileData.admin_name}
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={profileData.admin_email}
                        onChange={(e) => setProfileData({ ...profileData, admin_email: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full pl-12 pr-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl transition-all ${
                          isEditMode 
                            ? 'text-gray-100 focus:outline-none focus:border-orange-500/50' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={profileData.admin_phone}
                        onChange={(e) => setProfileData({ ...profileData, admin_phone: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full pl-12 pr-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl transition-all ${
                          isEditMode 
                            ? 'text-gray-100 focus:outline-none focus:border-orange-500/50' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="date"
                        value={profileData.admin_dob}
                        onChange={(e) => setProfileData({ ...profileData, admin_dob: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full pl-12 pr-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl transition-all ${
                          isEditMode 
                            ? 'text-gray-100 focus:outline-none focus:border-orange-500/50' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <textarea
                        value={profileData.admin_address}
                        onChange={(e) => setProfileData({ ...profileData, admin_address: e.target.value })}
                        disabled={!isEditMode}
                        rows={3}
                        className={`w-full pl-12 pr-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl transition-all resize-none ${
                          isEditMode 
                            ? 'text-gray-100 focus:outline-none focus:border-orange-500/50' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Submit Button - Only show in edit mode */}
                  {isEditMode && (
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-orange-500/50 transition-all"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-orange-500/50 transition-all"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-orange-500/50 transition-all"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div className="bg-[#1a1a22] border border-red-500/20 rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-red-400">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  Delete Account
                </h2>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-400">Warning: This action is irreversible</h3>
                      <p className="text-sm text-red-300/70 mt-1">
                        Once you delete your account, all of your data will be permanently removed. 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setShowDeleteModal(true); }} className="space-y-6">
                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Deletion</label>
                    <textarea
                      value={deleteData.reason}
                      onChange={(e) => setDeleteData({ ...deleteData, reason: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-red-500/50 transition-all resize-none"
                      placeholder="Please tell us why you want to delete your account"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Your Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showDeletePassword ? 'text' : 'password'}
                        value={deleteData.password}
                        onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-[#0d0d11] border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-red-500/50 transition-all"
                        placeholder="Enter your password to confirm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete My Account
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1a1a22] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Are you absolutely sure?</h3>
                <p className="text-gray-400 mb-6">
                  This will permanently delete your admin account and all associated data. 
                  This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 bg-[#0d0d11] border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      'Yes, Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
