import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bike, ChefHat } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order delicious food from your favorite restaurants',
      icon: Users,
      path: '/customer/login',
      gradient: 'from-green-400 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:to-green-700'
    },
    {
      id: 'rider',
      title: 'Rider',
      description: 'Deliver orders and earn money on your schedule',
      icon: Bike,
      path: '/rider/login',
      gradient: 'from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'restaurant-owner',
      title: 'Restaurant Owner',
      description: 'Manage your restaurant and grow your business',
      icon: ChefHat,
      path: '/restaurant-owner/login',
      gradient: 'from-orange-400 to-orange-600',
      hoverGradient: 'hover:from-orange-500 hover:to-orange-700'
    }
  ];

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-green-600">BiteNow</span>
          </h1>
          <p className="text-lg text-gray-600">
            Choose your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.path)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-green-400 transition-all duration-300">
                  {/* Icon Section */}
                  <div className={`bg-gradient-to-br ${role.gradient} ${role.hoverGradient} p-8 flex items-center justify-center transition-all duration-300`}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                      <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {role.description}
                    </p>
                    
                    {/* Login Button */}
                    <div className="mt-6">
                      <button
                        className={`w-full bg-gradient-to-r ${role.gradient} text-white font-semibold py-3 px-6 rounded-lg ${role.hoverGradient} transform transition-all duration-300 shadow-md hover:shadow-xl`}
                      >
                        Login as {role.title}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Don't have an account? Sign up after selecting your role
          </p>
          {/* Back to Home Button */}
          <div className="mt-6">
            <button
              type="button"
              className="text-[#67A177] hover:text-[#5a8f68] font-semibold underline"
              onClick={() => {
                const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
                window.location.href = frontendUrl;
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
