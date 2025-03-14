import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const VIEWS = { ANALYTICS: 'analytics', BOOKINGS: 'bookings', SETTINGS: 'settings' };

const AdminDashboard = () => {
  const { API_URL, user, loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState(VIEWS.ANALYTICS);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter/search state for Bookings view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/bookings`);
        if (res.data.success) setBookings(res.data.data);
      } catch (err) {
        console.error('Error fetching admin bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBookings();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, [user, authLoading, API_URL, navigate]);

  // Derived stats from real data
  const totalRevenue = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;
  const uniqueGuests = new Set(bookings.map(b => b.user?._id)).size;

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      b.guestDetails?.name?.toLowerCase().includes(q) ||
      b.stay?.title?.toLowerCase().includes(q) ||
      b.bookingNumber?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { id: VIEWS.ANALYTICS, label: 'Analytics', icon: 'analytics' },
    { id: VIEWS.BOOKINGS, label: 'Bookings', icon: 'calendar_month' },
    { id: VIEWS.SETTINGS, label: 'Settings', icon: 'settings' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  /* ─── Sidebar ─── */
  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} bg-white border-r border-outline-variant/30 flex flex-col`}>
      <div className="px-6 py-7 border-b border-outline-variant/20">
        <h1 className="font-headline text-2xl font-bold text-primary">HotelB</h1>
        <p className="text-[10px] text-on-surface-variant/60 mt-0.5 uppercase tracking-widest font-semibold">Admin Panel</p>
      </div>

      <nav className="flex-grow px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => { setActiveView(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeView === id
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-6 border-t border-outline-variant/20 pt-4 space-y-1">
        <button
          onClick={() => navigate('/stays')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-variant transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">hotel</span>
          View Hotels
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error/8 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );

  /* ─── Analytics View ─── */
  const AnalyticsView = () => (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: 'payments', sub: `${bookings.length} bookings` },
          { label: 'Confirmed', value: confirmedCount, icon: 'check_circle', sub: 'Active reservations' },
          { label: 'Cancelled', value: cancelledCount, icon: 'cancel', sub: 'Cancelled bookings' },
          { label: 'Unique Guests', value: uniqueGuests, icon: 'group', sub: 'Registered guests' },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
              </div>
            </div>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <p className="font-headline text-2xl font-semibold text-on-surface">{value}</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart (SVG) */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">Revenue Trend</h3>
        <p className="text-xs text-on-surface-variant/60 mb-6">Visual representation of booking revenue flow</p>
        <div className="relative h-48 w-full">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
            <defs>
              <linearGradient id="rg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#004630" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#004630" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,180 C100,160 200,170 300,150 S500,130 600,145 S800,95 1000,115 L1000,200 L0,200 Z" fill="url(#rg)" />
            <path d="M0,180 C100,160 200,170 300,150 S500,130 600,145 S800,95 1000,115" fill="none" stroke="#004630" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-2 text-[10px] text-on-surface-variant/50 font-semibold">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* Recent Bookings preview */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-headline text-lg font-semibold text-on-surface">Recent Bookings</h3>
          <button
            onClick={() => setActiveView(VIEWS.BOOKINGS)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/30">
              <tr>
                {['Guest', 'Hotel', 'Check-in', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary inline-block" /></td></tr>
              ) : bookings.slice(0, 5).map(b => (
                <tr key={b._id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                        {b.guestDetails?.name?.substring(0,2) || 'GU'}
                      </div>
                      <span className="font-semibold text-on-surface text-xs">{b.guestDetails?.name || b.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-on-surface-variant font-medium">{b.stay?.title?.substring(0,20)}{b.stay?.title?.length > 20 ? '…' : ''}</td>
                  <td className="px-5 py-3.5 text-xs text-on-surface-variant">{formatDate(b.checkIn)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.status === 'Confirmed' ? 'bg-primary/10 text-primary' : b.status === 'Cancelled' ? 'bg-error/10 text-error' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-on-surface">{formatCurrency(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ─── Bookings View ─── */
  const BookingsView = () => (
    <div>
      {/* Filters */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by guest, hotel or booking #..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-variant/30 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-surface-variant/30 rounded-xl border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
        >
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="text-xs text-on-surface-variant self-center font-semibold whitespace-nowrap">
          {filteredBookings.length} result{filteredBookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/30">
              <tr>
                {['#', 'Guest', 'Hotel / Room', 'Check-in', 'Check-out', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12"><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary inline-block" /></td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">search_off</span>
                    No bookings found.
                  </td>
                </tr>
              ) : filteredBookings.map((b, idx) => (
                <tr key={b._id} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-5 py-4 text-[10px] font-mono text-on-surface-variant">{b.bookingNumber || `#${idx + 1}`}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {(b.guestDetails?.name || b.user?.name || 'G').substring(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-xs">{b.guestDetails?.name || b.user?.name}</p>
                        <p className="text-[10px] text-on-surface-variant/60">{b.guestDetails?.email || b.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-xs text-on-surface">{b.stay?.title?.substring(0,22)}{(b.stay?.title?.length||0) > 22 ? '…' : ''}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{b.roomTitle}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant">{formatDate(b.checkIn)}</td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant">{formatDate(b.checkOut)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      b.status === 'Confirmed' ? 'bg-primary/10 text-primary'
                      : b.status === 'Cancelled' ? 'bg-error/10 text-error'
                      : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-on-surface text-xs">{formatCurrency(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ─── Settings View ─── */
  const SettingsView = () => (
    <div className="max-w-2xl space-y-6">
      {/* Admin Profile */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-5">Admin Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl uppercase border-2 border-primary/20">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-bold text-on-surface">{user?.name}</p>
            <p className="text-sm text-on-surface-variant">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-[12px]">admin_panel_settings</span>
              Administrator
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-surface-variant/30 rounded-xl p-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="font-headline text-2xl font-semibold text-on-surface">{bookings.length}</p>
          </div>
          <div className="bg-surface-variant/30 rounded-xl p-4">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="font-headline text-2xl font-semibold text-on-surface">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">Quick Links</h3>
        <div className="space-y-2">
          {[
            { label: 'View All Stays', icon: 'hotel', action: () => navigate('/stays') },
            { label: 'Go to Home', icon: 'home', action: () => navigate('/') },
            { label: 'User Dashboard', icon: 'dashboard', action: () => navigate('/dashboard') },
          ].map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-surface-variant/40 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                <span className="font-semibold text-sm text-on-surface">{label}</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors">chevron_right</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-error/20 rounded-2xl p-6 shadow-sm">
        <h3 className="font-headline text-lg font-semibold text-error mb-4">Session</h3>
        <p className="text-sm text-on-surface-variant mb-4">You are currently signed in as Administrator. Signing out will clear your session.</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-error text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-error/90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );

  /* ─── Page titles ─── */
  const viewTitle = {
    [VIEWS.ANALYTICS]: 'Overview & Analytics',
    [VIEWS.BOOKINGS]: 'All Bookings',
    [VIEWS.SETTINGS]: 'Settings',
  };

  return (
    <div className="flex min-h-screen bg-background text-left">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-64 h-full bg-white shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-outline-variant/30 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="font-headline text-lg font-semibold text-on-surface">{viewTitle[activeView]}</h2>
              <p className="text-[11px] text-on-surface-variant hidden sm:block">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                {user?.name?.charAt(0)}
              </div>
              <span className="font-semibold text-on-surface text-xs">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          {activeView === VIEWS.ANALYTICS && <AnalyticsView />}
          {activeView === VIEWS.BOOKINGS && <BookingsView />}
          {activeView === VIEWS.SETTINGS && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
