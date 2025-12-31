import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Building2, 
  Bike,
  UserCog,
  FileText,
  Search,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customer', icon: Users, path: '/customers' },
    { name: 'Restaurant Owner', icon: UserCog, path: '/restaurant-owner' },
    { name: 'Restaurant', icon: Store, path: '/restaurant' },
    { name: 'Rider', icon: Bike, path: '/rider' }
  ];

  const bottomNavItems = [
    { name: 'Admin List', icon: Building2, path: '/admin-list' },
    { name: 'Audit Log', icon: FileText, path: '/audit-log' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col bg-[#111116]">
      {/* Brand */}
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
          BiteNow
        </h1>
        <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
      </div>

      {/* Search
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-[#1a1a22] border border-white/10 rounded text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-[#1f1f2a] transition-all"
          />
        </div>
      </div> */}

      {/* Navigation Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Main Navigation Card */}
        <div className="bg-[#1a1a22] border border-white/10 rounded-3xl p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Main Menu
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-3xl text-sm transition-all flex items-center gap-3 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[#fc5e03] to-[#fc5e03] border border-[#fc5e03] text-white shadow-lg shadow-[#fc5e03]/20 font-medium'
                      : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Tools Card */}
        <div className="bg-[#1a1a22] border border-white/10 rounded-3xl p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Admin Tools
          </h3>
          <nav className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-4 py-2.5 rounded-3xl text-sm transition-all flex items-center gap-3 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[#fc5e03] to-[#fc5e03] border border-[#fc5e03] text-white shadow-lg shadow-[#fc5e03]/20 font-medium'
                      : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        {/* Logout Button Card */}
        <div className="bg-[#1a1a22] border border-white/10 rounded-3xl p-3">
          <button
            className="w-full px-4 py-2.5 rounded-3xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium shadow-lg transition-all hover:from-red-600 hover:to-rose-600 focus:outline-none hover:shadow-xl hover:shadow-red-500/20 flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
