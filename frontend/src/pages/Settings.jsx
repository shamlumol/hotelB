import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { API_URL, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('preferences');

  // Preferences State
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR');
  const [autoplayAnimations, setAutoplayAnimations] = useState(true);
  const [prefSuccess, setPrefSuccess] = useState('');

  // Notifications State
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyPromos, setNotifyPromos] = useState(false);
  const [notifyLoyalty, setNotifyLoyalty] = useState(true);
  const [notifySuccess, setNotifySuccess] = useState('');

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account Control State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Apply theme to document
  const applyTheme = (selectedTheme) => {
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!user) return;

    // Load preferences from localStorage
    const savedTheme = localStorage.getItem('hotelb_theme') || 'light';
    const savedLanguage = localStorage.getItem('hotelb_language') || 'English';
    const savedCurrency = localStorage.getItem('hotelb_currency') || 'INR';
    const savedAutoplay = localStorage.getItem('hotelb_autoplay');
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);
    setAutoplayAnimations(savedAutoplay !== 'false');

    // Apply saved theme on load
    applyTheme(savedTheme);

    // Load notifications from localStorage
    const savedBookings = localStorage.getItem('hotelb_notify_bookings');
    const savedPromos = localStorage.getItem('hotelb_notify_promos');
    const savedLoyalty = localStorage.getItem('hotelb_notify_loyalty');

    setNotifyBookings(savedBookings !== 'false');
    setNotifyPromos(savedPromos === 'true');
    setNotifyLoyalty(savedLoyalty !== 'false');
  }, [user]);

  // Apply theme immediately when toggled
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('hotelb_theme', newTheme);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setPrefSuccess('');
    localStorage.setItem('hotelb_theme', theme);
    localStorage.setItem('hotelb_language', language);
    localStorage.setItem('hotelb_currency', currency);
    localStorage.setItem('hotelb_autoplay', String(autoplayAnimations));

    applyTheme(theme);
    // Notify TranslationContext of the new language
    window.dispatchEvent(new Event('languageUpdated'));

    setPrefSuccess('Preferences saved successfully.');
    setTimeout(() => setPrefSuccess(''), 4000);
  };

  // Immediately apply language change for real-time UI feedback
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('hotelb_language', newLang);
    window.dispatchEvent(new Event('languageUpdated'));
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setNotifySuccess('');
    localStorage.setItem('hotelb_notify_bookings', String(notifyBookings));
    localStorage.setItem('hotelb_notify_promos', String(notifyPromos));
    localStorage.setItem('hotelb_notify_loyalty', String(notifyLoyalty));

    setNotifySuccess('Notification preferences updated.');
    setTimeout(() => setNotifySuccess(''), 4000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.put(`${API_URL}/auth/password`, {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const staysRes = await axios.get(`${API_URL}/bookings/me`);
      const exportObject = {
        exportedAt: new Date().toISOString(),
        userProfile: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier,
          provider: user.provider
        },
        preferences: {
          theme,
          language,
          currency,
          autoplayAnimations
        },
        notifications: {
          bookings: notifyBookings,
          promotionalOffers: notifyPromos,
          loyaltyAlerts: notifyLoyalty
        },
        reservationsHistory: staysRes.data?.success ? staysRes.data.data : []
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `hotelb_profile_${user.name.toLowerCase().replace(/\s+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Error bundling export profile data.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (deleteConfirmText !== 'DELETE PERMANENTLY') {
      setDeleteError('Please type "DELETE PERMANENTLY" to confirm.');
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await axios.delete(`${API_URL}/auth/account`);
      if (res.data.success) {
        alert('Your sanctuary profile has been permanently deleted.');
        logout();
        navigate('/');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Error deleting account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center bg-background min-h-screen flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-left bg-background min-h-screen relative">
      {/* Header */}
      <section className="mb-12">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
          Control Panel
        </span>
        <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
          Account<br />
          <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Settings
          </span>
        </h1>
        <p className="font-body text-sm md:text-base text-secondary max-w-2xl leading-relaxed">
          Manage your display preferences, notifications, and account security.
        </p>
      </section>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Tabs Menu Column */}
        <aside className="lg:col-span-3 space-y-1.5">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeTab === 'preferences'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeTab === 'notifications'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeTab === 'security'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">security</span>
            Security &amp; Account
          </button>
        </aside>

        {/* Right Settings Content Column */}
        <section className="lg:col-span-9 bg-white rounded-2xl border border-secondary-container/40 p-6 sm:p-8 shadow-soft min-h-[400px]">
          {/* ===== Tab 1: Preferences ===== */}
          {activeTab === 'preferences' && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h3 className="font-headline text-xl text-primary font-semibold mb-1">Display & Regional</h3>
                <p className="text-xs text-secondary mb-6">Customize your visual experience and regional formats.</p>
              </div>

              {prefSuccess && (
                <div className="bg-[#1f5e46]/10 text-primary p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {prefSuccess}
                </div>
              )}

              <form onSubmit={handleSavePreferences} className="space-y-8">
                {/* Theme Selector - Visual Cards */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Appearance</label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    {/* Light Mode Card */}
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left group ${
                        theme === 'light'
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-outline-variant/40 hover:border-outline-variant'
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg mb-3 bg-[#fcf9f8] border border-[#e4e2e1] flex items-center justify-center overflow-hidden">
                        <div className="w-full px-2 space-y-1.5">
                          <div className="h-2 bg-[#004630] rounded-full w-3/4"></div>
                          <div className="h-1.5 bg-[#e6e2d9] rounded-full w-full"></div>
                          <div className="h-1.5 bg-[#e6e2d9] rounded-full w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">light_mode</span>
                        <span className="text-xs font-bold text-primary">Light</span>
                      </div>
                      {theme === 'light' && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </button>

                    {/* Dark Mode Card */}
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left group ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-outline-variant/40 hover:border-outline-variant'
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg mb-3 bg-[#121212] border border-[#333] flex items-center justify-center overflow-hidden">
                        <div className="w-full px-2 space-y-1.5">
                          <div className="h-2 bg-[#7cc9a5] rounded-full w-3/4"></div>
                          <div className="h-1.5 bg-[#333] rounded-full w-full"></div>
                          <div className="h-1.5 bg-[#333] rounded-full w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">dark_mode</span>
                        <span className="text-xs font-bold text-primary">Dark</span>
                      </div>
                      {theme === 'dark' && (
                        <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Language & Currency Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-outline-variant/20">
                  {/* Language Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Language</label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Malayalam">മലയാളം (Malayalam)</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    </select>
                  </div>

                  {/* Currency Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="INR">₹ Indian Rupee (INR)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                      <option value="EUR">€ Euro (EUR)</option>
                      <option value="GBP">£ British Pound (GBP)</option>
                      <option value="AED">د.إ UAE Dirham (AED)</option>
                    </select>
                  </div>
                </div>

                {/* Autoplay toggle */}
                <div className="pt-6 border-t border-outline-variant/20">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-secondary-container/40 max-w-lg">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-primary">Auto-play Animations</h4>
                      <p className="text-xs text-secondary leading-relaxed">Enable smooth transitions and micro-animations across the interface.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={autoplayAnimations}
                        onChange={(e) => setAutoplayAnimations(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-container/60 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
              </form>
            </div>
          )}

          {/* ===== Tab 2: Notifications ===== */}
          {activeTab === 'notifications' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="font-headline text-xl text-primary font-semibold mb-1">Notification Settings</h3>
                <p className="text-xs text-secondary mb-6">Manage how you receive alerts, booking receipts, and rewards news.</p>
              </div>

              {notifySuccess && (
                <div className="bg-[#1f5e46]/10 text-primary p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {notifySuccess}
                </div>
              )}

              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  {/* Notification Choice 1 */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-secondary-container/40">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-primary">Booking Confirmations</h4>
                      <p className="text-xs text-secondary leading-relaxed">Receive instant confirmation, itinerary shifts, and billing coordinates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={notifyBookings}
                        onChange={(e) => setNotifyBookings(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-container/60 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Notification Choice 2 */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-secondary-container/40">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-primary">Promotions &amp; Seasonal Invites</h4>
                      <p className="text-xs text-secondary leading-relaxed">Receive invitations for exclusive property openings and seasonal package rates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={notifyPromos}
                        onChange={(e) => setNotifyPromos(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-container/60 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Notification Choice 3 */}
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-secondary-container/40">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-primary">Loyalty Rewards &amp; Point Alerts</h4>
                      <p className="text-xs text-secondary leading-relaxed">Updates when points are credited or when you qualify for loyalty tier elevations.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={notifyLoyalty}
                        onChange={(e) => setNotifyLoyalty(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-container/60 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md transition-colors cursor-pointer"
                >
                  Save Notification Rules
                </button>
              </form>
            </div>
          )}

          {/* ===== Tab 3: Security & Account ===== */}
          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-8">
              {/* Security Block */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-xl text-primary font-semibold mb-1">Security &amp; Encryption</h3>
                  <p className="text-xs text-secondary mb-6">Manage password credentials and data files.</p>
                </div>

                {passwordError && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-[#1f5e46]/10 text-primary p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {passwordSuccess}
                  </div>
                )}

                {user.provider === 'local' ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 pr-12 text-sm focus:border-primary outline-none"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                          tabIndex={-1}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showCurrentPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 pr-12 text-sm focus:border-primary outline-none"
                          placeholder="Minimum 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                          tabIndex={-1}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 pr-12 text-sm focus:border-primary outline-none"
                          placeholder="Re-enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors cursor-pointer p-1"
                          tabIndex={-1}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                ) : (
                  <div className="flex gap-4 items-center bg-[#eaefff] border border-[#a2baf4]/30 rounded-2xl p-6 text-left max-w-xl">
                    <span className="material-symbols-outlined text-[#3f63c8] text-3xl shrink-0">verified_user</span>
                    <div>
                      <h4 className="text-sm font-bold text-[#1a2d5e] mb-1">Authenticated with Google</h4>
                      <p className="text-xs text-[#3f507b] leading-relaxed">
                        Your account security and login authorization are secured by Google. Password management, multi-factor settings, and lock screens are configured directly in your Google Account dashboard.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Utilities Block */}
              <div className="pt-8 border-t border-outline-variant/20 space-y-4">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Data &amp; Privacy Utilities</h4>
                <div className="p-5 rounded-2xl border border-secondary-container/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary-container/5">
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-primary">Export Travel Profile Data</h5>
                    <p className="text-xs text-secondary leading-relaxed">Download a machine-readable JSON archive of your stays record, points logs, and settings.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="shrink-0 py-3 px-5 border border-outline hover:bg-secondary-container/20 rounded-xl font-bold text-xs text-primary transition-all cursor-pointer"
                  >
                    Export Data Profile
                  </button>
                </div>
              </div>

              {/* Danger Zone Block */}
              <div className="pt-8 border-t border-outline-variant/20 space-y-4">
                <h4 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Danger Zone</h4>
                <div className="p-5 rounded-2xl border border-[#ffdad6]/40 bg-[#ffdad6]/10 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-[#ba1a1a]">Permanently Delete Account</h5>
                      <p className="text-xs text-[#ba1a1a]/80 leading-relaxed">All active reservations will be cancelled, loyalty points will be cleared, and all profile data will be expunged.</p>
                    </div>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="shrink-0 py-3.5 px-6 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Delete Account
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                          setDeleteError('');
                        }}
                        className="shrink-0 py-3 px-5 border border-outline hover:bg-secondary-container/20 rounded-xl font-bold text-xs text-primary transition-all cursor-pointer"
                      >
                        Cancel Deletion
                      </button>
                    )}
                  </div>

                  {showDeleteConfirm && (
                    <div className="bg-white border border-[#ffdad6] rounded-xl p-5 space-y-4 mt-2">
                      <div className="text-xs text-primary leading-relaxed font-medium">
                        This action cannot be undone. To proceed, please type <span className="font-bold text-[#ba1a1a]">DELETE PERMANENTLY</span> in the field below and confirm.
                      </div>
                      {deleteError && (
                        <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold">
                          {deleteError}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="Type 'DELETE PERMANENTLY'"
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 text-xs outline-none focus:border-[#ba1a1a]"
                        />
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="py-3 px-6 bg-[#ba1a1a] text-white font-bold text-xs rounded-xl hover:bg-[#93000a] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {deleteLoading ? 'Deleting...' : 'Confirm Account Deletion'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Settings;
