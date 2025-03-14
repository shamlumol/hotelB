import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ── HotelB Experience Sections ────────────────────────────────────────────
const EXPERIENCES = [
  {
    id: 'houseboat',
    category: 'Signature Stay',
    icon: 'directions_boat',
    title: 'Traditional Kerala Houseboat',
    subtitle: 'Drift through God\'s Own Country',
    description:
      'Step aboard our authentic Kettuvallam houseboats — handcrafted with bamboo poles, coconut fibre rope, and natural materials. Glide through the serene Alleppey backwaters while our crew attends to every detail of your stay.',
    highlights: ['En-suite bedroom with AC', 'Sundeck & sit-out area', 'Private chef on board', 'Scenic backwater routes'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwxH8SCQbylSt9lK_hfgMl69WzKb76T0Sf9mQdm_-qNaij8CoBfxc0BIRorqmWws8Esv7MeCwfN7h8HtrSl6g18HhGXW8PiNP0yNv1QYQfmjHMs8JWZEVKsEGquBfhdICngErkU6WEmpu9ZU5NMk_OcAfN4Z9IMUAy1CLS-I9lSl8vKoX5vd7CBkvUabXM4vGAcgdsoWrI5Jh4GjApLHhdCoco73tcpLA4JF1WTlkVZPVpy9teeJpm5IZI_FZgKB4SD0gCIkK9dZM',
    tag: 'Most Popular',
    tagColor: 'bg-[#C89B3C] text-white',
  },
  {
    id: 'spa',
    category: 'Wellness',
    icon: 'spa',
    title: 'Ayurvedic Wellness Retreat',
    subtitle: 'Heal from within with ancient wisdom',
    description:
      'Our in-house Ayurveda therapists offer personalised treatments rooted in Kerala\'s 3,000-year-old healing tradition. From Abhyanga oil massage to Shirodhara head therapy, each session is tailored to restore your mind, body, and spirit.',
    highlights: ['Abhyanga full body massage', 'Shirodhara head treatment', 'Panchakarma detox program', 'Herbal steam bath'],
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop',
    tag: 'Signature Experience',
    tagColor: 'bg-primary text-on-primary',
  },
  {
    id: 'dining',
    category: 'Culinary',
    icon: 'restaurant',
    title: 'Private Chef & Kerala Cuisine',
    subtitle: 'Farm-fresh ingredients, time-honoured recipes',
    description:
      'Savour authentic Kerala meals prepared by our private chef using locally sourced, fresh ingredients. From spiced fish curry in banana leaf to appam with stew at sunrise — every meal at HotelB is a culinary journey.',
    highlights: ['Traditional Kerala Sadya', 'Freshwater fish specialities', 'Sunrise breakfast on water', 'Sunset cocktail hour'],
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200&auto=format&fit=crop',
    tag: 'Chef\'s Special',
    tagColor: 'bg-tertiary text-white',
  },
  {
    id: 'pool',
    category: 'Recreation',
    icon: 'pool',
    title: 'Infinity Pool & Water Sports',
    subtitle: 'Plunge into pure luxury',
    description:
      'Our properties feature stunning infinity pools overlooking the backwaters. For the more adventurous, enjoy guided canoe rides, village cycling tours, and fishing expeditions with local fishermen at dawn.',
    highlights: ['Infinity pool with backwater view', 'Canoe & kayak hire', 'Village cycling tours', 'Dawn fishing with locals'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    tag: 'Adventure',
    tagColor: 'bg-[#1a6b4a] text-white',
  },
  {
    id: 'culture',
    category: 'Culture',
    icon: 'theater_comedy',
    title: 'Kathakali & Cultural Evenings',
    subtitle: 'Witness the living art of Kerala',
    description:
      'Immerse yourself in Kerala\'s rich cultural heritage with exclusive Kathakali dance performances, classical Mohiniyattam recitals, and traditional percussion concerts arranged just for our guests on the houseboat deck.',
    highlights: ['Private Kathakali performance', 'Chendamelam drum festival', 'Mohiniyattam dance recital', 'Temple procession tour'],
    image: 'https://images.unsplash.com/photo-1590736969596-3a6e0ef04a90?q=80&w=1200&auto=format&fit=crop',
    tag: 'Cultural',
    tagColor: 'bg-[#7c3d0f] text-white',
  },
  {
    id: 'nature',
    category: 'Nature',
    icon: 'eco',
    title: 'Wildlife & Eco Trails',
    subtitle: 'Into the untouched wilderness',
    description:
      'Venture beyond the backwaters to Kerala\'s lush highlands. Join our guided nature walks through Periyar Wildlife Sanctuary, spot migratory birds at Kumarakom Bird Sanctuary, or trek through spice plantation trails in Munnar.',
    highlights: ['Periyar Wildlife Safari', 'Kumarakom bird watching', 'Spice plantation walk', 'Waterfall trekking'],
    image: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=1200&auto=format&fit=crop',
    tag: 'Eco Experience',
    tagColor: 'bg-[#2d6a1f] text-white',
  },
];

const STATS = [
  { value: '15+', label: 'Years of Hospitality', icon: 'military_tech' },
  { value: '5,000+', label: 'Happy Guests', icon: 'favorite' },
  { value: '4.9★', label: 'Average Rating', icon: 'star' },
  { value: '12', label: 'Luxury Properties', icon: 'villa' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Menon',
    location: 'Bangalore, India',
    rating: 5,
    text: 'The houseboat experience at HotelB was absolutely magical. Waking up to the sounds of the backwaters and having freshly made Kerala breakfast was something I\'ll never forget.',
    avatar: 'P',
  },
  {
    name: 'James & Sarah Collins',
    location: 'London, UK',
    rating: 5,
    text: 'The Ayurvedic spa sessions were transformative. The staff\'s warmth and professionalism made us feel completely at home. We\'re already planning our next visit!',
    avatar: 'J',
  },
  {
    name: 'Rahul Sharma',
    location: 'Mumbai, India',
    rating: 5,
    text: 'The private chef prepared the most authentic Kerala cuisine I\'ve ever tasted. Watching the Kathakali performance on deck under the stars was truly unforgettable.',
    avatar: 'R',
  },
];

const Experiences = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Signature Stay', 'Wellness', 'Culinary', 'Recreation', 'Culture', 'Nature'];

  const filtered = activeCategory === 'All'
    ? EXPERIENCES
    : EXPERIENCES.filter(e => e.category === activeCategory);

  return (
    <main className="bg-background">

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDwbEwt9LtXTkSvhyhaZ38VUTq0rxaZSJaFOJ5YRq5rOON5_ViFGy4Nz_MTfUUGbxoG0bYHQGjwyDHgWqI2IMQoS1fEQYSr2BPphSRaz2UJarvjjuD6_QOsRGqoXFEvlDBAJGz_9lThE0DtqlE-l_Dmy1kiKdqnNHOrRfycCGG-4EzmI0vk1TvXvDroZm7BfEspj94c63U0Gz0XYXNK3CBwG3sVbzhIlX-uN8YJ9IU2iIsBCWl1VRzUzzfQs5gH7np_KvsjwWkRUjA')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        <div className="relative z-10 text-center px-5 md:px-16 max-w-4xl mx-auto">
          <span className="inline-block bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-white/20 mb-6">
            HotelB · Kerala
          </span>
          <h1 className="font-headline text-4xl md:text-6xl text-white font-semibold mb-6 leading-tight">
            Every Stay, an<br />
            <span style={{ color: '#95d4b5' }}>Unforgettable Story</span>
          </h1>
          <p className="font-body text-white/85 max-w-2xl mx-auto leading-relaxed text-base md:text-lg mb-10">
            From serene houseboat drifts through the Alleppey backwaters to ancient Ayurvedic healing rituals — HotelB curates experiences that touch the soul.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/stays"
              className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              Explore Stays
            </Link>
            <a
              href="#experiences"
              className="border border-white/40 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Our Experiences
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-primary py-10">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="material-symbols-outlined text-[#95d4b5] text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {stat.icon}
                </span>
                <p className="font-headline text-3xl text-white font-bold mb-1">{stat.value}</p>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience Filter + Grid ───────────────────────────────────────── */}
      <section id="experiences" className="py-20 px-5 md:px-16 max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">What We Offer</span>
          <h2 className="font-headline text-4xl md:text-5xl text-primary font-semibold mt-3 mb-4">
            Curated Experiences
          </h2>
          <p className="text-secondary text-sm max-w-2xl mx-auto leading-relaxed">
            Each experience at HotelB is thoughtfully designed to connect you with Kerala's soul — its waters, its people, its flavours, and its spirit.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-md scale-105'
                  : 'bg-white border border-secondary-container/40 text-secondary hover:border-primary/30 hover:text-primary hover:shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((exp, idx) => (
            <article
              key={exp.id}
              className="group bg-white rounded-2xl overflow-hidden border border-secondary-container/30 hover:border-primary/20 shadow-soft hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Tags */}
                <span className={`absolute top-4 left-4 ${exp.tagColor} text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm`}>
                  {exp.tag}
                </span>
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  {exp.category}
                </span>
                {/* Icon overlay */}
                <div className="absolute bottom-4 left-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {exp.icon}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider mb-1">{exp.subtitle}</p>
                <h3 className="font-headline text-xl text-primary font-semibold mb-3 leading-tight">{exp.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-5 flex-grow">{exp.description}</p>

                {/* Highlights */}
                <div className="space-y-2 mb-6">
                  {exp.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-xs text-secondary font-medium">{h}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/stays"
                  className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary hover:text-on-primary text-primary border border-primary/20 hover:border-primary py-3 rounded-xl font-bold text-xs transition-all duration-300 group/btn cursor-pointer"
                >
                  Book This Experience
                  <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f7faf8]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Guest Stories</span>
            <h2 className="font-headline text-4xl text-primary font-semibold mt-3">Words from Our Guests</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-secondary-container/30 shadow-soft hover:shadow-lg transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {Array(t.rating).fill(0).map((_, si) => (
                    <span key={si} className="material-symbols-outlined text-[#C89B3C] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-secondary text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-sm">{t.name}</p>
                    <p className="text-secondary text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary text-on-primary">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <span className="material-symbols-outlined text-[#95d4b5] text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            directions_boat
          </span>
          <h2 className="font-headline text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
            Ready to Begin Your<br />Kerala Journey?
          </h2>
          <p className="text-white/80 text-base leading-relaxed max-w-xl mx-auto mb-10">
            Every moment at HotelB is crafted to create memories that last a lifetime. Book your stay today and let the backwaters of Kerala tell your story.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/stays"
              className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-sm hover:bg-[#95d4b5] hover:text-primary transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
              Browse All Stays
            </Link>
            <Link
              to="/help-support"
              className="border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-white/10 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Experiences;
