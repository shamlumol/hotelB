import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StayCard = ({ stay }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
      return list.some(item => (typeof item === 'string' ? item === stay._id : item.id === stay._id));
    } catch (e) {
      return false;
    }
  });

  const toggleFavorite = (e) => {
    e.stopPropagation();
    try {
      let list = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
      const existsIndex = list.findIndex(item => (typeof item === 'string' ? item === stay._id : item.id === stay._id));
      if (existsIndex !== -1) {
        list.splice(existsIndex, 1);
        setIsFavorite(false);
      } else {
        list.push({
          id: stay._id,
          name: stay.title,
          image: stay.image,
          location: stay.location,
          price: stay.basePrice,
          rating: stay.rating,
          reviews: stay.reviewsCount,
          tag: stay.category
        });
        setIsFavorite(true);
      }
      localStorage.setItem('hotelb_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/stays/${stay._id}`)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden soft-elevation border border-transparent hover:border-outline-variant transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={stay.image} 
          alt={stay.title} 
        />
        <button 
          onClick={toggleFavorite}
          className="absolute top-4 right-4 h-10 w-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-white transition-colors"
        >
          <span 
            className="material-symbols-outlined" 
            style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0', color: isFavorite ? '#ba1a1a' : '' }}
          >
            favorite
          </span>
        </button>
        {stay.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-headline text-xl text-on-surface font-semibold line-clamp-1">{stay.title}</h3>
            <div className="flex items-center text-[#C89B3C] shrink-0">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
              <span className="font-bold ml-1 text-sm">{stay.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-on-surface-variant text-sm mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span> 
            {stay.location}
          </p>

          <div className="flex gap-3 mb-4 text-outline">
            {stay.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="material-symbols-outlined text-[20px]" title={amenity}>
                {amenity === 'chef' ? 'restaurant' : amenity === 'spa' ? 'spa' : amenity === 'pool' ? 'pool' : amenity === 'wifi' ? 'wifi' : 'ac_unit'}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-outline-variant/20">
          <div>
            <span className="text-xs text-secondary">from</span>
            <p className="font-headline text-lg text-primary font-semibold">
              ₹{stay.basePrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-secondary">/night</span>
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stays/${stay._id}`);
            }}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-container transition-all shadow-md text-sm"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StayCard;
