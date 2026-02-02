import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Mail,
  Phone,
  Lock,
  User,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginRider } from "../../utils/authService";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast notification helper
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  // Redirect to profile if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/rider/home");
    }
  }, [navigate]);

  const [loginForm, setLoginForm] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!loginForm.emailOrPhone || !loginForm.password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      // Call the login API
      const credentials = {
        rider_email: loginForm.emailOrPhone,
        rider_password: loginForm.password,
      };

      const response = await loginRider(credentials);

      console.log("🔐 Login Response:", response);
      console.log("📦 Response Data:", response.data);
      console.log("🎫 Token:", response.token);

      // Store token and user data
      if (response.status === "success" && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", "rider");

        // Store complete user object including status
        const userData = response.data?.user || response.user;
        console.log("👤 User Data to Store:", userData);

        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem(
            "userId",
            userData.rider_id || userData._id || userData.id,
          );
          console.log("✅ User data stored to localStorage");
        } else {
          console.warn("⚠️ No user data found in response");
        }

        console.log("🔄 Navigating to rider home...");
        // Navigate to rider home
        navigate("/rider/home");
      } else {
        console.error("❌ Login failed - Invalid response:", response);
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Redirect to backend Google OAuth endpoint for riders
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${backendUrl}/api/v1/auth/google/rider`;
  };

  return (
    <div className="min-h-screen bg-[#C4E2C4] flex flex-col">
      {/* Auth Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#ACD4B1] rounded-3xl shadow-2xl overflow-hidden">
            {/* Toggle Tabs */}
            <div className="flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 text-lg font-bold transition-all ${
                  isLogin
                    ? "bg-[#67A177] text-white"
                    : "bg-[#8DBC96] text-white/70 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-lg font-bold transition-all ${
                  !isLogin
                    ? "bg-[#67A177] text-white"
                    : "bg-[#8DBC96] text-white/70 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Container */}
            <div className="p-8">
              {isLogin ? (
                // Login Form
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Welcome Back!
                    </h2>
                    <p className="text-gray-600">Login to continue ordering</p>
                  </div>

                  {/* Login Method Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setLoginMethod("email")}
                      className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                        loginMethod === "email"
                          ? "bg-[#67A177] text-white"
                          : "bg-[#DDEEDB] text-gray-600 hover:bg-[#C4E2C4]"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setLoginMethod("phone")}
                      className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                        loginMethod === "phone"
                          ? "bg-[#67A177] text-white"
                          : "bg-[#DDEEDB] text-gray-600 hover:bg-[#C4E2C4]"
                      }`}
                    >
                      Phone
                    </button>
                  </div>

                  {/* Email/Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {loginMethod === "email"
                        ? "Email Address"
                        : "Phone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {loginMethod === "email" ? (
                          <Mail className="w-5 h-5" />
                        ) : (
                          <Phone className="w-5 h-5" />
                        )}
                      </div>
                      <input
                        type={loginMethod === "email" ? "email" : "tel"}
                        name="emailOrPhone"
                        value={loginForm.emailOrPhone}
                        onChange={handleLoginChange}
                        placeholder={
                          loginMethod === "email"
                            ? "your@email.com"
                            : "+1 (555) 000-0000"
                        }
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-full border-2 border-transparent focus:border-[#67A177] focus:outline-none transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3 bg-white rounded-full border-2 border-transparent focus:border-[#67A177] focus:outline-none transition-all"
                        disabled={loading}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#67A177] transition-colors"
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Forgot Password */}
                  <div className="text-right">
                    <a
                      href="#"
                      className="text-sm text-[#67A177] hover:text-[#5a8f68] font-semibold"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleLoginSubmit}
                    disabled={loading}
                    className="w-full bg-[#67A177] text-white py-3 rounded-full font-bold text-lg hover:bg-[#5a8f68] transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#ACD4B1] text-gray-600 font-semibold">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Google OAuth */}
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full bg-white text-gray-700 py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-[#67A177] flex items-center justify-center space-x-3"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              ) : (
                // Signup - Google OAuth Only
                <div className="space-y-6 py-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      Create Account
                    </h2>
                    <p className="text-gray-600">
                      Join BiteNow with your Google account
                    </p>
                  </div>

                  {/* Google OAuth */}
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full bg-white text-gray-700 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-[#67A177] flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </button>

                  <div className="text-center text-sm text-gray-600 mt-8">
                    <p>Quick, secure, and hassle-free signup</p>
                    <p className="mt-2">No password required!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            By continuing, you agree to BiteNow's{" "}
            <a
              href="#"
              className="text-[#67A177] hover:text-[#5a8f68] font-semibold"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#67A177] hover:text-[#5a8f68] font-semibold"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      {/* Back to main login */}
      <div className="text-center mt-6">
        <button
          type="button"
          className="text-[#67A177] hover:text-[#5a8f68] font-semibold underline"
          onClick={() => {
            const frontendUrl =
              import.meta.env.VITE_FRONTEND_URL || window.location.origin;
            window.location.href = `${frontendUrl}/login`;
          }}
        >
          Back to main login
        </button>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {toast.type === "success" && (
                  <ShoppingCart className="w-6 h-6" />
                )}
                {toast.type === "error" && <Lock className="w-6 h-6" />}
                {toast.type === "warning" && <Mail className="w-6 h-6" />}
                <p className="font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="ml-4 hover:opacity-75"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
