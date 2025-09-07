import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const { logout, isAdmin, isStoreOwner } = useAuth();

  const navItems = [
    { to: '/profile', label: 'Profile', icon: <User size={20} />, show: true },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, show: isAdmin },
    { to: '/stores', label: 'Stores', icon: <Store size={20} />, show: true },
    { to: '/users', label: 'Users', icon: <Users size={20} />, show: isAdmin },
    { to: '/store-dashboard', label: 'Store Dashboard', icon: <Store size={20} />, show: isStoreOwner },
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1E293B] text-blue-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700
    transform transition-all duration-300 ease-in-out
    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
  `;

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="h-20 flex flex-col items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-blue-600 px-4 text-center">
          <Link to="/" className="flex items-center justify-center">
            <Store className="h-8 w-8 text-white mr-2" />
            <span className="text-xl font-bold text-white">RateSphere</span>
          </Link>
          {/* <span className="text-xs text-blue-100 mt-1">
            A complete ecosystem for store ratings
          </span> */}
        </div>

        {/* User Info */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-11 w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-blue-900 dark:text-gray-100 truncate max-w-[180px]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 font-medium capitalize">
                {user?.role?.replace('_', ' ') || 'Role'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-3 space-y-1">
          {filteredNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white shadow-inner'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-700 hover:text-blue-600 dark:hover:text-white'}
                `}
                onClick={handleClick}
              >
                <span
                  className={`
                    mr-3 p-1 rounded-lg
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-700 dark:text-white'}
                  `}
                >
                  {React.cloneElement(item.icon, { size: 18 })}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={16} className="text-blue-400" />}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full text-left group flex items-center px-3 py-3 mt-6 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-700 hover:text-red-600 dark:hover:text-white transition-all"
          >
            <span className="mr-3 p-1 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 dark:bg-red-600 dark:text-white">
              <LogOut size={18} />
            </span>
            <span className="flex-1">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;