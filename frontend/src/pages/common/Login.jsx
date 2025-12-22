import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance, { API_BASE_URL } from "../../utils/axios";
import * as cartService from "../../utils/cartService";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "customer", // default role
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let apiEndpoint = "";
      let requestBody = {};

      // Determine API endpoint and request body based on role
      if (formData.role === "customer") {
        apiEndpoint = `${API_BASE_URL}/api/v1/auth/login/customer`;
        requestBody = {
          customer_email: formData.email,
          customer_password: formData.password,
        };
      } else if (formData.role === "restaurant") {
        apiEndpoint = `${API_BASE_URL}/api/v1/auth/login/restaurant-owner`;
        requestBody = {
          restaurant_owner_email: formData.email,
          restaurant_owner_password: formData.password,
        };
      } else if (formData.role === "rider") {
        apiEndpoint = `${API_BASE_URL}/api/v1/auth/login/rider`;
        requestBody = {
          rider_email: formData.email,
          rider_password: formData.password,
        };
      }

      console.log("Login attempt - Role:", formData.role);
      console.log("Login attempt - Email:", formData.email);
      console.log("API Endpoint:", apiEndpoint);

      const response = await axiosInstance.post(apiEndpoint, requestBody);

      console.log("Login response:", response.data);

      if (response.data.status === "success") {
        // Store user info in localStorage
        const userData = {
          email: formData.email,
          role: formData.role,
          token: response.data.token,
        };

        // Handle different response structures for different roles
        if (formData.role === "restaurant" && response.data.data.ownerResponse) {
          Object.assign(userData, response.data.data.ownerResponse);
        } else if (response.data.data) {
          Object.assign(userData, response.data.data);
        }

        localStorage.setItem("user", JSON.stringify(userData));

        // Store token separately for easy access
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        // Migrate guest cart to user account if customer
        if (formData.role === "customer") {
          try {
            await cartService.migrateGuestCart();
          } catch (migrationError) {
            console.error("Cart migration failed:", migrationError);
            // Don't block login if cart migration fails
          }
        }

        // Redirect based on role
        if (formData.role === "restaurant") {
          localStorage.removeItem("intendedDestination");
          navigate("/owner-dashboard");
        } else if (formData.role === "rider") {
          localStorage.removeItem("intendedDestination");
          navigate("/rider-dashboard");
        } else if (formData.role === "customer") {
          const intendedDestination = localStorage.getItem("intendedDestination");
          console.log("Intended destination:", intendedDestination);
          
          if (intendedDestination) {
            localStorage.removeItem("intendedDestination");
            navigate(intendedDestination);
          } else {
            navigate("/customer-dashboard");
          }
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Log in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="customer">Customer</option>
              <option value="restaurant">Restaurant Owner</option>
              <option value="rider">Rider</option>
            </select>
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

          {/* Demo credentials info
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="font-semibold text-green-900 mb-2">
              ✅ Demo Credentials (Choose any):
            </p>
            <div className="space-y-1 text-green-800">
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
          </div> */}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

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
