import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import StayCard from '../components/StayCard';
import { useTranslation } from '../context/TranslationContext';

// ── Price bracket options ──────────────────────────────────────────────────
const PRICE_OPTIONS = [
  { label: 'Under ₹1,500', value: 'under_1500', max: 1500, min: 0 },
  { label: '₹1,501 – ₹2,000', value: '1501_2000', max: 2000, min: 1501 },
  { label: '₹2,001 – ₹3,000', value: '2001_3000', max: 3000, min: 2001 },
  { label: '₹3,001 & Above', value: '3001_above', max: Infinity, min: 3001 },
];

// ── Rating bracket options ─────────────────────────────────────────────────
const RATING_OPTIONS = [
  { label: '4.5 & above', value: 4.5 },
  { label: '4.0 & above', value: 4.0 },
  { label: '3.5 & above', value: 3.5 },
  { label: '3.0 & above', value: 3.0 },
];

const ITEMS_PER_PAGE = 6;

const Stays = () => {
  const { t } = useTranslation();
  const { API_URL } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allStays, setAllStays] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filter States ──────────────────────────────────────────────────────────
  const [selectedPriceBracket, setSelectedPriceBracket] = useState(null); // value string or null
  const [selectedRating, setSelectedRating] = useState(null); // min rating number or null
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('Recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const propertyTypes = ['Houseboats', 'Treehouses', 'Heritage Resorts', 'Boutique Villas'];
  const amenitiesList = [
    { key: 'pool', label: 'Infinity Pool' },
    { key: 'spa', label: 'Ayurvedic Spa' },
    { key: 'wifi', label: 'Complimentary Wi-Fi' },
    { key: 'restaurant', label: 'Private Chef / Dining' },
    { key: 'ac_unit', label: 'Air Conditioning' },
  ];

  // ── Fetch ALL stays (client-side filtering gives instant results) ───────────
  const fetchStays = async () => {
    try {
      setLoading(true);
      const params = {};
      const location = searchParams.get('location');
      if (location) params.location = location;
      const res = await axios.get(`${API_URL}/stays`, { params });
      if (res.data.success) {
        setAllStays(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStays();
  }, [searchParams]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriceBracket, selectedRating, selectedTypes, selectedAmenities, sortBy]);

  // ── Client-side filter + sort ──────────────────────────────────────────────
  const filteredStays = useMemo(() => {
    let result = [...allStays];

    // Price bracket filter
    if (selectedPriceBracket) {
      const bracket = PRICE_OPTIONS.find(o => o.value === selectedPriceBracket);
      if (bracket) {
        result = result.filter(s => s.basePrice >= bracket.min && s.basePrice <= bracket.max);
      }
    }

    // Rating filter
    if (selectedRating !== null) {
      result = result.filter(s => (s.rating || 0) >= selectedRating);
    }

    // Property type filter
    if (selectedTypes.length > 0) {
      result = result.filter(s => selectedTypes.includes(s.category));
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      result = result.filter(s =>
        selectedAmenities.every(a => s.amenities?.includes(a))
      );
    }

    // Sort
    switch (sortBy) {
      case 'Price: Low to High':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'Top Rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return result;
  }, [allStays, selectedPriceBracket, selectedRating, selectedTypes, selectedAmenities, sortBy]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredStays.length / ITEMS_PER_PAGE);
  const paginatedStays = filteredStays.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchBarSearch = (params) => {
    const newParams = {};
    if (params.location) newParams.location = params.location;
    if (params.checkIn) newParams.checkIn = params.checkIn;
    if (params.checkOut) newParams.checkOut = params.checkOut;
    if (params.guests) newParams.guests = params.guests;
    setSearchParams(newParams);
  };

  const handleTypeChange = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAmenityChange = (amenityKey) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityKey) ? prev.filter(a => a !== amenityKey) : [...prev, amenityKey]
    );
  };

  const clearFilters = () => {
    setSelectedPriceBracket(null);
    setSelectedRating(null);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setSortBy('Recommended');
  };

  const hasActiveFilters =
    selectedPriceBracket || selectedRating !== null || selectedTypes.length > 0 || selectedAmenities.length > 0;

  // ── Radio Group helper ─────────────────────────────────────────────────────
  const RadioGroup = ({ label, options, selected, onSelect, valueKey = 'value', labelKey = 'label' }) => (
    <div className="mb-8">
      <h4 className="font-body font-bold text-on-surface mb-4 text-xs uppercase tracking-wider">{label}</h4>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const val = opt[valueKey];
          const isSelected = selected === val;
          return (
            <label key={val} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => onSelect(isSelected ? null : val)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isSelected ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span
                onClick={() => onSelect(isSelected ? null : val)}
                className={`text-sm transition-colors cursor-pointer ${
                  isSelected ? 'text-primary font-semibold' : 'text-secondary group-hover:text-primary'
                }`}
              >
                {opt[labelKey]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-16 py-10">
      {/* Search Bar */}
      <section className="mb-10">
        <SearchBar
          onSearch={handleSearchBarSearch}
          initialValues={{
            location: searchParams.get('location') || '',
            checkIn: searchParams.get('checkIn') || '',
            checkOut: searchParams.get('checkOut') || '',
            guests: searchParams.get('guests') || '',
          }}
        />
      </section>

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
            Kerala's Finest
          </span>
          <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-2 leading-tight">
            Luxury<br />
            <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Stays
            </span>
          </h1>
          <p className="text-secondary text-sm">
            Discover our curated collection of premium houseboats, heritage resorts, and boutique villas.
          </p>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* ── Sidebar Filters ────────────────────────────────────────────────── */}
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 md:sticky md:top-24 space-y-0`}>
          <div className="bg-white rounded-2xl border border-secondary-container/40 p-6 shadow-soft">

            {/* Filters Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-lg text-primary font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                {t('filters')}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Budget Per Night */}
            <RadioGroup
              label="Budget Per Night"
              options={PRICE_OPTIONS}
              selected={selectedPriceBracket}
              onSelect={setSelectedPriceBracket}
            />

            {/* Divider */}
            <div className="border-t border-outline-variant/20 mb-6" />

            {/* User Rating */}
            <RadioGroup
              label="User Rating"
              options={RATING_OPTIONS.map(r => ({ value: r.value, label: r.label }))}
              selected={selectedRating}
              onSelect={(val) => setSelectedRating(val === null ? null : Number(val))}
            />

            {/* Divider */}
            <div className="border-t border-outline-variant/20 mb-6" />

            {/* Property Type */}
            <div className="mb-8">
              <h4 className="font-body font-bold text-on-surface mb-4 text-xs uppercase tracking-wider">
                {t('property_type')}
              </h4>
              <div className="space-y-2.5">
                {propertyTypes.map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => handleTypeChange(type)}
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${
                        selectedTypes.includes(type)
                          ? 'border-primary bg-primary'
                          : 'border-outline-variant group-hover:border-primary'
                      }`}
                    >
                      {selectedTypes.includes(type) && (
                        <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                          check
                        </span>
                      )}
                    </div>
                    <span
                      onClick={() => handleTypeChange(type)}
                      className={`text-sm transition-colors cursor-pointer ${
                        selectedTypes.includes(type) ? 'text-primary font-semibold' : 'text-secondary group-hover:text-primary'
                      }`}
                    >
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-outline-variant/20 mb-6" />

            {/* Amenities */}
            <div className="mb-2">
              <h4 className="font-body font-bold text-on-surface mb-4 text-xs uppercase tracking-wider">
                {t('amenities')}
              </h4>
              <div className="space-y-2.5">
                {amenitiesList.map((amenity) => (
                  <label key={amenity.key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => handleAmenityChange(amenity.key)}
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${
                        selectedAmenities.includes(amenity.key)
                          ? 'border-primary bg-primary'
                          : 'border-outline-variant group-hover:border-primary'
                      }`}
                    >
                      {selectedAmenities.includes(amenity.key) && (
                        <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                          check
                        </span>
                      )}
                    </div>
                    <span
                      onClick={() => handleAmenityChange(amenity.key)}
                      className={`text-sm transition-colors cursor-pointer ${
                        selectedAmenities.includes(amenity.key) ? 'text-primary font-semibold' : 'text-secondary group-hover:text-primary'
                      }`}
                    >
                      {amenity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Results Column ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Sort + View Toggle Bar */}
          <div className="flex justify-between items-center mb-6 bg-white px-5 py-3.5 rounded-xl border border-secondary-container/40 shadow-soft">
            <p className="font-body text-sm text-secondary font-medium">
              <span className="font-bold text-on-surface">{filteredStays.length}</span>{' '}
              {t('stays_found')}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-secondary uppercase tracking-widest font-semibold hidden sm:block">
                  {t('sort')}:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none font-semibold text-sm focus:ring-0 cursor-pointer text-primary p-0 pr-6 outline-none"
                >
                  <option value="Recommended">{t('recommended')}</option>
                  <option value="Price: Low to High">{t('price_low_high')}</option>
                  <option value="Price: High to Low">{t('price_high_low')}</option>
                  <option value="Top Rated">{t('top_rated')}</option>
                </select>
              </div>
              <div className="h-5 w-px bg-outline-variant" />
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-secondary hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedPriceBracket && (
                <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {PRICE_OPTIONS.find(o => o.value === selectedPriceBracket)?.label}
                  <button onClick={() => setSelectedPriceBracket(null)} className="hover:text-error cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              )}
              {selectedRating !== null && (
                <span className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {RATING_OPTIONS.find(r => r.value === selectedRating)?.label}
                  <button onClick={() => setSelectedRating(null)} className="hover:text-error cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              )}
              {selectedTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {t}
                  <button onClick={() => handleTypeChange(t)} className="hover:text-error cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              {selectedAmenities.map(a => {
                const found = amenitiesList.find(al => al.key === a);
                return (
                  <span key={a} className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                    {found?.label || a}
                    <button onClick={() => handleAmenityChange(a)} className="hover:text-error cursor-pointer">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Cards Grid / List / Empty */}
          {loading ? (
            <div className="text-center py-24">
              <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary inline-block" />
            </div>
          ) : paginatedStays.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-outline-variant/30 shadow-soft">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">search_off</span>
              <h3 className="font-headline text-xl text-primary mb-2 font-medium">{t('no_stays_match')}</h3>
              <p className="text-secondary text-sm mb-6">Try clearing some filters or searching for another destination.</p>
              <button
                onClick={clearFilters}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all text-sm"
              >
                {t('reset_filters')}
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'flex flex-col gap-5'}>
                {paginatedStays.map((stay) => (
                  <div key={stay._id}>
                    {viewMode === 'list' ? (
                      <div
                        onClick={() => navigate(`/stays/${stay._id}`)}
                        className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-secondary-container/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      >
                        <div className="md:w-2/5 relative h-48 md:h-full overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={stay.image}
                            alt={stay.title}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                        </div>
                        <div className="md:w-3/5 p-6 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">{stay.category}</span>
                            <div className="flex justify-between items-start mt-1 mb-2">
                              <h3 className="font-headline text-xl text-primary font-medium line-clamp-1">{stay.title}</h3>
                              <div className="flex items-center text-[#C89B3C] shrink-0 ml-2">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="font-bold ml-1 text-sm">{stay.rating?.toFixed(1)}</span>
                              </div>
                            </div>
                            <p className="text-on-surface-variant text-xs mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {stay.location}
                            </p>
                            <p className="text-secondary text-sm line-clamp-2 mt-2 leading-relaxed">{stay.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/10">
                            <div>
                              <span className="text-[10px] text-secondary uppercase font-semibold">from</span>
                              <p className="font-headline text-lg text-primary font-semibold">
                                ₹{stay.basePrice.toLocaleString('en-IN')}
                                <span className="text-xs font-normal text-secondary ml-1">/night</span>
                              </p>
                            </div>
                            <button className="bg-primary text-on-primary px-5 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-all">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <StayCard stay={stay} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Pagination ──────────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-outline-variant/40 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">chevron_left</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isClose = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                    if (!isClose) {
                      if (page === 2 && currentPage > 4) return <span key="ellipsis-start" className="text-secondary text-sm px-1">…</span>;
                      if (page === totalPages - 1 && currentPage < totalPages - 3) return <span key="ellipsis-end" className="text-secondary text-sm px-1">…</span>;
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-primary text-on-primary shadow-md'
                            : 'border border-outline-variant/40 text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary/30'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-outline-variant/40 flex items-center justify-center hover:bg-primary/5 hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">chevron_right</span>
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center text-xs text-secondary mt-3">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredStays.length)} of {filteredStays.length} stays
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Stays;
