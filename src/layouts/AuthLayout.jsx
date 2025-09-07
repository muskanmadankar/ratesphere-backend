import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Loader2 } from 'lucide-react';

const AuthLayout = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-full shadow-lg border border-blue-100">
            <Store className="h-10 w-10 text-blue-600" />
          </div>
        </div>
               {/* Branding Block */}
        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-blue-700">RateSphere</h1>
          <p className="text-xs text-gray-500 mt-2">A complete ecosystem for store ratings</p>
        </div>



        <p className="mt-2 text-center text-sm text-gray-600">
          {location.pathname.includes('/login') 
            ? 'Sign in to your account' 
            : 'Create your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl border border-gray-100 sm:px-10">
          <Outlet />
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-600">
        {location.pathname.includes('/login') ? (
          <p>
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;