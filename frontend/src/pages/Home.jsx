import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import StayCard from '../components/StayCard';
import heroVideo from '../assets/hero-bg.mp4';
import { useTranslation } from '../context/TranslationContext';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { API_URL } = useContext(AuthContext);
  const [featuredStays, setFeaturedStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${API_URL}/stays/featured`);
        if (res.data.success) {
          setFeaturedStays(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured stays:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [API_URL]);

  const handleSearch = (searchParams) => {
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/stays?${query}`);
  };

  const destinations = [
    {
      name: "Kochi",
      tag: "Harbor City",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiV80mwuoMaaZz20lEO72LmT55F8WBcqJmlbqDD61ktWCNzARoodUv0QxV2eqzNDo4Qslm-4mb-6y8dMpvBpj2sMvj6oSA1cl25gX0PeuE1OXgLmaXYoWb4arlNrvDfUk6m1oNZ6PYJrA8TR-oied8ke_0Pj78GHtWYk1xnmdk6Dh7XfuFAVMzOcp-pTgXDLEPpucXkL5eYu_5uKWmxXHcIDOn3TKXvkjpJ1WrGOCLnbYywx35XeoNFH4ryslzA0g8WihzW8yokWo"
    },
    {
      name: "Munnar",
      tag: "Hill Station",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4loYPZJQR9z-TFclW_frhtuFdJrQkkawr0pR5XQLQ12BH8ZxLIWx2ql_0q_Kj9Wn1fJqvNueJkV7vvhnF-k3zQr2j6Y_o8jBSX9b2K1U9nUh4fZ140i8x3xzkze9rnmritok351MhDOMuNIozxqJ77pbbgUyv2vSa2KLPd7RcCbP5UA3f_NTD2yalGxVf4Ox4SlzbCUBZ6klNKfXG0QNxTce-WOmq0kCE8jg7icPHAIpTJ1gcmco9AiMfXYtE8lM-mjrZgVLPb2c"
    },
    {
      name: "Alleppey",
      tag: "Backwaters",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDcUTalA_ZMhW4lGaqgmgS7iW3QoIavq2-WfZ48N6GwLr5vyjDFO7WqYBg9TZwsBzmH__ZrtG4vWLtAFOnkISgiSyqOAAQBT_ZwwwnxymeJiR8GAihOtzBBYT55DHDTy6ezRJ3_MDfNkiQ7wVCyJTC1_jIjLoGxnn9vuY2zCaV7ZejSk3k66C_K0JtINSICpGW1ULv6vlomuBw8Dyn7IbqxXD1G-uiKemBgMjKR4rlLugVGgyUWRFJ8hqMshSBWy6ZkL5P-AAhlS4"
    },
    {
      name: "Wayanad",
      tag: "Rainforest Sanctuary",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuArKwj8Gri1D6QkIhiZOm1qDmaQi0qOtaNNtZOlkYf-GH9z3uZAbV_wccE4AQB6a7wYxEVS9Iy2VeGHXbNe6uDDPzU-lyvrMhoa_4vP5jPY8i-U4m87v-YIAu9sQH3KbqXNFOOjkTc69j2Mab_QFpYPC1DpLDxN1kBh2uMj91_Atpm2IiIdx7Pur7Dyya8lBNryluRmG0t3D0zBrRhT77FB0ST2o5UdB9EDot9_Wh5TimFtaE6-0TNFwRyPYK4kHTBRCuedE0dBokQ"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[700px] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {showVideo && (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover scale-105 object-center"
            >
              <source src={heroVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl -translate-y-6">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight font-medium" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}>
            {t('hero_title')}
          </h1>
          <p className="font-body text-xs md:text-base lg:text-lg text-white/90 max-w-2xl mx-auto uppercase tracking-widest font-semibold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {t('hero_subtitle')}
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-5xl px-6 z-20">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
              Explore Kerala
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-primary font-semibold mb-2 leading-tight">
              Kerala's<br />
              <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Best
              </span>
            </h2>
            <p className="text-on-surface-variant font-body text-sm">Discover the most sought-after corners of God's Own Country.</p>
          </div>
          <button 
            onClick={() => navigate('/stays')}
            className="text-primary font-bold flex items-center gap-1 group hover:opacity-80 transition-opacity"
          >
            View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
          {destinations.map((dest, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(`/stays?location=${dest.name}`)}
              className="group cursor-pointer relative h-96 overflow-hidden rounded-xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                style={{ backgroundImage: `url(${dest.img})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-headline text-2xl font-medium">{dest.name}</h3>
                <p className="font-body text-xs opacity-80">{dest.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Stays */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12 text-center">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
              Editor's Picks
            </span>
            <h2 className="font-headline text-4xl md:text-5xl text-primary font-semibold mb-2 leading-tight">
              Handpicked<br />
              <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Luxury Stays
              </span>
            </h2>
            <p className="text-on-surface-variant font-body max-w-2xl mx-auto">
              Selected for their unique architecture, exceptional service, and harmonious connection to the landscape.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary inline-block"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {featuredStays.map((stay) => (
                <StayCard key={stay._id} stay={stay} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experiences */}
      <section className="py-24 bg-secondary-container">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div className="md:w-1/3">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
                Curated For You
              </span>
              <h2 className="font-headline text-4xl md:text-5xl text-primary font-semibold mb-6 leading-tight">
                Authentic Kerala<br />
                <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Experiences
                </span>
              </h2>
              <p className="text-on-secondary-container font-body leading-relaxed mb-8">
                Go beyond the stay. Immerse yourself in the ancient traditions and breathtaking landscapes of Kerala with our curated experiences.
              </p>
              <button 
                onClick={() => navigate('/experiences')}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:bg-primary-container transition-all text-sm"
              >
                Explore All
              </button>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-gutter">
              <div 
                onClick={() => navigate('/experiences?category=Water')}
                className="flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-surface-bright flex items-center justify-center mb-4 soft-elevation group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-primary">directions_boat</span>
                </div>
                <h4 className="font-headline text-xl mb-2 font-medium">Houseboat Cruises</h4>
                <p className="text-on-secondary-container text-sm">Luxury private cruises through the calm backwaters.</p>
              </div>

              <div 
                onClick={() => navigate('/experiences?category=Wellness')}
                className="flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-surface-bright flex items-center justify-center mb-4 soft-elevation group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-primary">spa</span>
                </div>
                <h4 className="font-headline text-xl mb-2 font-medium">Ayurvedic Healing</h4>
                <p className="text-on-secondary-container text-sm">Ancient rejuvenation therapies by certified practitioners.</p>
              </div>

              <div 
                onClick={() => navigate('/experiences?category=Nature')}
                className="flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-surface-bright flex items-center justify-center mb-4 soft-elevation group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-primary">eco</span>
                </div>
                <h4 className="font-headline text-xl mb-2 font-medium">Tea Plantations</h4>
                <p className="text-on-secondary-container text-sm">Guided tours and tastings in the misty Munnar hills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Stories (Testimonials) */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <h2 className="font-headline text-3xl text-center mb-16 font-medium">Guest Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-xl soft-elevation relative">
              <span className="material-symbols-outlined text-5xl text-primary/10 absolute top-4 left-4">format_quote</span>
              <p className="italic text-on-surface-variant font-body mb-8 relative z-10 leading-relaxed text-sm">
                "A paradise on earth. The hospitality at HotelB stays is unmatched. Every detail from the welcome drink to the houseboat cruise was perfectly curated."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex-shrink-0"></div>
                <div>
                  <p className="font-body font-semibold text-on-surface text-sm">Sarah J.</p>
                  <p className="font-body text-xs text-secondary">Travel Blogger</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-xl soft-elevation relative">
              <span className="material-symbols-outlined text-5xl text-primary/10 absolute top-4 left-4">format_quote</span>
              <p className="italic text-on-surface-variant font-body mb-8 relative z-10 leading-relaxed text-sm">
                "The Ayurvedic retreat in Wayanad was life-changing. Pure serenity combined with world-class luxury. I'll definitely be returning next year."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex-shrink-0"></div>
                <div>
                  <p className="font-body font-semibold text-on-surface text-sm">Michael R.</p>
                  <p className="font-body text-xs text-secondary">Executive</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-xl soft-elevation relative">
              <span className="material-symbols-outlined text-5xl text-primary/10 absolute top-4 left-4">format_quote</span>
              <p className="italic text-on-surface-variant font-body mb-8 relative z-10 leading-relaxed text-sm">
                "Never seen anything like the tea plantations in Munnar. HotelB found us a treehouse that was straight out of a dream. Professional and seamless."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex-shrink-0"></div>
                <div>
                  <p className="font-body font-semibold text-on-surface text-sm">Elena K.</p>
                  <p className="font-body text-xs text-secondary">Photographer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile">
        <div className="bg-primary p-12 md:p-20 rounded-2xl hull-curve text-center relative overflow-hidden text-on-primary">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-on-primary-container/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline text-4xl text-on-primary mb-4 leading-tight">Stay Inspired</h2>
            <p className="text-on-primary-container font-body leading-relaxed mb-10 text-sm md:text-base">
              Join our community to receive curated travel guides, exclusive offers, and a taste of Kerala serenity in your inbox.
            </p>
            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to HotelB!'); }}
              className="flex flex-col md:flex-row gap-4"
            >
              <input 
                className="flex-1 px-6 py-4 rounded-lg bg-surface border-none focus:ring-2 focus:ring-tertiary-fixed text-on-surface text-sm placeholder:text-on-surface-variant/70 outline-none" 
                placeholder="Your email address" 
                type="email"
                required
              />
              <button 
                className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-4 rounded-lg font-bold hover:bg-tertiary-fixed-dim transition-colors text-sm" 
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
