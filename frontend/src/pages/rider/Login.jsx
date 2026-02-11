import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  Mail,
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { loginRider } from "../../utils/authService";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!loginForm.emailOrPhone || !loginForm.password) {
        setError("Please fill in all fields");
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

        setSuccess("Login successful! Redirecting...");

        console.log("🔄 Navigating to rider home...");
        // Navigate to rider home
        setTimeout(() => {
          navigate("/rider/home");
        }, 1000);
      } else {
        console.error("❌ Login failed - Invalid response:", response);
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
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
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-light items-center justify-center p-12 relative overflow-hidden">
        {/* Main illustration area */}
        <div className="relative z-10 max-w-lg">
          <div className="text-center animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 inline-block mb-8 shadow-2xl">
              <Bike className="w-24 h-24 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              BiteNow
            </h1>
            <p className="text-2xl text-white/95 font-semibold mb-2">
              Rider Portal
            </p>
            <p className="text-lg text-white/85 mt-4 leading-relaxed">
              Deliver with ease and earn more
            </p>
          </div>
        </div>

        {/* Back to Main Login Button */}
        <button
          onClick={() => {
            const frontendUrl =
              import.meta.env.VITE_FRONTEND_URL || window.location.origin;
            window.location.href = `${frontendUrl}/login`;
          }}
          className="absolute bottom-8 left-8 flex items-center space-x-3 text-white hover:opacity-90 transition-all group"
        >
          <div className="bg-white rounded-full p-3 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </div>
          <span className="text-lg font-semibold drop-shadow-md">
            Return to Role Selection Page
          </span>
        </button>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-secondary flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 inline-block mb-4 shadow-lg">
              <Bike className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">BiteNow</h1>
            <p className="text-white/80 mt-2">Rider Portal</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex rounded-full overflow-hidden mb-6 bg-secondary/80/40 p-1 shadow-inner">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 text-base font-bold transition-all rounded-full ${
                isLogin
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 text-base font-bold transition-all rounded-full ${
                !isLogin
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-white/60 hover:text-white/90"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          <div className="min-h-[420px]">
            {isLogin ? (
              <>
                <div className="text-center lg:text-left mb-5">
                  <p className="text-white/90 text-base font-medium">
                    Welcome back! Please login to start delivering
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-500/20 border border-green-500/50 text-white px-4 py-3 rounded-lg text-sm animate-fade-in">
                    {success}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username Input */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Email or Phone
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        name="emailOrPhone"
                        value={loginForm.emailOrPhone}
                        onChange={handleLoginChange}
                        placeholder="Enter your email or phone"
                        className="w-full pl-12 pr-4 py-3.5 bg-secondary/80 text-white placeholder-white/40 rounded-lg border-2 border-transparent focus:border-primary focus:bg-secondary/60 focus:outline-none transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3.5 bg-secondary/80 text-white placeholder-white/40 rounded-lg border-2 border-transparent focus:border-primary focus:bg-secondary/60 focus:outline-none transition-all"
                        disabled={loading}
                        required
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
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

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-lg font-bold text-base hover:from-accent hover:to-accent-dark transition-all hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-secondary text-white/60 font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Google OAuth */}
                <button
                  onClick={handleGoogleAuth}
                  type="button"
                  disabled={loading}
                  className="w-full bg-white text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
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
              </>
            ) : (
              // Sign Up Form
              <>
                <div className="text-center lg:text-left mb-5">
                  <p className="text-white/90 text-base font-medium">
                    Create your rider account to start earning
                  </p>
                </div>

                {/* Welcome Message */}
                <div className="bg-gradient-to-br from-secondary/80 to-secondary rounded-xl p-6 text-center shadow-lg mb-5">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Join BiteNow Riders!
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Quick, secure, and hassle-free signup with your Google
                    account
                  </p>
                </div>

                {/* Google OAuth Button */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
                  <span>
                    {loading ? "Signing up..." : "Sign up with Google"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
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
