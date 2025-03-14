import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';

const Wishlist = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem('hotelb_wishlist') || '[]');
    setWishlistItems(saved);
    setLoading(false);
  }, [user]);

  const removeFromWishlist = (stayId) => {
    const updated = wishlistItems.filter(item => item.id !== stayId);
    setWishlistItems(updated);
    localStorage.setItem('hotelb_wishlist', JSON.stringify(updated));
  };

  const clearAll = () => {
    setWishlistItems([]);
    localStorage.setItem('hotelb_wishlist', JSON.stringify([]));
  };

  if (!user) {
    return (
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-center bg-background min-h-screen flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-left bg-background min-h-screen">
      <section className="mb-12">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
          {t('wishlist_collection')}
        </span>
        <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
          My<br />
          <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('wishlist_title')}
          </span>
        </h1>
        <p className="font-body text-sm md:text-base text-secondary max-w-2xl leading-relaxed">
          {t('wishlist_desc')}
        </p>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearAll}
            className="shrink-0 py-2.5 px-5 border border-outline hover:bg-secondary-container/20 rounded-xl font-bold text-xs text-secondary hover:text-primary transition-all cursor-pointer self-start mt-4"
          >
            Clear All
          </button>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 0" }}>
              favorite
            </span>
          </div>
          <h3 className="font-headline text-2xl text-primary font-semibold mb-3">{t('wishlist_empty')}</h3>
          <p className="text-sm text-secondary max-w-md leading-relaxed mb-8">
            Start exploring our curated collection of luxury houseboats and save the ones that catch your eye. Your dream Kerala getaway awaits.
          </p>
          <Link
            to="/stays"
            className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            {t('explore_stays')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-secondary-container/40 overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer shadow-sm"
                  title="Remove from wishlist"
                >
                  <span className="material-symbols-outlined text-[#e53935] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>
                {item.tag && (
                  <span className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-headline text-base font-semibold text-primary mb-1 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span className="text-xs">{item.location || 'Alleppey, Kerala'}</span>
                  </div>
                </div>

                {item.rating && (
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#f5a623] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-xs font-bold text-primary">{item.rating}</span>
                    {item.reviews && <span className="text-[10px] text-secondary">({item.reviews} reviews)</span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                  <div>
                    {item.price && (
                      <>
                        <span className="text-base font-bold text-primary">₹{item.price.toLocaleString()}</span>
                        <span className="text-[10px] text-secondary ml-1">/night</span>
                      </>
                    )}
                  </div>
                  <Link
                    to={`/stays/${item.id}`}
                    className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;