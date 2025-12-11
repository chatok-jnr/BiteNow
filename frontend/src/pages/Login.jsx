import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");

  // Mock users
  const mockUsers = {
    "customer@test.com": {
      password: "customer123",
      role: "customer",
      name: "John Doe",
    },
    "rider@test.com": {
      password: "rider123",
      role: "rider",
      name: "Mike Wilson",
    },
    "restaurant@test.com": {
      password: "restaurant123",
      role: "restaurant",
      name: "Sarah's Kitchen",
    },
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    const user = mockUsers[formData.email];

    if (user && user.password === formData.password) {
      // Store user info in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          role: user.role,
          name: user.name,
        })
      );

      // Navigate to appropriate dashboard
      if (user.role === "customer") {
        navigate("/customer-dashboard");
      } else if (user.role === "rider") {
        navigate("/rider-dashboard");
      } else if (user.role === "restaurant") {
        navigate("/restaurant-dashboard");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    console.log("Phone login:", formData.phone);
    // Add phone authentication logic here
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    // Add Google OAuth logic here
  };

  const handleAppleLogin = () => {
    console.log("Apple login");
    // Add Apple OAuth logic here
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="text-gray-700 font-medium">
              Continue with Apple
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Toggle between Email and Phone */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setLoginMethod("email")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              loginMethod === "email"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMethod("phone")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              loginMethod === "phone"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
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
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              Sign In
            </button>

            {/* Demo credentials info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">
                Demo Credentials:
              </p>
              <p>
                <strong>Customer:</strong> customer@test.com / customer123
              </p>
              <p>
                <strong>Rider:</strong> rider@test.com / rider123
              </p>
              <p>
                <strong>Restaurant:</strong> restaurant@test.com / restaurant123
              </p>
            </div>
          </form>
        )}

        {/* Phone Login Form */}
        {loginMethod === "phone" && (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
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
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              Send OTP
            </button>
          </form>
        )}

        {/* Sign Up Link */}
        <p className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-primary hover:text-primary/80 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
