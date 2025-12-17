import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = mockUsers[formData.email];

    console.log("Login attempt - Email:", formData.email);
    console.log("Login attempt - Password:", formData.password);
    console.log("Found user:", user);

    if (user && user.password === formData.password) {
      // Store user info in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          role: user.role,
          name: user.name,
          password: formData.password,
        })
      );

      // Always redirect restaurant and rider to their dashboards
      if (user.role === "restaurant") {
        localStorage.removeItem("intendedDestination");
        navigate("/restaurant-dashboard");
      } else if (user.role === "rider") {
        localStorage.removeItem("intendedDestination");
        navigate("/rider-dashboard");
      } else if (user.role === "customer") {
        // Only customers can use intendedDestination
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
      console.log("Login failed");
      setError("Invalid email or password");
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

          {/* Demo credentials info */}
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
            Log In
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
