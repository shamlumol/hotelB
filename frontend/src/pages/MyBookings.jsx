import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyBookings = () => {
  const { API_URL, user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'active' | 'upcoming' | 'past'

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/bookings/me`);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, API_URL]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await axios.put(`${API_URL}/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        alert('Reservation cancelled successfully.');
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonthYear = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const activeStays = bookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return startDay <= todayStart && endDay >= todayStart;
  });

  const upcomingStays = bookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    const start = new Date(b.checkIn);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return startDay >= todayStart;
  });

  const pastStays = bookings.filter(b => {
    const end = new Date(b.checkOut);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return endDay < todayStart || b.status === 'Cancelled';
  });

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'active':
        return activeStays;
      case 'upcoming':
        return upcomingStays;
      case 'past':
        return pastStays;
      default:
        return upcomingStays;
    }
  };

  const currentList = getFilteredBookings();

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-left bg-background min-h-screen relative">
      {/* Header section */}
      <section className="mb-12">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
          Your Luxury Stays
        </span>
        <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
          My<br />
          <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Reservations
          </span>
        </h1>
        <p className="font-body text-sm md:text-base text-secondary max-w-2xl leading-relaxed">
          Manage your bookings, access travel support, and review your past memories in our sanctuary properties.
        </p>
      </section>

      {/* Tabs Menu */}
      <div className="flex border-b border-outline-variant/30 mb-8 gap-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'upcoming' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Upcoming ({upcomingStays.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'active' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Checked In ({activeStays.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'past' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Past &amp; Cancelled ({pastStays.length})
        </button>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-secondary-container/30 shadow-soft">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">
            {activeTab === 'upcoming' ? 'calendar_today' : activeTab === 'active' ? 'directions_boat' : 'history'}
          </span>
          <h3 className="font-headline text-xl text-primary font-medium mb-1">
            {activeTab === 'upcoming' 
              ? 'No upcoming stays scheduled' 
              : activeTab === 'active' 
                ? 'You are not checked in anywhere' 
                : 'No past stays found'}
          </h3>
          <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
            {activeTab === 'upcoming' 
              ? 'Ready for your next getaway? Explore our catalog of luxury backwater retreats and highlands mansions.'
              : activeTab === 'active'
                ? 'Your checked-in reservations will appear here during your stay dates.'
                : 'Stays you have completed or cancelled in the past will show up in this history tab.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link to="/stays" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-container shadow-md transition-colors inline-block cursor-pointer">
              Explore Stays
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {currentList.map((booking) => (
            <div 
              key={booking._id} 
              className="bg-white rounded-2xl overflow-hidden border border-secondary-container/40 flex flex-col shadow-soft hover:shadow-lg transition-all duration-300 relative group"
            >
              {/* Card Image header */}
              <div className="h-52 relative overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                  src={booking.stay?.image || 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=400'} 
                  alt={booking.stay?.title} 
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider ${
                    booking.status === 'Cancelled' 
                      ? 'bg-error-container text-on-error-container' 
                      : activeTab === 'active'
                        ? 'bg-primary text-on-primary'
                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                  }`}>
                    {booking.status === 'Cancelled' ? 'Cancelled' : activeTab === 'active' ? 'Checked In' : 'Confirmed'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-headline text-xl md:text-2xl text-primary font-semibold mb-2 line-clamp-1">{booking.stay?.title}</h3>
                  <p className="text-xs text-secondary font-medium mb-4 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {booking.stay?.location}
                  </p>

                  <div className="space-y-2 border-y border-outline-variant/20 py-4 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary font-semibold">Stay Dates</span>
                      <span className="text-primary font-bold">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary font-semibold">Room Assigned</span>
                      <span className="text-primary font-bold truncate max-w-[150px]">{booking.roomTitle}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary font-semibold">Reference Code</span>
                      <span className="text-primary font-bold">#{booking.bookingNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary font-semibold">Total Amount</span>
                      <span className="text-primary font-bold">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  {booking.status === 'Confirmed' && activeTab === 'upcoming' && (
                    <>
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex-grow py-3 border border-outline/70 hover:bg-error-container hover:text-on-error-container hover:border-transparent rounded-xl font-bold text-xs text-primary transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Cancel Reservation
                      </button>
                      <button 
                        onClick={() => alert(`Directions: Free airport boat transfer coordinates sent to ${booking.guestDetails?.email || 'registered email'}. Head to ${booking.stay?.location}.`)}
                        className="px-4 py-3 border border-outline rounded-xl text-primary hover:bg-secondary-container/20 transition-all cursor-pointer"
                        title="Get Directions"
                      >
                        <span className="material-symbols-outlined text-lg">directions</span>
                      </button>
                    </>
                  )}
                  {activeTab === 'active' && (
                    <>
                      <button 
                        onClick={() => alert(`Your keycard is activated. Enjoy your stay in room: ${booking.roomTitle}.`)}
                        className="flex-grow py-3 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-md hover:bg-primary-container transition-colors cursor-pointer"
                      >
                        View Digital Keycard
                      </button>
                      <button 
                        onClick={() => alert(`Connecting directly to ${booking.stay?.title} front desk...`)}
                        className="px-4 py-3 border border-outline rounded-xl text-primary hover:bg-secondary-container/20 transition-all cursor-pointer"
                        title="Call Concierge"
                      >
                        <span className="material-symbols-outlined text-lg">call</span>
                      </button>
                    </>
                  )}
                  {booking.status === 'Cancelled' && (
                    <Link 
                      to={`/stays/${booking.stay?._id || ''}`} 
                      className="w-full py-3 bg-secondary-container text-primary font-bold text-center text-xs rounded-xl hover:bg-secondary-fixed transition-colors block cursor-pointer"
                    >
                      Rebook Sanctuary Stay
                    </Link>
                  )}
                  {activeTab === 'past' && booking.status !== 'Cancelled' && (
                    <Link 
                      to={`/stays/${booking.stay?._id || ''}`} 
                      className="w-full py-3 bg-secondary-container text-primary font-bold text-center text-xs rounded-xl hover:bg-secondary-fixed transition-colors block cursor-pointer"
                    >
                      Book Again
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyBookings;
