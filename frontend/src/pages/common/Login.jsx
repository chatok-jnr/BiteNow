import { useState } from "react";
import { Link } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";

function Login() {
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "customer",
      title: "Customer",
      description: "Order delicious food from your favorite restaurants",
      icon: "🍔",
    },
    {
      id: "restaurant",
      title: "Restaurant Owner",
      description: "Manage your restaurant and reach more customers",
      icon: "🏪",
    },
    {
      id: "rider",
      title: "Rider",
      description: "Deliver food and earn money on your schedule",
      icon: "🏍️",
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError("");
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">
            {selectedRole ? "Sign in to your account" : "Choose your role to continue"}
          </p>
        </div>

        {/* Role Selection or Google Auth */}
        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-200 text-center group"
              >
                <div className="text-5xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <span className="mr-2">←</span> Change role
            </button>

            {/* Selected Role Display */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Logging in as</p>
              <p className="text-xl font-bold text-primary">
                {roles.find((r) => r.id === selectedRole)?.title}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Google Login Button */}
            <GoogleLoginButton onError={setError} role={selectedRole} />

            {/* Info Text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                We use Google authentication to keep your account secure
              </p>
            </div>
          </div>
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
