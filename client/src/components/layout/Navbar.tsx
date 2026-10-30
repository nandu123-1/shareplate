import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Package,
  Clock,
  LayoutDashboard,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest-900 dark:bg-emerald-600 flex items-center justify-center text-cream-50 shadow-soft-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-citrus-400 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7c-2 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1-4-3-6z" fill="#E06D3B" stroke="none" />
                <path d="M12 3v3" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-forest-950 dark:text-cream-50 font-editorial">
                Share<span className="text-citrus-500">Plate</span>
              </span>
              <span className="block text-[10px] text-charcoal-400 dark:text-charcoal-400 font-medium tracking-wide -mt-1 hidden sm:block">
                Good Food. Shared Future.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-forest-900 dark:text-cream-50 font-semibold bg-forest-50 dark:bg-charcoal-800'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:text-forest-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'text-forest-900 dark:text-cream-50 font-semibold bg-forest-50 dark:bg-charcoal-800'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:text-forest-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
              }`}
            >
              Explore Food
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/how-it-works')
                  ? 'text-forest-900 dark:text-cream-50 font-semibold bg-forest-50 dark:bg-charcoal-800'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:text-forest-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/impact"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/impact')
                  ? 'text-forest-900 dark:text-cream-50 font-semibold bg-forest-50 dark:bg-charcoal-800'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:text-forest-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
              }`}
            >
              Our Impact
            </Link>
            <Link
              to="/about"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-forest-900 dark:text-cream-50 font-semibold bg-forest-50 dark:bg-charcoal-800'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:text-forest-900 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-charcoal-800/60'
              }`}
            >
              About
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Role Quick Links */}
                {user.role === 'DONOR' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => navigate('/donor/create-listing')}
                    icon={<PlusCircle className="w-4 h-4 text-citrus-400" />}
                  >
                    Donate Food
                  </Button>
                )}

                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 rounded-xl text-charcoal-600 dark:text-cream-300 hover:bg-cream-200/70 dark:hover:bg-charcoal-800 hover:text-forest-900 dark:hover:text-cream-50 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-citrus-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-900 rounded-2xl shadow-soft-lg border border-cream-300 dark:border-charcoal-800 py-3 z-50">
                      <div className="px-4 pb-2 border-b border-cream-200 dark:border-charcoal-800 flex items-center justify-between">
                        <span className="font-bold text-sm text-forest-950 dark:text-cream-50">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs text-forest-700 dark:text-emerald-400 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-cream-100 dark:divide-charcoal-800">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-charcoal-400 dark:text-charcoal-400 text-center">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setIsNotifOpen(false);
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-800 transition-colors ${
                                !n.is_read ? 'bg-cream-100/70 dark:bg-charcoal-800/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-charcoal-900 dark:text-cream-100">{n.title}</span>
                                <span className="text-[10px] text-charcoal-400">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-charcoal-600 dark:text-charcoal-300 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-cream-300 dark:border-charcoal-700 hover:bg-cream-100 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-forest-950 dark:text-cream-50 line-clamp-1">{user.name}</p>
                      <span className="text-[10px] text-charcoal-500 dark:text-charcoal-400 font-medium capitalize">
                        {user.role.toLowerCase()}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-forest-900 dark:bg-emerald-600 text-cream-50 font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-charcoal-900 rounded-2xl shadow-soft-lg border border-cream-300 dark:border-charcoal-800 py-2 z-50">
                      <div className="px-4 py-2 border-b border-cream-100 dark:border-charcoal-800">
                        <p className="text-xs font-bold text-forest-950 dark:text-cream-50">{user.name}</p>
                        <p className="text-[11px] text-charcoal-400 truncate">{user.email}</p>
                        <Badge variant="forest" size="sm" className="mt-1.5">
                          {user.role}
                        </Badge>
                      </div>

                      {/* Role Specific Navigation */}
                      <div className="py-1">
                        {user.role === 'DONOR' && (
                          <>
                            <Link
                              to="/donor/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <LayoutDashboard className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Donor Dashboard
                            </Link>
                            <Link
                              to="/donor/requests"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <Package className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Incoming Requests
                            </Link>
                            <Link
                              to="/donor/pickups"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <Clock className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Active Pickups
                            </Link>
                          </>
                        )}

                        {user.role === 'RECIPIENT' && (
                          <>
                            <Link
                              to="/recipient/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <LayoutDashboard className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Recipient Dashboard
                            </Link>
                            <Link
                              to="/recipient/requests"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <Package className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              My Food Requests
                            </Link>
                            <Link
                              to="/recipient/pickups"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <Clock className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Active Pickups (Codes)
                            </Link>
                          </>
                        )}

                        {user.role === 'ADMIN' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <LayoutDashboard className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Admin Center
                            </Link>
                            <Link
                              to="/admin/users"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <UserCheck className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                              Manage Users
                            </Link>
                            <Link
                              to="/admin/reports"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                            >
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                              Reports Moderation
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-cream-100 dark:border-charcoal-800">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-charcoal-600 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cream-50 dark:bg-charcoal-950 border-b border-cream-300 dark:border-charcoal-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
          >
            Explore Food
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
          >
            How It Works
          </Link>
          <Link
            to="/impact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
          >
            Our Impact
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
          >
            About
          </Link>

          {user && (
            <div className="pt-3 border-t border-cream-300 dark:border-charcoal-800">
              <p className="px-3 text-xs font-semibold text-charcoal-400 dark:text-charcoal-400 uppercase tracking-wider mb-2">
                {user.role} Workspace
              </p>
              {user.role === 'DONOR' && (
                <>
                  <Link
                    to="/donor/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/donor/create-listing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    + Donate Food Listing
                  </Link>
                  <Link
                    to="/donor/requests"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Incoming Requests
                  </Link>
                </>
              )}
              {user.role === 'RECIPIENT' && (
                <>
                  <Link
                    to="/recipient/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recipient/requests"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    My Food Requests
                  </Link>
                  <Link
                    to="/recipient/pickups"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Pickup Verification Codes
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    User Directory
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-forest-950 dark:text-cream-100 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-900"
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
