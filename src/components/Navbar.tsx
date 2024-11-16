import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, FormInput } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600">
              <FormInput className="h-6 w-6 mr-2" />
              <span className="font-semibold text-lg">FormBuilder</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={signOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};