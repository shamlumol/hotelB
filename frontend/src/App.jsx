import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Stays from './pages/Stays';
import StayDetails from './pages/StayDetails';
import Checkout from './pages/Checkout';
import BookingConfirmed from './pages/BookingConfirmed';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Experiences from './pages/Experiences';
import MyBookings from './pages/MyBookings';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import HelpSupport from './pages/HelpSupport';
import Wishlist from './pages/Wishlist';
import Destinations from './pages/Destinations';

import { TranslationProvider } from './context/TranslationContext';

// Layout wrapper to conditionally hide navbar/footer or manage scroll behavior
const AppLayout = () => {
  const location = useLocation();
  const isCheckout = location.pathname.startsWith('/checkout');
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hide standard navbar on Admin panel and Auth pages */}
      {!isAdmin && !isAuth && <Navbar />}

      <div className={`flex-grow ${!isAdmin && !isAuth ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/stays" element={<Stays />} />
          <Route path="/stays/:id" element={<StayDetails />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help-support" element={<HelpSupport />} />

          {/* Protected Routes - require authentication */}
          <Route path="/checkout/:id" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/booking-confirmed/:bookingId" element={
            <ProtectedRoute><BookingConfirmed /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute><MyBookings /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute><Wishlist /></ProtectedRoute>
          } />

          {/* Admin route */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>

      {!isAdmin && !isAuth && <Footer />}
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TranslationProvider>
          <Router>
            <AppLayout />
          </Router>
        </TranslationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
