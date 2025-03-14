import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL, user } = useContext(AuthContext);

  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
      return list.some(item => (typeof item === 'string' ? item === id : item.id === id));
    } catch (e) {
      return false;
    }
  });

  const toggleFavorite = () => {
    try {
      let list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
      const existsIndex = list.findIndex(item => (typeof item === 'string' ? item === id : item.id === id));
      if (existsIndex !== -1) {
        list.splice(existsIndex, 1);
        setIsFavorite(false);
      } else {
        const wishlistItem = {
          id,
          name: stay?.title || 'Houseboat Stay',
          image: stay?.image || stay?.images?.[0] || '',
          location: stay?.location || 'Alleppey, Kerala',
          price: stay?.basePrice || null,
          rating: stay?.rating || null,
          reviews: stay?.reviewsCount || null,
          tag: stay?.category || null
        };
        list.push(wishlistItem);
        setIsFavorite(true);
      }
      localStorage.setItem('hotelb_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  // Helpers to get dynamic YYYY-MM-DD date strings
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureDateString = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Booking Card states
  const [checkIn, setCheckIn] = useState(getTodayString());
  const [checkOut, setCheckOut] = useState(getFutureDateString(2));
  const [guests, setGuests] = useState('2 Guests');

  // Client Review Form states
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);
  const [locationVal, setLocationVal] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError('');
      const res = await axios.post(`${API_URL}/stays/${id}/reviews`, {
        comment,
        rating,
        cleanliness,
        service,
        location: locationVal
      });
      if (res.data.success) {
        setReviewSuccess('Thank you! Your review has been added.');
        setComment('');
        setRating(5);
        setCleanliness(5);
        setService(5);
        setLocationVal(5);
        setStay(prev => ({
          ...prev,
          reviews: res.data.data,
          rating: res.data.rating,
          reviewsCount: res.data.reviewsCount
        }));
        setTimeout(() => setReviewSuccess(''), 5000);
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── SHARE MODAL STATE ────────────────────────────────────────────────────────
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareType, setShareType] = useState('page'); // 'page' or 'location'
  const [copySuccess, setCopySuccess] = useState(false);

  const getShareUrl = useCallback(() => {
    if (shareType === 'location') {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay?.location || 'Alleppey, Kerala')}`;
    }
    return window.location.href;
  }, [shareType, stay]);

  const getShareText = useCallback(() => {
    if (shareType === 'location') {
      return `Check out this location: ${stay?.location || 'Alleppey, Kerala'}`;
    }
    return `Check out ${stay?.title || 'this amazing stay'} on HotelB! ${stay?.location ? `Located in ${stay.location}.` : ''}`;
  }, [shareType, stay]);

  const openShareModal = (type = 'page') => {
    setShareType(type);
    setCopySuccess(false);
    setShareModalOpen(true);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.33 8.7 7.33 8.53 7.33Z',
      color: '#25D366',
      bgColor: '#dcfce7',
      getUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    },
    {
      name: 'Telegram',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.19-5.33 3.52-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.24.36-.48.99-.74 3.89-1.69 6.48-2.8 7.77-3.33 3.69-1.52 4.46-1.78 4.96-1.79.11 0 .36.03.52.16.14.11.18.27.2.42z',
      color: '#0088cc',
      bgColor: '#e0f2fe',
      getUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      name: 'Facebook',
      icon: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z',
      color: '#1877F2',
      bgColor: '#e8f0fe',
      getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Instagram',
      icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z',
      color: '#E1306C',
      bgColor: '#fce7f3',
      getUrl: (url) => `https://www.instagram.com/`,
      note: 'Copy link then paste on Instagram',
    },
    {
      name: 'Twitter / X',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      color: '#000000',
      bgColor: '#f3f4f6',
      getUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
      color: '#0072C6',
      bgColor: '#dbeafe',
      getUrl: (url, text) => `mailto:?subject=${encodeURIComponent('Check this out on HotelB!')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    },
  ];

  useEffect(() => {
    const fetchStayDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/stays/${id}`);
        if (res.data.success) {
          setStay(res.data.data);
          if (res.data.data.rooms && res.data.data.rooms.length > 0) {
            setSelectedRoom(res.data.data.rooms[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching stay details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStayDetails();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="text-center py-40">
        <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></span>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="text-center py-40">
        <h2 className="font-headline text-3xl text-primary font-medium mb-4">Stay Not Found</h2>
        <Link to="/stays" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold hover:opacity-90">
          Back to Stays
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const roomPrice = selectedRoom ? selectedRoom.price : stay.basePrice;
  const subtotal = roomPrice * nights;
  const serviceFee = Math.round(subtotal * 0.06);
  const taxes = Math.round(subtotal * 0.03);
  const total = subtotal + serviceFee + taxes;

  const handleReserve = () => {
    if (!selectedRoom) {
      alert('Please select a room first');
      return;
    }

    const queryParams = new URLSearchParams({
      roomTitle: selectedRoom.title,
      checkIn,
      checkOut,
      guests
    }).toString();

    if (!user) {
      navigate(`/login?redirect=/checkout/${id}?${queryParams}`);
    } else {
      navigate(`/checkout/${id}?${queryParams}`);
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-24">
      {/* ── SHARE MODAL ────────────────────────────────────────────────────────── */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShareModalOpen(false); }}
        >
          <div
            className="w-full sm:w-[480px] rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(0,70,48,0.1)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  {shareType === 'location' ? 'Share Location' : 'Share This Stay'}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[280px]">
                  {shareType === 'location' ? stay?.location : stay?.title}
                </p>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center hover:bg-secondary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-5">
              {shareOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => {
                    const url = getShareUrl();
                    const text = getShareText();
                    const shareUrl = opt.getUrl(url, text);
                    if (opt.name === 'Instagram') {
                      handleCopyLink();
                    } else {
                      window.open(shareUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                  style={{ background: opt.bgColor }}
                  title={opt.note || `Share on ${opt.name}`}
                >
                  <svg viewBox="0 0 24 24" fill={opt.color} className="w-7 h-7">
                    <path d={opt.icon} />
                  </svg>
                  <span className="text-[10px] font-bold" style={{ color: opt.color }}>
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Copy Link Section */}
            <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">link</span>
              <p className="flex-1 text-xs text-on-surface-variant truncate font-medium">
                {getShareUrl()}
              </p>
              <button
                onClick={handleCopyLink}
                className={`shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  copySuccess
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span> Copied!
                  </span>
                ) : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline text-3xl md:text-5xl text-primary mb-2 font-medium">{stay.title}</h1>
            <div className="flex items-center gap-4 text-on-surface-variant text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                {stay.rating.toFixed(1)} ({stay.reviewsCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined">location_on</span>
                {stay.location}
              </span>
            </div>
          </div>

          {/* ─── SHARE & FAVORITE BUTTONS ──────────────────────────────── */}
          <div className="flex gap-3">
            {/* SHARE BUTTON */}
            <button
              onClick={() => openShareModal('page')}
              className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Share this page"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>

            {/* FAVORITE BUTTON */}
            <button
              onClick={toggleFavorite}
              className="p-2 border border-outline-variant rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Add to wishlist"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0', color: isFavorite ? '#ba1a1a' : '' }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* ─── BENTO GALLERY ────────────────────────────────────────────── */}
        <div className="bento-grid rounded-xl overflow-hidden shadow-soft">
          <div className="bento-item-1 relative group cursor-pointer overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${stay.images[0] || stay.image})` }}
            ></div>
          </div>
          <div className="bento-item-2 relative group cursor-pointer overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${stay.images[1] || stay.image})` }}
            ></div>
          </div>
          <div className="bento-item-3 relative group cursor-pointer overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${stay.images[2] || stay.image})` }}
            ></div>
          </div>
          <div className="bento-item-4 relative group cursor-pointer overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${stay.images[3] || stay.image})` }}
            ></div>
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-semibold text-sm">View All Photos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT & SIDEBAR ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ─── LEFT: CONTENT ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section>
            <h2 className="font-headline text-3xl text-primary mb-6 font-medium">A Sanctuary on the Water</h2>
            <p className="font-body text-body-lg text-on-surface-variant leading-relaxed">
              {stay.overview}
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-outline-variant/30 py-8">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">bed</span>
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">2 Suites</p>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">shower</span>
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Private Bath</p>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">person</span>
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">4 Guests</p>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-3xl mb-2">kayaking</span>
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Guided Tours</p>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="font-headline text-2xl text-primary mb-8 font-medium">Amenities &amp; Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">spa</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Ayurvedic Spa</h4>
                  <p className="text-xs text-on-surface-variant">On-call therapists for traditional wellness</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">pool</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Infinity Pool</h4>
                  <p className="text-xs text-on-surface-variant">Private heated plunge pool on deck</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Private Chef</h4>
                  <p className="text-xs text-on-surface-variant">Curated Kerala and Continental menus</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">wifi</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Complimentary Wi-Fi</h4>
                  <p className="text-xs text-on-surface-variant">High-speed satellite connectivity</p>
                </div>
              </div>
            </div>
          </section>

          {/* Available Rooms */}
          <section>
            <h2 className="font-headline text-2xl text-primary mb-8 font-medium">Available Rooms</h2>
            <div className="space-y-6">
              {stay.rooms && stay.rooms.map((room) => (
                <div
                  key={room._id}
                  className={`group flex flex-col md:flex-row bg-white rounded-xl overflow-hidden border transition-all duration-500 ${selectedRoom?.title === room.title
                      ? 'border-primary shadow-md ring-1 ring-primary'
                      : 'border-outline-variant hover:shadow-lg'
                    }`}
                >
                  <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={room.image} alt={room.title} />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-headline text-xl mb-2 font-medium">{room.title}</h3>
                      <p className="font-body text-sm text-on-surface-variant mb-4">{room.details}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        {room.originalPrice && (
                          <p className="text-xs text-on-surface-variant line-through">₹{room.originalPrice.toLocaleString('en-IN')}</p>
                        )}
                        <p className="font-headline text-lg text-primary font-semibold">
                          ₹{room.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-on-surface-variant">/ night</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className={`px-6 py-2 rounded-full transition-all text-xs font-semibold border ${selectedRoom?.title === room.title
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-primary text-primary hover:bg-primary hover:text-on-primary'
                          }`}
                      >
                        {selectedRoom?.title === room.title ? 'Selected' : 'Select Room'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── LOCATION SECTION ───────────────────────────────────────── */}
          <section>
            <h2 className="font-headline text-2xl text-primary mb-6 font-medium">Location</h2>

            <div className="h-[400px] rounded-xl overflow-hidden shadow-sm relative group mb-8">
              <div className="absolute inset-0 bg-secondary-container/20 pointer-events-none"></div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.location || 'Alleppey, Kerala')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full cursor-pointer"
              >
                <img
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  src={stay.image || "https://maps.googleapis.com/maps/api/staticmap?center=9.4981,76.3388&zoom=12&size=600x400&markers=color:red%7C9.4981,76.3388"}
                  alt="Map of stay location"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23004630'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='24' fill='white' text-anchor='middle'%3EClick to View Map%3C/text%3E%3C/svg%3E";
                  }}
                />
              </a>

              <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">navigation</span>
                <span className="font-semibold text-on-surface">{stay.location || 'Vembanad Backwaters, Kerala'}</span>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.location || 'Alleppey, Kerala')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-gray-50 text-primary px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs font-semibold transition-all hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  Open in Maps
                </a>

                <button
                  onClick={() => openShareModal('location')}
                  className="bg-white hover:bg-gray-50 text-primary px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs font-semibold transition-all hover:shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  Share Location
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-body font-bold text-primary mb-4 uppercase tracking-wider text-xs">Nearby Attractions</h4>
                <ul className="space-y-3 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-tertiary">water</span>
                    <span>Vembanad Lake (0.5 km)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-tertiary">beach_access</span>
                    <span>Marari Beach (12 km)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-tertiary">church</span>
                    <span>St. Andrew's Basilica (15 km)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-body font-bold text-primary mb-4 uppercase tracking-wider text-xs">Getting There</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Complimentary private sedan transfer from Cochin International Airport (80 km) for bookings over 3 nights.
                </p>
                <div className="mt-4 p-4 bg-secondary-container/20 rounded-lg">
                  <p className="text-xs font-semibold text-primary">📍 Address</p>
                  <p className="text-sm text-on-surface-variant mt-1">{stay.address || stay.location || 'Alleppey, Kerala, India'}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stay.location || 'Alleppey, Kerala')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl text-primary font-medium">Guest Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="font-headline text-2xl text-primary font-semibold">{stay.rating.toFixed(1)}</span>
                <div className="flex">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star_half</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {stay.reviews && stay.reviews.length > 0 ? (
                stay.reviews.map((review, idx) => (
                  <div key={idx} className="border-b border-outline-variant/30 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary text-sm uppercase">
                        {review.reviewerName.substring(0, 2)}
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-on-surface">{review.reviewerName}</h5>
                        <p className="text-xs text-on-surface-variant">{review.dateString}</p>
                      </div>
                    </div>
                    <p className="italic text-on-surface-variant mb-3 leading-relaxed text-sm">"{review.comment}"</p>
                    <div className="flex gap-4 text-xs text-tertiary font-semibold">
                      <span>Cleanliness: {review.cleanliness.toFixed(1)}</span>
                      <span>Service: {review.service.toFixed(1)}</span>
                      <span>Location: {review.location.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm italic">No reviews yet. Be the first to stay here!</p>
              )}
            </div>

            {/* Write a Review Section */}
            <div className="mt-12 bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-outline-variant/30 text-left">
              <h3 className="font-headline text-xl text-primary font-medium mb-1">Write a Review</h3>
              <p className="text-secondary text-xs mb-6">Share your experience with other travelers</p>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {reviewError && (
                    <div className="bg-error/10 text-error p-4 rounded-xl text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div className="bg-green-100 text-green-700 p-4 rounded-xl text-xs font-semibold">
                      {reviewSuccess}
                    </div>
                  )}

                  {/* Rating Stars Selection */}
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Overall Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-2xl transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                        >
                          <span
                            className="material-symbols-outlined text-3xl"
                            style={{
                              fontVariationSettings: star <= rating ? '"FILL" 1' : '"FILL" 0',
                              color: star <= rating ? '#C89B3C' : '#ccc'
                            }}
                          >
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific category ratings */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Cleanliness */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Cleanliness ({cleanliness}/5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={cleanliness}
                        onChange={(e) => setCleanliness(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Service ({service}/5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={service}
                        onChange={(e) => setService(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Location ({locationVal}/5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={locationVal}
                        onChange={(e) => setLocationVal(Number(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Your Feedback</label>
                    <textarea
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about the property, rooms, local hospitality, and your overall experience..."
                      className="w-full p-4 rounded-xl border border-outline-variant/40 bg-transparent text-sm placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4">
                  <p className="text-sm text-secondary mb-4">You must be logged in to leave a review.</p>
                  <Link
                    to={`/login?redirect=/stays/${id}`}
                    className="inline-flex bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-sm"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Cancellation Policies */}
          <section className="bg-secondary-container/30 p-8 rounded-xl border border-secondary-container/30">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-6">Booking Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div>
                <h5 className="font-semibold text-on-surface mb-2">Check-in / Check-out</h5>
                <p className="text-on-surface-variant leading-relaxed">Check-in: 12:00 PM<br />Check-out: 10:00 AM</p>
              </div>
              <div>
                <h5 className="font-semibold text-on-surface mb-2">Cancellation</h5>
                <p className="text-on-surface-variant leading-relaxed">Free cancellation for 48 hours. After that, cancel up to 7 days before check-in and get a 50% refund.</p>
              </div>
            </div>
          </section>
        </div>

        {/* ─── RIGHT: SIDEBAR ───────────────────────────────────────────── */}
        <aside className="relative">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-outline-variant/30">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-headline text-2xl text-primary font-semibold">
                    ₹{roomPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-on-surface-variant">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <span>{stay.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 border border-outline-variant/30 rounded-lg overflow-hidden text-left">
                  <div className="p-3 border-r border-outline-variant/30 hover:bg-surface-container-low cursor-pointer transition-colors">
                    <p className="text-[10px] uppercase font-bold text-secondary">Check-in</p>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="border-none focus:ring-0 p-0 text-sm font-semibold text-on-surface bg-transparent w-full"
                    />
                  </div>
                  <div className="p-3 hover:bg-surface-container-low cursor-pointer transition-colors">
                    <p className="text-[10px] uppercase font-bold text-secondary">Check-out</p>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="border-none focus:ring-0 p-0 text-sm font-semibold text-on-surface bg-transparent w-full"
                    />
                  </div>
                </div>
                <div className="p-3 border border-outline-variant/30 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors text-left">
                  <p className="text-[10px] uppercase font-bold text-secondary">Guests</p>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="border-none focus:ring-0 p-0 text-sm font-semibold text-on-surface bg-transparent w-full"
                  >
                    <option value="1 Guest">1 Guest</option>
                    <option value="2 Guests">2 Guests</option>
                    <option value="3 Guests">3 Guests</option>
                    <option value="4 Guests">4 Guests</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleReserve}
                className="w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md mb-4"
              >
                Reserve Now
              </button>
              <p className="text-center text-xs text-on-surface-variant mb-6">You won't be charged yet</p>

              <div className="space-y-3 border-t border-outline-variant/30 pt-6 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="underline underline-offset-4">₹{roomPrice.toLocaleString('en-IN')} x {nights} nights</span>
                  <span className="text-on-surface font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline underline-offset-4">Service fee</span>
                  <span className="text-on-surface font-semibold">₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline underline-offset-4">Taxes</span>
                  <span className="text-on-surface font-semibold">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-on-surface pt-4 border-t border-outline-variant/10">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-primary-container p-4 rounded-xl text-on-primary-container text-xs">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
              <p className="leading-tight font-medium">HotelB Best Price Guarantee: Found a lower rate? We'll match it plus 10% off.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default StayDetails;