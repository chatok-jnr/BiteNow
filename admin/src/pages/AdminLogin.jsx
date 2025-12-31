import React, { useState } from 'react';

export default function AdminLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple login simulation
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const navItems = [
    'Dashboard',
    'Customer',
    'Restaurant Owner',
    'Restaurant',
    'Rider'
  ];

  const bottomNavItems = ['Admin List', 'Audit Log'];

  const stats = [
    { label: 'Pending Orders', value: '247' },
    { label: 'Restaurant Owner Pending', value: '12' },
    { label: 'Rider Pending', value: '8' }
  ];

  const userStats = [
    { role: 'Customer', count: '15,429' },
    { role: 'Restaurant Owner', count: '342' },
    { role: 'Restaurant', count: '289' },
    { role: 'Rider', count: '156' },
    { role: 'Admin', count: '7' }
  ];

  const auditLogs = [
    { user: 'Chatok', action: 'Banned a customer', time: '2 hours ago' },
    { user: 'Opu', action: 'Approved a restaurant', time: '3 hours ago' },
    { user: 'Sarah', action: 'Updated rider status', time: '5 hours ago' },
    { user: 'Mike', action: 'Reviewed order dispute', time: '6 hours ago' }
  ];

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative border border-white/10 rounded-3xl p-8 bg-gradient-to-br from-[#16161d] to-[#1a1a22] shadow-2xl overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5 opacity-50" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">
                  BiteNow
                </h1>
                <p className="text-gray-400 text-sm">Admin Dashboard Login</p>
              </div>

              {/* Login Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bitenow.com"
                    className="w-full px-4 py-3 bg-[#1a1a22] border border-white/10 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#1a1a22] border border-white/10 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-400 cursor-pointer">
                    <input type="checkbox" className="mr-2 accent-orange-500" />
                    Remember me
                  </label>
                  <button className="text-orange-400 hover:text-orange-300 transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                    Contact Admin
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>© 2025 BiteNow. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

}