import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { t } = useTranslation();

  // Detect scroll for glass effect intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const menuItems = [
    ...(user && user.role === 'admin' ? [{ label: t('admin_dashboard'), icon: 'admin_panel_settings', path: '/admin' }] : []),
    { label: t('my_profile'), icon: 'person', path: '/dashboard' },
    { label: t('my_bookings'), icon: 'calendar_month', path: '/my-bookings' },
    { label: t('wishlist'), icon: 'favorite', path: '/wishlist' },
    { label: t('notifications'), icon: 'notifications', path: '/notifications' },
    { label: t('settings'), icon: 'settings', path: '/settings' },
    { label: t('help_support'), icon: 'help', path: '/help-support' },
  ];

  const navLinks = [
    { label: t('destinations'), path: '/destinations' },
    { label: t('stays'), path: '/stays' },
    { label: t('about_us'), path: '/experiences' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 dark:bg-[#0d1117]/80 backdrop-blur-xl shadow-lg border-b border-white/20'
          : 'bg-white/50 dark:bg-[#0d1117]/60 backdrop-blur-md border-b border-white/10'
      }`}
      style={{
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Animated gradient top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
        style={{
          background: 'linear-gradient(90deg, #004630, #1f8c5e, #95d4b5, #1f8c5e, #004630)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 4s linear infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(135deg, #004630, #1f8c5e, #95d4b5);
          border-radius: 2px;
        }
        .dropdown-enter {
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mobile-menu-enter {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="flex justify-between items-center px-5 md:px-16 py-3.5 w-full max-w-[1280px] mx-auto">

        {/* Logo */}
        <Link
          to="/"
          className="font-headline text-2xl md:text-3xl font-semibold tracking-tight hover:opacity-85 transition-all duration-300 shrink-0"
        >
          <span className="relative">
            <span className="text-primary">Hotel</span><span
              style={{
                background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >B</span>
            <span
              className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-primary/30 rounded-full"
              style={{ transform: 'scaleX(0)', transition: 'transform 0.3s ease' }}
            />
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`relative text-sm font-semibold transition-all duration-200 pb-1 group ${
                isActive(link.path)
                  ? 'text-primary nav-link-active'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
              <span 
                className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-transform duration-300 origin-left ${
                  isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
                style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)' }}
              />
            </Link>
          ))}
        </div>

        {/* Right section: CTA + User */}
        <div className="flex items-center gap-3">
          {/* Book Now Button */}
          <Link
            to="/stays"
            className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hotel
            </span>
            Book Now
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center focus:outline-none hover:ring-2 hover:ring-primary/30 transition-all duration-300 overflow-hidden cursor-pointer"
                aria-label="User menu"
              >
                {user.photoURL ? (
                  <img className="w-full h-full object-cover" src={user.photoURL} alt="avatar" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase border border-primary/20 rounded-full">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="dropdown-enter absolute right-0 mt-3 w-72 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,70,48,0.06)',
                  }}
                >
                  {/* Header */}
                  <div className="px-5 py-4 flex items-center gap-3 border-b border-black/5">
                    {user.photoURL ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        <img className="w-full h-full object-cover" src={user.photoURL} alt={user.name} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase border-2 border-primary/20 shrink-0">
                        {user.name ? user.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate">{user.name}</p>
                      <p className="text-[11px] text-on-surface-variant/80 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 space-y-0.5 px-2">
                    {menuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(item.path);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200 text-left flex items-center gap-3 text-xs font-semibold text-on-surface-variant group cursor-pointer"
                        style={{ '--tw-bg-opacity': 0.08 }}
                      >
                        <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-black/5 px-2 py-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-error/8 hover:text-error transition-all duration-200 text-left flex items-center gap-3 text-xs font-semibold text-error/85 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-error/70 group-hover:text-error transition-colors">
                        logout
                      </span>
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-on-surface-variant hover:text-primary font-semibold transition-all text-sm hidden md:block"
              >
                {t('login')}
              </Link>
              <Link
                to="/stays"
                className="md:hidden bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm"
              >
                Book
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-on-surface rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-on-surface rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-on-surface rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="mobile-menu-enter md:hidden border-t border-white/20 px-5 py-4 space-y-2"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="block py-3 px-4 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-black/5">
            <Link
              to="/stays"
              className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-sm mt-2"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              Book Now
            </Link>
          </div>
          {!user && (
            <Link
              to="/login"
              className="block text-center py-3 px-4 rounded-xl text-sm font-semibold text-primary border border-primary/20 hover:bg-primary/5 transition-all"
            >
              {t('login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
