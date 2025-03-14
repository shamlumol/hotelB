import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { API_URL, user, fetchUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Redemption state
  const [redeemReward, setRedeemReward] = useState(null);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  const rewards = [
    { id: 'spa', name: 'Ayurvedic Rejuvenation Spa Session', cost: 3000, desc: 'A 90-minute full body massage using traditional herbal oils.' },
    { id: 'dinner', name: 'Private Chef Spice Masterclass & Dinner', cost: 6000, desc: 'A bespoke four-course private dining experience on the water.' },
    { id: 'night', name: 'Complimentary Suite Night Stay', cost: 12000, desc: 'One free night stay in any available Grand Horizon Suite.' }
  ];

  const fetchBookingsAndWishlist = async () => {
    try {
      setLoading(true);
      // Fetch user's bookings
      const bookingsRes = await axios.get(`${API_URL}/bookings/me`);
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }

      // Fetch stays for wishlist
      const staysRes = await axios.get(`${API_URL}/stays`);
      if (staysRes.data.success) {
        const list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
        const ids = list.map(item => (typeof item === 'string' ? item : item.id));
        const favorited = staysRes.data.data.filter(s => ids.includes(s._id));
        setWishlist(favorited);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookingsAndWishlist();
    }
  }, [user, API_URL]);

  // Sync wishlist across component updates
  useEffect(() => {
    const handleWishlistUpdate = async () => {
      try {
        const list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
        const ids = list.map(item => (typeof item === 'string' ? item : item.id));
        const res = await axios.get(`${API_URL}/stays`);
        if (res.data.success) {
          const favorited = res.data.data.filter(s => ids.includes(s._id));
          setWishlist(favorited);
        }
      } catch (err) {
        console.error('Error updating wishlist state:', err);
      }
    };
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [API_URL]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await axios.put(`${API_URL}/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        alert('Reservation cancelled successfully.');
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
        fetchUserProfile(); // refresh points if points were changed
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const handleRemoveWishlist = (stayId) => {
    try {
      let list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
      list = list.filter(item => (typeof item === 'string' ? item !== stayId : item.id !== stayId));
      localStorage.setItem('hotelb_wishlist', JSON.stringify(list));
      setWishlist(wishlist.filter(s => s._id !== stayId));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const openProfileModal = () => {
    setProfileName(user?.name || '');
    setProfileEmail(user?.email || '');
    setProfileError('');
    setProfileSuccess('');
    setShowProfileModal(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, { name: profileName, email: profileEmail });
      if (res.data.success) {
        setProfileSuccess('Profile updated successfully.');
        await fetchUserProfile();
        setTimeout(() => setShowProfileModal(false), 1200);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const openRedeemModal = () => {
    setRedeemReward(null);
    setRedeemError('');
    setRedeemSuccess('');
    setShowRedeemModal(true);
  };

  const handleRedeemSubmit = async () => {
    if (!redeemReward) {
      setRedeemError('Please select a reward.');
      return;
    }
    if ((user?.loyaltyPoints || 0) < redeemReward.cost) {
      setRedeemError('Insufficient loyalty points.');
      return;
    }
    setRedeemError('');
    setRedeemSuccess('');
    setRedeemLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/redeem`, {
        points: redeemReward.cost,
        description: redeemReward.name
      });
      if (res.data.success) {
        setRedeemSuccess(`Successfully redeemed ${redeemReward.cost} points!`);
        await fetchUserProfile();
        setTimeout(() => setShowRedeemModal(false), 1500);
      }
    } catch (err) {
      setRedeemError(err.response?.data?.message || 'Error redeeming points');
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthYear = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Date classification logic
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const activeBookings = bookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    const start = new Date(b.checkIn);
    const end = new Date(b.checkOut);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return startDay <= todayStart && endDay >= todayStart;
  });

  const upcomingBookings = bookings.filter(b => {
    if (b.status !== 'Confirmed') return false;
    const start = new Date(b.checkIn);
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return startDay >= todayStart;
  });

  const pastBookings = bookings.filter(b => {
    const end = new Date(b.checkOut);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return endDay < todayStart || b.status === 'Cancelled';
  });

  // Dynamic notifications list
  const dynamicUpdates = [];
  if (user) {
    dynamicUpdates.push({
      id: 'membership',
      title: user.loyaltyTier && user.loyaltyTier !== 'None' ? 'Membership Milestone' : 'Membership Welcome',
      desc: user.loyaltyTier && user.loyaltyTier !== 'None'
        ? `Congratulations! You have active status as a ${user.loyaltyTier} Tier member. Enjoy your tier perks.`
        : `Welcome to HotelB! Earn points on your reservations to qualify for elite loyalty tiers and unlock premium perks.`,
      time: 'Active Now',
      icon: 'military_tech',
      color: 'text-tertiary'
    });
  }

  bookings.forEach((booking) => {
    const stayTitle = booking.stay?.title || 'Sanctuary stay';
    if (booking.status === 'Cancelled') {
      dynamicUpdates.push({
        id: `cancel-${booking._id}`,
        title: 'Reservation Cancelled',
        desc: `Your reservation at ${stayTitle} was cancelled. Refund initialized to original card.`,
        time: new Date(booking.createdAt).toLocaleDateString(),
        icon: 'cancel',
        color: 'text-error'
      });
    } else {
      dynamicUpdates.push({
        id: `confirm-${booking._id}`,
        title: 'Booking Confirmed',
        desc: `Stay at ${stayTitle} confirmed for ${formatDate(booking.checkIn)}. Ref: #${booking.bookingNumber}`,
        time: new Date(booking.createdAt).toLocaleDateString(),
        icon: 'check_circle',
        color: 'text-[#1f5e46]'
      });

      // Check-in proximity
      const checkInDate = new Date(booking.checkIn);
      const daysTo = Math.ceil((checkInDate - todayStart) / (1000 * 60 * 60 * 24));
      if (daysTo >= 0 && daysTo <= 5) {
        dynamicUpdates.push({
          id: `checkin-${booking._id}`,
          title: 'Arrival Details Sent',
          desc: `Arrival boat transfer coordinates for ${stayTitle} are prepared and mailed.`,
          time: 'Action Required',
          icon: 'directions_boat',
          color: 'text-[#ba1a1a]'
        });
      }
    }
  });

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-left bg-background min-h-screen relative">
      {/* Welcome Header */}
      <section className="mb-16 relative overflow-hidden rounded-2xl p-8 md:p-12 bg-secondary-container/20 border border-secondary-container/40 shadow-soft">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
            Welcome Back, {user?.name || 'Guest'}
          </span>
          <h1 className="font-headline text-4xl md:text-6xl text-primary mb-4 font-semibold leading-tight">
            Your Sanctuary<br />
            <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Awaits
            </span>
          </h1>
          <p className="font-body text-body-lg text-secondary text-sm md:text-base leading-relaxed">
            Re-engage with the tranquil rhythms of Kerala. Here, your luxury reservations and loyalty benefits are synced in real time.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Stays and Wishlist */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Active Stays Section */}
          {activeBookings.length > 0 && (
            <section className="bg-gradient-to-br from-[#1f5e46]/10 via-transparent to-transparent p-6 rounded-2xl border border-[#1f5e46]/30 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                  </span>
                  <h2 className="font-headline text-2xl text-primary font-medium">Currently Checked In</h2>
                </div>
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Active Stay
                </span>
              </div>
              <div className="space-y-6">
                {activeBookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-xl overflow-hidden border border-secondary-container/40 flex flex-col md:flex-row shadow-sm">
                    <div className="md:w-5/12 h-56 md:h-auto relative">
                      <img className="w-full h-full object-cover" src={booking.stay?.image || 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=400'} alt={booking.stay?.title} />
                      <div className="absolute top-4 left-4 bg-primary text-on-primary px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                        Checked In
                      </div>
                    </div>
                    <div className="md:w-7/12 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline text-2xl text-primary font-semibold mb-2">{booking.stay?.title}</h3>
                        <div className="flex flex-wrap gap-4 text-secondary mb-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span>{booking.stay?.location}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-secondary-container/10 p-3 rounded-lg border border-secondary-container/20">
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary">Reference Code</p>
                            <p className="text-xs font-bold text-primary">#{booking.bookingNumber}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary">Suite Assigned</p>
                            <p className="text-xs font-bold text-primary truncate">{booking.roomTitle}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                        <button 
                          onClick={() => alert(`Your keycard is activated. Enjoy your stay in room: ${booking.roomTitle}.`)}
                          className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-md hover:bg-primary-container transition-colors"
                        >
                          View Digital Keycard
                        </button>
                        <button 
                          onClick={() => alert(`Concierge: Contacting resort at ${booking.stay?.location} directly...`)}
                          className="px-4 py-3 border border-outline rounded-xl text-primary hover:bg-secondary-container/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">call</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Bookings */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl text-primary font-medium">Upcoming Retreats</h2>
              <span className="text-xs text-secondary bg-secondary-container/30 px-3 py-1 rounded-full font-bold">
                {upcomingBookings.length} Active
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary inline-block"></span>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-secondary-container/30 shadow-soft">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">calendar_today</span>
                <h3 className="font-headline text-xl text-primary font-medium mb-1">No upcoming stays scheduled</h3>
                <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">Explore our catalog of eco-luxury backwater resorts and highlands mansions.</p>
                <Link to="/stays" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-container shadow-md transition-colors inline-block">
                  Explore Stays
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingBookings.map((booking) => (
                  <div 
                    key={booking._id}
                    className="group bg-white rounded-2xl overflow-hidden border border-secondary-container/40 flex flex-col md:flex-row h-auto md:h-64 shadow-soft hover:shadow-lg transition-shadow duration-500"
                  >
                    <div className="md:w-5/12 relative h-56 md:h-full overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" src={booking.stay?.image || 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=400'} alt={booking.stay?.title} />
                      <div className="absolute top-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                        Confirmed
                      </div>
                    </div>
                    <div className="md:w-7/12 p-6 flex flex-col justify-between bg-surface-container-lowest">
                      <div>
                        <h3 className="font-headline text-2xl text-primary font-semibold mb-2">{booking.stay?.title}</h3>
                        <div className="flex flex-wrap gap-4 text-secondary mb-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span>{booking.stay?.location}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-secondary-container/10 p-2.5 rounded-lg border border-secondary-container/20">
                            <p className="text-[9px] uppercase font-bold text-secondary">Confirmation</p>
                            <p className="text-xs font-bold text-primary">#{booking.bookingNumber}</p>
                          </div>
                          <div className="bg-secondary-container/10 p-2.5 rounded-lg border border-secondary-container/20">
                            <p className="text-[9px] uppercase font-bold text-secondary">Room Booked</p>
                            <p className="text-xs font-bold text-primary truncate">{booking.roomTitle}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex-grow py-3 border border-outline/70 hover:bg-error-container hover:text-on-error-container hover:border-transparent rounded-xl font-bold text-xs text-primary transition-all active:scale-[0.98]"
                        >
                          Cancel Reservation
                        </button>
                        <button 
                          onClick={() => alert(`Directions: Head to ${booking.stay?.location}. Free airport pickup details sent to your registered email.`)}
                          className="px-4 py-3 border border-outline rounded-xl text-primary hover:bg-secondary-container/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">directions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Stays / Memories */}
          <section>
            <h2 className="font-headline text-2xl text-primary font-medium mb-8">Past Memories</h2>
            {pastBookings.length === 0 ? (
              <div className="py-8 text-center text-sm text-secondary bg-white rounded-xl border border-secondary-container/30">
                No past stays in this account. Go make some memories!
              </div>
            ) : (
              <div className="flex gap-gutter overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4">
                {pastBookings.map((booking, idx) => (
                  <div key={idx} className="min-w-[280px] md:min-w-[320px] bg-white rounded-xl overflow-hidden shadow-soft border border-outline-variant/30 flex-shrink-0">
                    <div className="h-44 relative">
                      <img className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-500" src={booking.stay?.image || 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=400'} alt={booking.stay?.title} />
                      <div className={`absolute bottom-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold ${booking.status === 'Cancelled' ? 'bg-[#ba1a1a]/95 text-white' : 'bg-white/90 text-primary'}`}>
                        {booking.status === 'Cancelled' ? 'Cancelled' : formatMonthYear(booking.checkIn)}
                      </div>
                    </div>
                    <div className="p-5 border-x border-b border-secondary-container/20">
                      <h4 className="font-headline text-lg text-primary mb-1 font-semibold truncate">{booking.stay?.title || 'Sanctuary Stay'}</h4>
                      <p className="text-xs text-secondary mb-4 font-medium">{booking.stay?.location}</p>
                      <button 
                        onClick={() => navigate(booking.stay?._id ? `/stays/${booking.stay._id}` : '/stays')}
                        className="w-full py-2.5 bg-secondary-container text-primary font-bold text-xs rounded-lg hover:bg-secondary-fixed transition-colors"
                      >
                        {booking.status === 'Cancelled' ? 'Rebook Sanctuary' : 'Book Again'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Stays Wishlist */}
          <section>
            <h2 className="font-headline text-2xl text-primary font-medium mb-8">Curated Wishlist</h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-secondary-container/30 shadow-soft">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">favorite_border</span>
                <p className="text-sm text-secondary mb-4">Your wishlist is empty.</p>
                <Link to="/stays" className="text-primary font-bold text-xs hover:underline">
                  Browse stays to save your favorites
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {wishlist.map((stay) => (
                  <div key={stay._id} className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden border border-secondary-container/30 shadow-soft hover:shadow-lg transition-all duration-500">
                    <div className="aspect-[4/3] overflow-hidden relative cursor-pointer" onClick={() => navigate(`/stays/${stay._id}`)}>
                      <img className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" src={stay.image} alt={stay.title} />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWishlist(stay._id);
                        }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1', color: '#ba1a1a' }}>favorite</span>
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-headline text-lg text-primary font-semibold truncate cursor-pointer" onClick={() => navigate(`/stays/${stay._id}`)}>{stay.title}</h4>
                        <span className="font-headline text-primary font-semibold shrink-0 text-sm">
                          ₹{stay.basePrice.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-secondary">/night</span>
                        </span>
                      </div>
                      <p className="text-xs text-secondary mb-4 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {stay.location}
                      </p>
                      <div className="flex gap-2">
                        {stay.amenities.slice(0, 3).map((amenity, tIdx) => (
                          <span key={tIdx} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">{amenity === 'chef' ? 'restaurant' : amenity}</span>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Account Card, Updates and Rewards */}
        <aside className="lg:col-span-4 space-y-12">
          
          {/* Account Profile Card */}
          <div className="bg-white p-8 rounded-2xl border border-secondary-container/40 shadow-soft text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 rounded-full -mr-12 -mt-12 blur-xl pointer-events-none"></div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-secondary-container/40 shadow-soft flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold uppercase">
                  {user?.photoURL ? (
                    <img 
                      className="w-full h-full object-cover" 
                      src={user.photoURL} 
                      alt="avatar" 
                    />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0) : 'U'}</span>
                  )}
                </div>
              </div>
              <h3 className="font-headline text-2xl text-primary font-semibold">{user?.name || 'Sanctuary Guest'}</h3>
              <p className="text-[11px] text-secondary font-semibold uppercase tracking-wider">Loyal member since 2026</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span> 
                {user?.loyaltyTier && user.loyaltyTier !== 'None' ? user.loyaltyTier : 'Standard'} Member
              </div>
            </div>
            
            <div className="space-y-2 border-t border-secondary-container/40 pt-6 text-left">
              <button 
                onClick={openProfileModal} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary-container/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary">person</span>
                  <span className="text-xs font-bold text-secondary group-hover:text-primary">Personal Details</span>
                </div>
                <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
              </button>
              <button 
                onClick={() => alert('Secure payment profile is integrated with Stripe. Edit operations are disabled for checkout protection.')} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary-container/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary">payments</span>
                  <span className="text-xs font-bold text-secondary group-hover:text-primary">Payment Methods</span>
                </div>
                <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
              </button>
              <button 
                onClick={() => alert('Access credentials are password-encrypted using bcryptjs. Modifying requires standard multi-factor verification.')} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary-container/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary group-hover:text-primary">security</span>
                  <span className="text-xs font-bold text-secondary group-hover:text-primary">Security &amp; Privacy</span>
                </div>
                <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Dynamic Recent Updates / Notifications */}
          <div className="bg-white p-8 rounded-2xl border border-secondary-container/40 shadow-soft text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg text-primary flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined">notifications</span> Recent Updates
              </h3>
              <Link to="/notifications" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <div className="space-y-5">
              {dynamicUpdates.map((update, index) => (
                <div 
                  key={update.id} 
                  onClick={() => navigate('/notifications')}
                  className="flex gap-4 items-start cursor-pointer hover:bg-secondary-container/10 p-2 rounded-xl -mx-2 transition-all group"
                >
                  <div className="mt-1 flex-shrink-0">
                    <span className={`material-symbols-outlined ${update.color || 'text-primary'}`}>{update.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-primary mb-0.5 group-hover:text-primary-container transition-colors">{update.title}</p>
                    <p className="text-[11px] sm:text-xs text-secondary leading-relaxed mb-1">{update.desc}</p>
                    <span className="text-[9px] text-outline font-bold uppercase tracking-wider">{update.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty Reward panel */}
          <div className="bg-primary p-8 rounded-2xl text-on-primary relative overflow-hidden text-left shadow-soft">
            <div className="absolute top-0 right-0 w-36 h-36 bg-on-primary/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <h3 className="font-headline text-lg mb-2 relative z-10 font-medium text-white">Loyalty Rewards</h3>
            <div className="flex items-end gap-1.5 mb-6 relative z-10">
              <span className="text-3xl sm:text-4xl font-bold text-[#ffdea4]">{user?.loyaltyPoints || 0}</span>
              <span className="text-xs opacity-80 pb-1 text-white">Points Balance</span>
            </div>
            
            <div className="w-full bg-white/20 h-1.5 rounded-full mb-3 overflow-hidden relative z-10">
              <div 
                className="bg-[#ffdea4] h-full rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(((user?.loyaltyPoints || 0) / 15000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] opacity-90 mb-6 relative z-10 font-medium text-white/90">
              {user?.loyaltyPoints < 12000 
                ? `${12000 - user.loyaltyPoints} points until your next complimentary free night stay.` 
                : 'You have earned enough points for a free night stay!'}
            </p>
            <button 
              onClick={openRedeemModal}
              className="w-full py-3 bg-[#ffdea4] text-primary font-bold text-xs rounded-xl hover:bg-white hover:text-primary transition-all relative z-10 shadow-sm active:scale-[0.98]"
            >
              Redeem Loyalty Points
            </button>
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          
          <div className="bg-white w-full max-w-md rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-secondary-container/40 relative z-10 animate-fade-in p-8 text-left">
            <h3 className="font-headline text-2xl text-primary font-semibold mb-2">Edit Personal Details</h3>
            <p className="text-xs text-secondary mb-6">Modify your basic contact info. Changes will sync to Mongoose.</p>
            
            {profileError && (
              <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 bg-[#1f5e46]/10 text-primary p-3 rounded-lg text-xs font-semibold">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Full Name</label>
                <input 
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Email Address</label>
                <input 
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 border border-outline rounded-xl font-bold text-xs text-primary hover:bg-secondary-container/20 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {profileLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loyalty Redemption Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRedeemModal(false)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-secondary-container/40 relative z-10 p-8 text-left max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline text-2xl text-primary font-semibold mb-2">Redeem Loyalty Points</h3>
            <p className="text-xs text-secondary mb-6">Convert your points into luxury experiences. Your balance is <span className="font-bold text-primary">{user?.loyaltyPoints || 0} pts</span>.</p>
            
            {redeemError && (
              <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold">
                {redeemError}
              </div>
            )}
            {redeemSuccess && (
              <div className="mb-4 bg-[#1f5e46]/10 text-primary p-3 rounded-lg text-xs font-semibold">
                {redeemSuccess}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {rewards.map((reward) => {
                const canAfford = (user?.loyaltyPoints || 0) >= reward.cost;
                const isSelected = redeemReward?.id === reward.id;
                return (
                  <div 
                    key={reward.id}
                    onClick={() => canAfford && setRedeemReward(reward)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                      !canAfford 
                        ? 'opacity-40 border-outline-variant/30 cursor-not-allowed bg-secondary-container/5' 
                        : isSelected 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                          : 'border-outline-variant/60 hover:border-primary/60 hover:bg-secondary-container/5'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-1">{reward.name}</h4>
                      <p className="text-[11px] text-secondary leading-relaxed">{reward.desc}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                        {reward.cost} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setShowRedeemModal(false)}
                className="flex-1 py-3 border border-outline rounded-xl font-bold text-xs text-primary hover:bg-secondary-container/20 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleRedeemSubmit}
                disabled={redeemLoading || !redeemReward}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold text-xs hover:opacity-95 transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {redeemLoading ? 'Processing...' : 'Confirm Redemption'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default UserDashboard;
