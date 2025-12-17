import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Customer form data
  const [customerData, setCustomerData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    address: "",
    birthDate: "",
  });

  // Restaurant Owner form data
  const [restaurantOwnerData, setRestaurantOwnerData] = useState({
    restaurant_owner_name: "",
    restaurant_owner_phone: "",
    restaurant_owner_email: "",
    restaurant_owner_password: "",
    confirmPassword: "",
    restaurant_owner_gender: "",
    restaurant_owner_dob: "",
    restaurant_owner_address: "",
  });

  // Rider form data
  const [riderData, setRiderData] = useState({
    rider_name: "",
    rider_address: "",
    rider_password: "",
    confirmPassword: "",
    rider_date_of_birth: "",
    nid_no: "",
    emergency_contact: "",
    alternative_phone: "",
    rider_email: "",
    rider_gender: "",
    profile_photo: null,
  });

  const roles = [
    {
      id: "customer",
      title: "Customer",
      description: "Order food from your favorite restaurants",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "restaurant",
      title: "Restaurant Owner",
      description: "Manage your restaurant and menu",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "rider",
      title: "Rider",
      description: "Deliver orders and earn money",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      ),
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (selectedRole === "customer") {
      setCustomerData({
        ...customerData,
        [name]: value,
      });
    } else if (selectedRole === "restaurant") {
      setRestaurantOwnerData({
        ...restaurantOwnerData,
        [name]: value,
      });
    } else if (selectedRole === "rider") {
      if (name === "profile_photo") {
        setRiderData({
          ...riderData,
          [name]: files[0],
        });
      } else {
        setRiderData({
          ...riderData,
          [name]: value,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    
    try {
      let password, confirmPassword;

      if (selectedRole === "customer") {
        password = customerData.password;
        confirmPassword = customerData.confirmPassword;
        
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match!");
          setIsLoading(false);
          return;
        }

        // Mock signup validation for customer
        if (customerData.email && customerData.password.length >= 6) {
          // Save signup data for OTP verification
          localStorage.setItem("pendingSignup", JSON.stringify({
            email: customerData.email,
            password: customerData.password,
            role: "customer",
            name: customerData.fullName
          }));
          // Simulate successful signup
          setIsLoading(false);
          // Redirect to OTP page
          navigate("/otp");
          return;
        }
      } else if (selectedRole === "restaurant") {
        password = restaurantOwnerData.restaurant_owner_password;
        confirmPassword = restaurantOwnerData.confirmPassword;
        
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match!");
          setIsLoading(false);
          return;
        }

        // Mock signup validation for restaurant
        if (restaurantOwnerData.restaurant_owner_email && restaurantOwnerData.restaurant_owner_password.length >= 6) {
          // Simulate successful signup
          setIsLoading(false);
          // Redirect to OTP page
          navigate("/otp");
          return;
        }
      } else if (selectedRole === "rider") {
        password = riderData.rider_password;
        confirmPassword = riderData.confirmPassword;
        
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match!");
          setIsLoading(false);
          return;
        }

        // Mock signup validation for rider
        if (riderData.rider_email && riderData.rider_password.length >= 6) {
          // Simulate successful signup
          setIsLoading(false);
          // Redirect to OTP page
          navigate("/otp");
          return;
        }
      }

      // If validation fails
      setErrorMessage("Please fill all required fields correctly.");
      setIsLoading(false);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Message for Restaurant Owner and Rider */}
        {showSuccessMessage && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8 border-2 border-green-500">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait for Admin approval. You will be notified once your account is verified.
            </p>
            <Link
              to="/"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Demo Info Banner */}
        {!showSuccessMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Demo Mode - No Backend Required</h3>
            <p className="text-xs text-blue-700 mb-2">Fill the form with any information (password min 6 characters). After signup, you'll be redirected to OTP verification.</p>
            <p className="text-xs text-blue-700">Use OTP: <span className="font-bold">1234</span> to verify, then login with credentials from Login page.</p>
          </div>
        )}

        {/* Main Signup Card */}
        {!showSuccessMessage && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
              <p className="mt-2 text-gray-600">Join BiteNow and get started</p>
            </div>

        {/* Role Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Select Your Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                type="button"
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedRole === role.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`mb-3 ${
                    selectedRole === role.id ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {role.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {role.title}
                </h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Form */}
          {selectedRole === "customer" && (
            <>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={customerData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={customerData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={customerData.phone}
                  onChange={handleInputChange}
                  pattern="^\+880 ?1[3-9][0-9]{8}$"
                  title="Please enter a valid Bangladeshi phone number (e.g., +880 1xxxxxxxxx)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                  placeholder="+880 1xxxxxxxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={customerData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                >
                  <option value="" disabled hidden>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date of Birth
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={customerData.birthDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  value={customerData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Enter your delivery address"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={customerData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={customerData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          {/* Restaurant Owner Form */}
          {selectedRole === "restaurant" && (
            <>
              <div>
                <label
                  htmlFor="restaurant_owner_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Owner Name
                </label>
                <input
                  id="restaurant_owner_name"
                  name="restaurant_owner_name"
                  type="text"
                  required
                  value={restaurantOwnerData.restaurant_owner_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter owner name"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="restaurant_owner_email"
                  name="restaurant_owner_email"
                  type="email"
                  required
                  value={restaurantOwnerData.restaurant_owner_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF2B85] focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="restaurant_owner_phone"
                  name="restaurant_owner_phone"
                  type="tel"
                  required
                  value={restaurantOwnerData.restaurant_owner_phone}
                  onChange={handleInputChange}
                  pattern="^\+880 ?1[3-9][0-9]{8}$"
                  title="Please enter a valid Bangladeshi phone number (e.g., +880 1xxxxxxxxx)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+880 1xxxxxxxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="restaurant_owner_gender"
                  name="restaurant_owner_gender"
                  required
                  value={restaurantOwnerData.restaurant_owner_gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled hidden>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_dob"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date of Birth
                </label>
                <input
                  id="restaurant_owner_dob"
                  name="restaurant_owner_dob"
                  type="date"
                  required
                  value={restaurantOwnerData.restaurant_owner_dob}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="restaurant_owner_address"
                  name="restaurant_owner_address"
                  required
                  value={restaurantOwnerData.restaurant_owner_address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Enter owner address"
                />
              </div>

              <div>
                <label
                  htmlFor="restaurant_owner_password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="restaurant_owner_password"
                  name="restaurant_owner_password"
                  type="password"
                  required
                  minLength="6"
                  value={restaurantOwnerData.restaurant_owner_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={restaurantOwnerData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          {/* Rider Form */}
          {selectedRole === "rider" && (
            <>
              <div>
                <label
                  htmlFor="rider_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rider Name
                </label>
                <input
                  id="rider_name"
                  name="rider_name"
                  type="text"
                  required
                  value={riderData.rider_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="rider_email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="rider_email"
                  name="rider_email"
                  type="email"
                  required
                  value={riderData.rider_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label
                  htmlFor="nid_no"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  NID Number
                </label>
                <input
                  id="nid_no"
                  name="nid_no"
                  type="text"
                  required
                  value={riderData.nid_no}
                  onChange={handleInputChange}
                  pattern="^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$"
                  title="Please enter a valid NID number (10, 13, or 17 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter NID number"
                />
              </div>

              <div>
                <label
                  htmlFor="emergency_contact"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Emergency Contact
                </label>
                <input
                  id="emergency_contact"
                  name="emergency_contact"
                  type="tel"
                  required
                  value={riderData.emergency_contact}
                  onChange={handleInputChange}
                  pattern="^\+880 ?1[3-9][0-9]{8}$"
                  title="Please enter a valid Bangladeshi phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+880 1xxxxxxxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="alternative_phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alternative Phone
                </label>
                <input
                  id="alternative_phone"
                  name="alternative_phone"
                  type="tel"
                  required
                  value={riderData.alternative_phone}
                  onChange={handleInputChange}
                  pattern="^\+880 ?1[3-9][0-9]{8}$"
                  title="Please enter a valid Bangladeshi phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+880 1xxxxxxxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="rider_gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="rider_gender"
                  name="rider_gender"
                  required
                  value={riderData.rider_gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled hidden>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="rider_date_of_birth"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date of Birth
                </label>
                <input
                  id="rider_date_of_birth"
                  name="rider_date_of_birth"
                  type="date"
                  required
                  value={riderData.rider_date_of_birth}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="rider_address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="rider_address"
                  name="rider_address"
                  required
                  value={riderData.rider_address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label
                  htmlFor="profile_photo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Profile Photo
                </label>
                <input
                  id="profile_photo"
                  name="profile_photo"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="rider_password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="rider_password"
                  name="rider_password"
                  type="password"
                  required
                  minLength="6"
                  value={riderData.rider_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a password (min 6 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={riderData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              required
              className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-primary hover:text-primary/80 font-semibold"
          >
            Sign in
          </Link>
        </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
