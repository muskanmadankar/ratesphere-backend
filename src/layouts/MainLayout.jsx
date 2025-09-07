import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Menu, X } from 'lucide-react';

const MainLayout = () => {
  const { currentUser, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-darkBg text-primary dark:text-darkText font-sans transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-darkBg text-primary dark:text-darkText font-sans transition-colors duration-300">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-white dark:bg-cardDark shadow-lg text-accent hover:bg-accentDark transition-colors border border-borderLight dark:border-borderDark"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={currentUser}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'lg:ml-64'} min-h-screen flex flex-col`}>
        <Navbar user={currentUser} onLogout={handleLogout} />

        <main className="flex-grow p-4 sm:p-6 lg:p-8 transition-all">
          <div className="bg-cardLight dark:bg-cardDark rounded-xl shadow-sm p-6 border border-borderLight dark:border-borderDark">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-darkText border-t border-borderLight dark:border-borderDark">
          © {new Date().getFullYear()} RateSphere : Store Rating System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;