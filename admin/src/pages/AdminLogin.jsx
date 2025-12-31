import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login/admin', {
        admin_email: email,
        admin_password: password
      });

      if (response.data.status === 'success') {
        // Store token and admin data
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.data.adminResponse));
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bitenow.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#1a1a22] border border-white/10 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#1a1a22] border border-white/10 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 text-lg focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <span role="img" aria-label="Hide">🙈</span>
                    ) : (
                      <span role="img" aria-label="Show">👁️</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-400 cursor-pointer">
                  <input type="checkbox" className="mr-2 accent-orange-500" disabled={loading} />
                  Remember me
                </label>
                <button type="button" className="text-orange-400 hover:text-orange-300 transition-colors" disabled={loading}>
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

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