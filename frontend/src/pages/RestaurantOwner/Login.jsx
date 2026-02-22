import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  // Redirect to profile if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/restaurant_owner/dashboard");
    }
  }, [navigate]);

  const handleGoogleAuth = () => {
    // Redirect to backend Google OAuth endpoint for restaurant owners
    const backendUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${backendUrl}/api/v1/auth/google/restaurant`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-light items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="text-center animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 inline-block mb-8 shadow-2xl">
              <ChefHat className="w-24 h-24 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              BiteNow
            </h1>
            <p className="text-2xl text-white/95 font-semibold mb-2">
              Restaurant Owner Portal
            </p>
            <p className="text-lg text-white/85 mt-4 leading-relaxed">
              Manage your restaurant with ease
            </p>
          </div>
        </div>

        {/* Back to Role Selection Button */}
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

      {/* Right Side - OAuth Login */}
      <div className="w-full lg:w-1/2 bg-secondary flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 inline-block mb-4 shadow-lg">
              <ChefHat className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">BiteNow</h1>
            <p className="text-white/80 mt-2">Restaurant Owner Portal</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-secondary/80 to-secondary rounded-xl p-8 text-center shadow-lg mb-6">
            <h2 className="text-3xl font-bold text-white mb-3">
              Grow Your Business
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-2">
              Sign in to manage your restaurant
            </p>
            <p className="text-white/70 text-sm">
              Quick, secure, and hassle-free authentication with Google
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full bg-white text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
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
            <span>Continue with Google</span>
          </button>

          {/* Info text */}
          <p className="text-white/60 text-center text-sm mt-6 leading-relaxed">
            By continuing, you agree to BiteNow's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
