import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Dashboard } from './components/Dashboard';
import { FormBuilder } from './components/FormBuilder';
import { FormEmbed } from './components/FormEmbed';
import { FormView } from './components/FormView';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Navbar } from './components/Navbar';
import { NotFound } from './components/NotFound';
import { Toaster } from 'react-hot-toast';

function App() {
  const initialize = useAuthStore(state => state.initialize);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Public routes for viewing forms */}
        <Route path="/form/:formId" element={<FormView />} />
        <Route path="/embed/:formId" element={<FormEmbed />} />
        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/builder" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
        <Route path="/builder/:formId" element={<PrivateRoute><FormBuilder /></PrivateRoute>} />
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;