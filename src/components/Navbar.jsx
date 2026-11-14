import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import {
  Droplet, HeartHandshake, Building2, Bell, User, LogOut,
  Menu, X, ShieldAlert, Award, FileText, Search, Activity
} from 'lucide-react';

const Navbar = () => {
  const { user, role, logout, isAuthenticated, isDonor, isHospital, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.getNotifications()
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D7263D] to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-200">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-[#102A43]">
              Blood<span className="text-[#D7263D]">Connect</span>
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider font-semibold text-slate-500 uppercase -mt-1">
              Save Lives Community
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-semibold text-slate-700">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-colors ${isActive('/') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
          >
            Home
          </Link>
          <Link
            to="/find-blood"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${isActive('/find-blood') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
          >
            <Search className="w-4 h-4" />
            Find Blood
          </Link>
          <Link
            to="/requests"
            className={`px-3.5 py-2 rounded-xl transition-colors ${isActive('/requests') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
          >
            Blood Requests
          </Link>
          <Link
            to="/reports"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors ${isActive('/reports') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
          >
            <Activity className="w-4 h-4" />
            Blood Reports
          </Link>

          {isDonor && (
            <>
              <Link
                to="/donor-points"
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-colors ${isActive('/donor-points') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
              >
                <Award className="w-4 h-4 text-amber-500" />
                Rewards
              </Link>
              <Link
                to="/certificates"
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-colors ${isActive('/certificates') ? 'text-[#D7263D] bg-rose-50/80 font-bold' : 'hover:text-[#D7263D] hover:bg-slate-100/60'}`}
              >
                <FileText className="w-4 h-4 text-purple-600" />
                Certificates
              </Link>
            </>
          )}

          {isHospital && (
            <>
              <Link
                to="/hospital/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-colors ${isActive('/hospital/dashboard') ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-teal-700 hover:bg-slate-100/60'}`}
              >
                Dashboard
              </Link>
              <Link
                to="/hospital/inventory"
                className={`px-3.5 py-2 rounded-xl transition-colors ${isActive('/hospital/inventory') ? 'text-teal-700 bg-teal-50 font-bold' : 'hover:text-teal-700 hover:bg-slate-100/60'}`}
              >
                Inventory
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl transition-colors ${isActive('/admin') ? 'text-purple-700 bg-purple-50 font-bold' : 'hover:text-purple-700 hover:bg-slate-100/60'}`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Action Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#D7263D] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown / Pill */}
              <Link
                to={isHospital ? '/hospital/dashboard' : (isAdmin ? '/admin' : '/dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-sm font-semibold text-slate-800"
              >
                <div className="w-7 h-7 rounded-lg bg-[#102A43] text-white flex items-center justify-center text-xs font-bold">
                  {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user?.fullName || user?.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-[#D7263D] transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-[#D7263D] transition"
              >
                User Login
              </Link>
              <Link
                to="/hospital/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition"
              >
                <Building2 className="w-4 h-4" />
                Hospital Portal
              </Link>
              <Link
                to="/register"
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl shadow-md transition-all hover:scale-102"
              >
                <HeartHandshake className="w-4 h-4 text-white" />
                Become a Donor
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <Link to="/notifications" className="p-2 text-slate-600 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#D7263D] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white/95 backdrop-blur-xl border-b border-slate-200 space-y-2 animate-in slide-in-from-top-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/find-blood"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Find Blood Availability
          </Link>
          <Link
            to="/requests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Active Blood Requests
          </Link>
          <Link
            to="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
          >
            Blood Reports
          </Link>

          {isDonor && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-[#D7263D] bg-rose-50"
              >
                Donor Dashboard
              </Link>
              <Link
                to="/donor-points"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
              >
                Points & Badges
              </Link>
              <Link
                to="/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
              >
                My Certificates
              </Link>
            </>
          )}

          {isHospital && (
            <>
              <Link
                to="/hospital/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-teal-800 bg-teal-50"
              >
                Hospital Dashboard
              </Link>
              <Link
                to="/hospital/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
              >
                Blood Inventory
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-purple-800 bg-purple-50"
            >
              Administrator Portal
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
              >
                Log Out ({user?.fullName || user?.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
                >
                  User Login
                </Link>
                <Link
                  to="/hospital/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg font-semibold text-teal-700 hover:bg-teal-50"
                >
                  Hospital Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary block text-center px-4 py-2.5 rounded-xl text-white font-bold"
                >
                  Become a Donor
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;