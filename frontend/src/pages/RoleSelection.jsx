import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Bike, ChefHat, ArrowLeft, Utensils, Home } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "customer",
      title: "Customer",
      description: "Order delicious food from your favorite restaurants",
      icon: Users,
      path: "/customer/login",
    },
    {
      id: "rider",
      title: "Rider",
      description: "Deliver orders and earn money on your schedule",
      icon: Bike,
      path: "/rider/login",
    },
    {
      id: "restaurant-owner",
      title: "Restaurant Owner",
      description: "Manage your restaurant and grow your business",
      icon: ChefHat,
      path: "/restaurant-owner/login",
    },
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-light items-center justify-center p-12 relative overflow-hidden">
        {/* Main content area */}
        <div className="relative z-10 max-w-lg">
          <div className="text-center animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 inline-block mb-8 shadow-2xl">
              <Utensils className="w-24 h-24 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              BiteNow
            </h1>
            <p className="text-2xl text-white/95 font-semibold mb-2">
              Welcome!
            </p>
            <p className="text-lg mt-4 leading-relaxed inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2 font-medium tracking-wide text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white/80"></span>
              Choose your role to get started
              <span className="w-2 h-2 rounded-full bg-white/80"></span>
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => {
            const frontendUrl =
              import.meta.env.VITE_FRONTEND_URL || window.location.origin;
            window.location.href = frontendUrl;
          }}
          className="absolute bottom-8 left-8 flex items-center space-x-3 text-white hover:opacity-90 transition-all group"
        >
          <div className="bg-white rounded-full p-3 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </div>
          <span className="text-lg font-semibold drop-shadow-md">
            Back to Home
          </span>
        </button>
      </div>

      {/* Right Side - Role Selection Buttons */}
      <div className="w-full lg:w-1/2 bg-secondary flex items-center justify-center px-4 py-8 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 inline-block mb-4 shadow-lg">
              <Utensils className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">BiteNow</h1>
            <p className="text-white/80 mt-2">Choose Your Role</p>
          </div>

          {/* Title */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Select Your Role
            </h2>
            <p className="text-white/90 text-base font-medium">
              Choose how you want to use BiteNow
            </p>
          </div>

          {/* Role Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.path)}
                  className="w-full bg-secondary/80 hover:bg-secondary/60 text-white p-4 sm:p-6 rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-xl border-2 border-transparent hover:border-primary group"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-primary to-accent p-3 sm:p-4 rounded-lg group-hover:from-accent group-hover:to-accent-dark transition-all flex-shrink-0">
                      <Icon
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">
                        Login as {role.title}
                      </h3>
                      <p className="text-white/70 text-xs sm:text-sm">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">Don't have an account?</p>
            <p className="text-white/60 text-sm">
              Sign up after selecting your role
            </p>
          </div>

          {/* Back to Home - mobile only */}
          <div className="lg:hidden text-center mt-6">
            <button
              onClick={() => {
                const frontendUrl =
                  import.meta.env.VITE_FRONTEND_URL || window.location.origin;
                window.location.href = frontendUrl;
              }}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-all group"
            >
              <div className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all group-hover:scale-110">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
