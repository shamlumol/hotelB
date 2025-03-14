import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const destinations = [
  {
    id: 'alleppey',
    name: 'Alleppey (Alappuzha)',
    tagline: 'The Venice of the East',
    description:
      'Drift through an intricate web of lagoons, lakes, and canals aboard a traditional Kerala houseboat. Alleppey is the crown jewel of the backwaters, celebrated for its paddy fields, coconut groves, and tranquil waterways that stretch endlessly into the horizon.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwxH8SCQbylSt9lK_hfgMl69WzKb76T0Sf9mQdm_-qNaij8CoBfxc0BIRorqmWws8Esv7MeCwfN7h8HtrSl6g18HhGXW8PiNP0yNv1QYQfmjHMs8JWZEVKsEGquBfhdICngErkU6WEmpu9ZU5NMk_OcAfN4Z9IMUAy1CLS-I9lSl8vKoX5vd7CBkvUabXM4vGAcgdsoWrI5Jh4GjApLHhdCoco73tcpLA4JF1WTlkVZPVpy9teeJpm5IZI_FZgKB4SD0gCIkK9dZM',
    highlights: ['Houseboat Cruises', 'Vembanad Lake', 'Marari Beach', 'Ayurvedic Retreats'],
    stayCount: 38,
    searchQuery: 'Alleppey',
    badge: 'Most Popular',
    badgeColor: '#004630',
  },
  {
    id: 'munnar',
    name: 'Munnar',
    tagline: 'High-Altitude Tea Country',
    description:
      'Ensconced in the Western Ghats at 1,600 metres, Munnar unfolds in cascading carpets of emerald tea plantations. Cool mists curl through valleys at dawn, while trekking paths lead to Anamudi — South India\'s highest peak — and Eravikulam National Park.',
    image:
      'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80',
    highlights: ['Tea Plantation Walks', 'Eravikulam NP', 'Attukal Waterfalls', 'Cloud Forest Treks'],
    stayCount: 22,
    searchQuery: 'Munnar',
    badge: 'Nature Escape',
    badgeColor: '#1f6b4b',
  },
  {
    id: 'wayanad',
    name: 'Wayanad',
    tagline: 'Into the Wild',
    description:
      'A plateau cloaked in coffee estates, spice gardens, and ancient tribal villages. Wayanad is Kerala\'s wild heart — home to Banasura Sagar Dam (India\'s largest earthen dam), Edakkal Caves with prehistoric carvings, and rich tribal cultural experiences.',
    image:
      'https://images.unsplash.com/photo-1598511726623-d2e9996e2b27?w=800&q=80',
    highlights: ['Coffee Estate Stays', 'Chembra Peak Trek', 'Edakkal Caves', 'Wildlife Safaris'],
    stayCount: 18,
    searchQuery: 'Wayanad',
    badge: 'Adventure',
    badgeColor: '#5c4033',
  },
  {
    id: 'kumarakom',
    name: 'Kumarakom',
    tagline: 'Serenity on Vembanad Lake',
    description:
      'A cluster of tiny islands on the eastern shores of Vembanad Lake, Kumarakom is Kerala\'s most exclusive backwater retreat. Birdsong from the famous bird sanctuary fills mornings, while heritage resorts and private pool villas offer unrivalled luxury.',
    image:
      'https://images.unsplash.com/photo-1561626423-a51b45aef0a1?w=800&q=80',
    highlights: ['Bird Sanctuary', 'Private Pool Villas', 'Sunset Cruises', 'Ayurveda Spas'],
    stayCount: 14,
    searchQuery: 'Kumarakom',
    badge: 'Ultra-Luxury',
    badgeColor: '#7b4f00',
  },
  {
    id: 'kovalam',
    name: 'Kovalam',
    tagline: 'Where the Arabian Sea Meets Bliss',
    description:
      'A crescent of three adjacent beaches flanked by rocky headlands, Kovalam has been Kerala\'s premier beach destination since the 1970s. The famous Lighthouse Beach, traditional Ayurvedic clinics, and fresh seafood restaurants make it endlessly alluring.',
    image:
      'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=800&q=80',
    highlights: ['Lighthouse Beach', 'Ayurvedic Clinics', 'Seafood Dining', 'Water Sports'],
    stayCount: 16,
    searchQuery: 'Kovalam',
    badge: 'Beach Paradise',
    badgeColor: '#0066aa',
  },
  {
    id: 'thekkady',
    name: 'Thekkady',
    tagline: 'Periyar Tiger Reserve Gateway',
    description:
      'Surrounding the shimmering Periyar Lake, Thekkady is a sanctuary of spice-scented forest and wildlife. Elephants wade into the lake at dusk, tiger sightings have increased in recent years, and bamboo rafting offers an extraordinary jungle immersion.',
    image:
      'https://images.unsplash.com/photo-1543877087-ebf1a5a20d7b?w=800&q=80',
    highlights: ['Periyar Tiger Reserve', 'Spice Plantation Tours', 'Bamboo Rafting', 'Elephant Spotting'],
    stayCount: 12,
    searchQuery: 'Thekkady',
    badge: 'Wildlife',
    badgeColor: '#4a5c00',
  },
];

const Destinations = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-16 py-10">
      {/* Hero Header */}
      <section className="mb-14">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
          Explore Kerala
        </span>
        <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
          Discover Our<br />
          <span
            style={{
              background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Destinations
          </span>
        </h1>
        <p className="font-body text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          From misty hill stations to tranquil backwaters and pristine beaches — each corner of Kerala holds a world apart. Choose your destination and we'll curate the perfect stay.
        </p>
      </section>

      {/* Destination Cards */}
      <div className="space-y-8">
        {destinations.map((dest, index) => (
          <div
            key={dest.id}
            className={`group relative flex flex-col ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } rounded-3xl overflow-hidden border border-outline-variant/20 shadow-soft hover:shadow-xl transition-all duration-500 bg-white`}
            onMouseEnter={() => setHoveredId(dest.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image Panel */}
            <div className="relative w-full md:w-[55%] h-64 md:h-auto overflow-hidden shrink-0">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105 min-h-[280px]"
                style={{ backgroundImage: `url(${dest.image})` }}
              />
              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    index % 2 === 0
                      ? 'linear-gradient(to left, rgba(255,255,255,0.15), rgba(0,0,0,0.1))'
                      : 'linear-gradient(to right, rgba(255,255,255,0.15), rgba(0,0,0,0.1))',
                }}
              />
              {/* Badge */}
              <div
                className="absolute top-5 left-5 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg"
                style={{ background: dest.badgeColor }}
              >
                {dest.badge}
              </div>
            </div>

            {/* Content Panel */}
            <div className="flex flex-col justify-between p-8 md:p-10 flex-1">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Kerala, India</span>
                </div>
                <h2 className="font-headline text-2xl md:text-3xl text-primary font-semibold mb-1">
                  {dest.name}
                </h2>
                <p className="text-sm font-semibold text-secondary mb-4 italic">{dest.tagline}</p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
                  {dest.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {dest.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[11px] font-semibold bg-secondary-container/40 text-primary px-3 py-1.5 rounded-full border border-secondary-container/60"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
                <div>
                  <p className="font-headline text-2xl text-primary font-semibold">{dest.stayCount}</p>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Luxury Stays Available
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/stays?location=${encodeURIComponent(dest.searchQuery)}`)
                  }
                  className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Explore Stays
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="mt-20 rounded-3xl overflow-hidden relative text-center py-16 px-6">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #004630 0%, #1f6b4b 50%, #007a55 100%)',
          }}
        />
        <div className="relative z-10">
          <span className="material-symbols-outlined text-white/60 text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            houseboat
          </span>
          <h2 className="font-headline text-3xl md:text-4xl text-white font-semibold mb-3">
            Can't Decide? Browse All Stays
          </h2>
          <p className="text-white/75 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Filter by price, property type, amenities, and guest rating to find your perfect luxury escape across all of Kerala.
          </p>
          <button
            onClick={() => navigate('/stays')}
            className="bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-primary-container transition-all shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
          >
            View All 100+ Stays
          </button>
        </div>
      </section>
    </main>
  );
};

export default Destinations;
