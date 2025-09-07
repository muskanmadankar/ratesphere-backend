import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { ChevronDown, Settings } from 'react-feather';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  return (
    <header className="bg-gradient-to-r from-primary to-secondary shadow-lg h-16 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">
          {user?.role === 'admin'
            ? 'Admin Dashboard'
            : user?.role === 'store_owner'
            ? 'Store Dashboard'
            : 'Store Ratings'}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-darkBg text-primary dark:text-darkText hover:bg-accent transition-all"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        <button
          className="relative rounded-full p-2 text-white hover:text-white hover:bg-secondary focus:outline-none transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-3 focus:outline-none group"
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-primary font-bold shadow-sm group-hover:ring-2 group-hover:ring-white transition-all">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-primary dark:text-darkText">{user?.name || 'User'}</p>
              <p className="text-xs text-primary dark:text-darkText">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-1 z-50 border border-gray-100 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <a
                href="/profile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-accent hover:text-primary transition-colors"
              >
                <User size={16} className="mr-3 text-gray-400" />
                Profile Settings
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin/settings"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-accent hover:text-primary transition-colors"
                >
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Admin Settings
                </a>
              )}
              <button
                onClick={onLogout}
                className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-accent hover:text-primary transition-colors border-t border-gray-100"
              >
                <LogOut size={16} className="mr-3 text-gray-400" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;