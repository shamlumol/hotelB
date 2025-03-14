import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
  const { API_URL, user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'bookings' | 'account'
  const [readIds, setReadIds] = useState([]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/bookings/me`);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings for notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
      // Load read notifications from localStorage
      const savedReadIds = JSON.parse(localStorage.getItem('hotelb_read_notifications') || '[]');
      setReadIds(savedReadIds);
    }
  }, [user, API_URL]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Compile dynamic updates list exactly like UserDashboard.jsx + notification specific ones
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const notifications = [];

  if (user) {
    notifications.push({
      id: 'membership',
      category: 'account',
      title: user.loyaltyTier && user.loyaltyTier !== 'None' ? 'Membership Milestone' : 'Membership Welcome',
      desc: user.loyaltyTier && user.loyaltyTier !== 'None'
        ? `Congratulations! You have active status as a ${user.loyaltyTier} Tier member. Enjoy your tier perks.`
        : `Welcome to HotelB! Earn points on your reservations to qualify for elite loyalty tiers and unlock premium perks.`,
      time: 'Active Now',
      icon: 'military_tech',
      color: 'text-tertiary bg-tertiary-fixed/20 border-tertiary-fixed/30'
    });
  }

  bookings.forEach((booking) => {
    const stayTitle = booking.stay?.title || 'Sanctuary stay';
    if (booking.status === 'Cancelled') {
      notifications.push({
        id: `cancel-${booking._id}`,
        category: 'bookings',
        title: 'Reservation Cancelled',
        desc: `Your reservation at ${stayTitle} was cancelled. Refund initialized to original card.`,
        time: new Date(booking.createdAt).toLocaleDateString(),
        icon: 'cancel',
        color: 'text-error bg-error-container/10 border-error-container/20'
      });
    } else {
      notifications.push({
        id: `confirm-${booking._id}`,
        category: 'bookings',
        title: 'Booking Confirmed',
        desc: `Stay at ${stayTitle} confirmed for ${formatDate(booking.checkIn)}. Ref: #${booking.bookingNumber}`,
        time: new Date(booking.createdAt).toLocaleDateString(),
        icon: 'check_circle',
        color: 'text-primary bg-primary/10 border-primary/20'
      });

      // Check-in proximity
      const checkInDate = new Date(booking.checkIn);
      const daysTo = Math.ceil((checkInDate - todayStart) / (1000 * 60 * 60 * 24));
      if (daysTo >= 0 && daysTo <= 5) {
        notifications.push({
          id: `checkin-${booking._id}`,
          category: 'bookings',
          title: 'Arrival Details Sent',
          desc: `Arrival boat transfer coordinates for ${stayTitle} are prepared and mailed. Check your inbox.`,
          time: 'Action Required',
          icon: 'directions_boat',
          color: 'text-error bg-error-container/10 border-error-container/20'
        });
      }
    }
  });

  // Filter notifications list
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  // Unread count
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAsRead = (id) => {
    if (readIds.includes(id)) return;
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('hotelb_read_notifications', JSON.stringify(newReadIds));
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('hotelb_read_notifications', JSON.stringify(allIds));
  };

  const handleClearRead = () => {
    setReadIds([]);
    localStorage.removeItem('hotelb_read_notifications');
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
      {/* Header section */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
            Updates &amp; Alerts
          </span>
          <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
            Your<br />
            <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Notifications
            </span>
          </h1>
          <p className="font-body text-sm md:text-base text-secondary max-w-2xl leading-relaxed">
            Stay updated with your reservation statuses, arrivals details, and loyalty tier milestone notifications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="self-start md:self-end py-3 px-5 border border-outline hover:bg-secondary-container/20 rounded-xl font-bold text-xs text-primary transition-all cursor-pointer whitespace-nowrap"
          >
            Mark All as Read
          </button>
        )}
      </section>

      {/* Category filters */}
      <div className="flex border-b border-outline-variant/30 mb-8 gap-6 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeFilter === 'all' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('bookings')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeFilter === 'bookings' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Bookings ({notifications.filter(n => n.category === 'bookings').length})
        </button>
        <button
          onClick={() => setActiveFilter('account')}
          className={`pb-3.5 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeFilter === 'account' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Membership &amp; Account ({notifications.filter(n => n.category === 'account').length})
        </button>
      </div>

      {/* Notifications Grid list */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-secondary-container/30 shadow-soft">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">
            notifications_off
          </span>
          <h3 className="font-headline text-xl text-primary font-medium mb-1">
            No updates found
          </h3>
          <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
            You don't have any notifications under this filter at the moment. Keep an eye here for booking alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {filteredNotifications.map((noti) => {
            const isRead = readIds.includes(noti.id);
            return (
              <div 
                key={noti.id} 
                onClick={() => handleMarkAsRead(noti.id)}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative group cursor-pointer ${
                  isRead 
                    ? 'bg-white border-secondary-container/40 hover:border-primary/40 shadow-soft' 
                    : 'bg-primary/5 border-primary/20 ring-1 ring-primary/10 shadow-md'
                }`}
              >
                {/* Unread indicator dot */}
                {!isRead && (
                  <span className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full" title="Unread Alert"></span>
                )}

                {/* Notification Icon */}
                <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${noti.color}`}>
                  <span className="material-symbols-outlined text-xl">{noti.icon}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline font-bold text-sm text-primary leading-tight">{noti.title}</h3>
                    <span className="text-[10px] text-outline font-bold uppercase tracking-wider whitespace-nowrap">
                      • {noti.time}
                    </span>
                  </div>
                  <p className="font-body text-xs text-secondary leading-relaxed">{noti.desc}</p>
                </div>
              </div>
            );
          })}

          {readIds.length > 0 && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleClearRead}
                className="text-[11px] font-bold text-outline hover:text-primary transition-colors cursor-pointer"
              >
                Reset Read Notifications List
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Notifications;
