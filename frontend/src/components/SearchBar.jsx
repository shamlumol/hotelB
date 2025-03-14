import React, { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

const SearchBar = ({ onSearch, initialValues = {} }) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(initialValues.location || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || '');
  const [guests, setGuests] = useState(initialValues.guests || '');

  // Focus states to manage dropdown visibility
  const [locationFocused, setLocationFocused] = useState(false);
  const [checkInFocused, setCheckInFocused] = useState(false);
  const [checkOutFocused, setCheckOutFocused] = useState(false);
  const [guestsFocused, setGuestsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ location, checkIn, checkOut, guests });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-2xl p-3 sm:p-2 rounded-2xl sm:rounded-full border border-white/50 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-1 w-full relative z-30">
      <div className="flex-grow flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 min-w-0">
        {/* Destination */}
        <div className="relative flex items-center gap-1.5 md:gap-3 py-1.5 px-3 sm:py-1 sm:px-4 text-left flex-grow w-full sm:w-auto">
          <span className="material-symbols-outlined text-primary text-[20px] md:text-[22px] select-none flex-shrink-0">location_on</span>
          <div className="flex-grow flex flex-col items-start w-full min-w-0">
            <span className="text-[9px] md:text-xs font-semibold text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap">{t('destination')}</span>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setTimeout(() => setLocationFocused(false), 200)}
              className="bg-transparent border-none focus:ring-0 font-body p-0 placeholder:text-on-surface-variant/75 text-left w-full text-xs md:text-sm outline-none overflow-hidden text-ellipsis whitespace-nowrap min-w-0" 
              placeholder={t('destination')} 
            />
          </div>

          {/* Location Dropdown */}
          {locationFocused && (
            <div className="absolute top-[115%] left-0 w-full min-w-[200px] sm:min-w-[240px] bg-white/95 backdrop-blur-md border border-secondary-container rounded-2xl shadow-2xl z-50 overflow-hidden py-2 text-left">
              <p className="px-4 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-secondary-container/20 mb-1">Popular Destinations</p>
              {['Alleppey', 'Munnar', 'Kovalam', 'Thekkady', 'Wayanad', 'Kochi'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLocation(loc);
                    setLocationFocused(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-on-surface hover:bg-secondary-container/40 transition-colors text-left flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="hidden sm:block w-px h-6 md:h-10 bg-outline-variant/40 self-center flex-shrink-0"></div>

        {/* Check-in */}
        <div className="relative flex items-center gap-1.5 md:gap-3 py-1.5 px-3 sm:py-1 sm:px-4 text-left w-full sm:w-28 md:w-36 flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px] md:text-[22px] select-none flex-shrink-0">calendar_today</span>
          <div className="flex-grow flex flex-col items-start w-full min-w-0">
            <span className="text-[9px] md:text-xs font-semibold text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap">{t('check_in')}</span>
            <input 
              type={checkInFocused || checkIn ? "date" : "text"}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              onFocus={() => setCheckInFocused(true)}
              onBlur={() => setCheckInFocused(false)}
              className="bg-transparent border-none focus:ring-0 font-body p-0 placeholder:text-on-surface-variant/75 text-left w-full text-xs md:text-sm outline-none cursor-pointer min-w-0" 
              placeholder="Add date" 
            />
          </div>
        </div>
        <div className="hidden sm:block w-px h-6 md:h-10 bg-outline-variant/40 self-center flex-shrink-0"></div>

        {/* Check-out */}
        <div className="relative flex items-center gap-1.5 md:gap-3 py-1.5 px-3 sm:py-1 sm:px-4 text-left w-full sm:w-28 md:w-36 flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px] md:text-[22px] select-none flex-shrink-0">calendar_today</span>
          <div className="flex-grow flex flex-col items-start w-full min-w-0">
            <span className="text-[9px] md:text-xs font-semibold text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap">{t('check_out')}</span>
            <input 
              type={checkOutFocused || checkOut ? "date" : "text"}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              onFocus={() => setCheckOutFocused(true)}
              onBlur={() => setCheckOutFocused(false)}
              className="bg-transparent border-none focus:ring-0 font-body p-0 placeholder:text-on-surface-variant/75 text-left w-full text-xs md:text-sm outline-none cursor-pointer min-w-0" 
              placeholder="Add date" 
            />
          </div>
        </div>
        <div className="hidden sm:block w-px h-6 md:h-10 bg-outline-variant/40 self-center flex-shrink-0"></div>

        {/* Guests */}
        <div className="relative flex items-center gap-1.5 md:gap-3 py-1.5 px-3 sm:py-1 sm:px-4 text-left w-full sm:w-28 md:w-40 flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px] md:text-[22px] select-none flex-shrink-0">group</span>
          <div className="flex-grow flex flex-col items-start w-full min-w-0">
            <span className="text-[9px] md:text-xs font-semibold text-primary uppercase tracking-wider mb-0.5 whitespace-nowrap">{t('guests')}</span>
            <input 
              type="text"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onFocus={() => setGuestsFocused(true)}
              onBlur={() => setTimeout(() => setGuestsFocused(false), 200)}
              className="bg-transparent border-none focus:ring-0 font-body p-0 placeholder:text-on-surface-variant/75 text-left w-full text-xs md:text-sm outline-none cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap min-w-0" 
              placeholder="Add guests" 
              readOnly
            />
          </div>

          {/* Guests Dropdown */}
          {guestsFocused && (
            <div className="absolute top-[115%] right-0 w-[180px] bg-white/95 backdrop-blur-md border border-secondary-container rounded-2xl shadow-2xl z-50 overflow-hidden py-2 text-left">
              <p className="px-4 py-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-secondary-container/20 mb-1">Select Guests</p>
              {['1 Guest', '2 Guests', '3 Guests', '4 Guests', '5+ Guests'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setGuests(g);
                    setGuestsFocused(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-on-surface hover:bg-secondary-container/40 transition-colors text-left flex items-center gap-2 font-medium"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit"
        className="bg-primary text-on-primary p-3.5 sm:p-3 md:px-8 md:py-4 rounded-xl sm:rounded-full font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg hover:bg-primary-container hover:text-on-primary-container whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
      >
        <span className="material-symbols-outlined text-[20px]">search</span>
        <span className="sm:hidden md:inline">{t('search')}</span>
      </button>
    </form>
  );
};

export default SearchBar;
