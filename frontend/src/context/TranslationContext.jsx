import React, { createContext, useState, useEffect, useContext } from 'react';

const TranslationContext = createContext();

const translations = {
  English: {
    // Navbar
    destinations: "Destinations",
    stays: "Stays",
    about_us: "About Us",
    login: "Login",
    book_now: "Book Now",
    admin_dashboard: "Admin Dashboard",
    my_profile: "My Profile",
    my_bookings: "My Bookings",
    wishlist: "Wishlist",
    notifications: "Notifications",
    settings: "Settings",
    help_support: "Help & Support",
    logout: "Logout",
    
    // Home Hero
    hero_title: "Experience Serenity in the Heart of Kerala",
    hero_subtitle: "Traditional Charm Meets Modern Comfort",
    destination: "Destination",
    check_in: "Check-in",
    check_out: "Check-out",
    guests: "Guests",
    search: "Search",
    
    // Filters & Stays
    filters: "Filters",
    price_range: "Price Range",
    property_type: "Property Type",
    amenities: "Amenities",
    clear_all: "Clear All Filters",
    stays_found: "luxury stays found",
    sort: "Sort",
    recommended: "Recommended",
    price_low_high: "Price: Low to High",
    price_high_low: "Price: High to Low",
    top_rated: "Top Rated",
    no_stays_match: "No stays match your criteria",
    reset_filters: "Reset All Filters",
    
    // Wishlist
    wishlist_title: "Wishlist",
    wishlist_collection: "Your Collection",
    wishlist_desc: "Your curated selection of dream houseboat stays and experiences.",
    wishlist_empty: "Your wishlist is empty",
    explore_stays: "Explore Stays",
    
    // Settings
    settings_title: "Settings",
    settings_desc: "Manage your account settings and preferences.",
    preferences: "Preferences",
    security_account: "Security & Account",
    save_preferences: "Save Preferences",
    appearance: "Appearance",
    language: "Language",
    currency: "Currency",
    measurement_system: "Measurement System",
    metric: "Metric (km, kg, °C)",
    imperial: "Imperial (mi, lb, °F)",
    autoplay_animations: "Auto-play Animations",
    enable_transitions: "Enable interface transitions and micro-animations"
  },
  Malayalam: {
    // Navbar
    destinations: "ലക്ഷ്യസ്ഥാനങ്ങൾ",
    stays: "താമസങ്ങൾ",
    about_us: "ഞങ്ങളെക്കുറിച്ച്",
    login: "പ്രവേശിക്കുക",
    book_now: "ബുക്ക് ചെയ്യുക",
    admin_dashboard: "അഡ്മിൻ ഡാഷ്‌ബോർഡ്",
    my_profile: "എന്റെ പ്രൊഫൈൽ",
    my_bookings: "എന്റെ ബുക്കിംഗുകൾ",
    wishlist: "പ്രിയപ്പെട്ടവ",
    notifications: "അറിയിപ്പുകൾ",
    settings: "ക്രമീകരണങ്ങൾ",
    help_support: "സഹായവും പിന്തുണയും",
    logout: "പുറത്തുകടക്കുക",
    
    // Home Hero
    hero_title: "കേരളത്തിന്റെ ഹൃദയഭാഗത്ത് ശാന്തത അനുഭവിക്കൂ",
    hero_subtitle: "പരമ്പരാഗത ചാരുതയും ആധുനിക സൗകര്യങ്ങളും",
    destination: "ലക്ഷ്യസ്ഥാനം",
    check_in: "ചെക്ക്-ഇൻ",
    check_out: "ചെക്ക്-ഔട്ട്",
    guests: "അതിഥികൾ",
    search: "തിരയുക",
    
    // Filters & Stays
    filters: "ഫിൽട്ടറുകൾ",
    price_range: "നിരക്ക് പരിധി",
    property_type: "പ്രോപ്പർട്ടി തരം",
    amenities: "സൗകര്യങ്ങൾ",
    clear_all: "ഫിൽട്ടറുകൾ ഒഴിവാക്കുക",
    stays_found: "ലക്ഷ്വറി താമസങ്ങൾ കണ്ടെത്തി",
    sort: "ക്രമീകരിക്കുക",
    recommended: "ശുപാർശ ചെയ്യുന്നത്",
    price_low_high: "നിരക്ക്: കുറഞ്ഞതിൽ നിന്ന് കൂടിയതിലേക്ക്",
    price_high_low: "നിരക്ക്: കൂടിയതിൽ നിന്ന് കുറഞ്ഞതിലേക്ക്",
    top_rated: "മികച്ച റേറ്റിംഗ്",
    no_stays_match: "നിങ്ങൾ തിരഞ്ഞെടുത്തവയ്ക്ക് അനുയോജ്യമായ താമസങ്ങളില്ല",
    reset_filters: "എല്ലാ ഫിൽട്ടറുകളും പുനഃക്രമീകരിക്കുക",
    
    // Wishlist
    wishlist_title: "പ്രിയപ്പെട്ടവ",
    wishlist_collection: "നിങ്ങളുടെ ശേഖരം",
    wishlist_desc: "നിങ്ങൾ തിരഞ്ഞെടുത്ത മനോഹരമായ ഹൗസ്ബോട്ട് താമസങ്ങളും അനുഭവങ്ങളും.",
    wishlist_empty: "പ്രിയപ്പെട്ടവയുടെ പട്ടിക ശൂന്യമാണ്",
    explore_stays: "താമസങ്ങൾ കാണുക",
    
    // Settings
    settings_title: "ക്രമീകരണങ്ങൾ",
    settings_desc: "നിങ്ങളുടെ അക്കൗണ്ട് ക്രമീകരണങ്ങളും മുൻഗണനകളും നിയന്ത്രിക്കുക.",
    preferences: "മുൻഗണനകൾ",
    security_account: "സുരക്ഷയും അക്കൗണ്ടും",
    save_preferences: "മുൻഗണനകൾ സംരക്ഷിക്കുക",
    appearance: "രൂപം (തീം)",
    language: "ഭാഷ",
    currency: "കറൻസി",
    measurement_system: "അളവുപদ্ধതി",
    metric: "മെട്രിക് (കി.മീ, കിലോ, °C)",
    imperial: "ഇംപീരിയൽ (മൈൽ, പൗണ്ട്, °F)",
    autoplay_animations: "ആനിമേഷനുകൾ",
    enable_transitions: "ആനിമേഷനുകളും മാറ്റങ്ങളും സജീവമാക്കുക"
  },
  Hindi: {
    // Navbar
    destinations: "गंतव्य स्थान",
    stays: "रहने की जगहें",
    about_us: "हमारे बारे में",
    login: "लॉग इन करें",
    book_now: "अभी बुक करें",
    admin_dashboard: "एडमिन डैशबोर्ड",
    my_profile: "मेरी प्रोफ़ाइल",
    my_bookings: "मेरी बुकिंग",
    wishlist: "पसंदीदा",
    notifications: "सूचनाएं",
    settings: "सेटिंग्स",
    help_support: "सहायता और समर्थन",
    logout: "लॉग आउट",
    
    // Home Hero
    hero_title: "केरल के हृदय में शांति का अनुभव करें",
    hero_subtitle: "पारंपरिक आकर्षण और आधुनिक आराम का संगम",
    destination: "गंतव्य",
    check_in: "चेक-इन",
    check_out: "चेक-आउट",
    guests: "अतिथि",
    search: "खोजें",
    
    // Filters & Stays
    filters: "फ़िल्टर",
    price_range: "मूल्य सीमा",
    property_type: "संपत्ति का प्रकार",
    amenities: "सुविधाएं",
    clear_all: "सभी फ़िल्टर साफ़ करें",
    stays_found: "लक्ज़री स्थान मिले",
    sort: "क्रमबद्ध करें",
    recommended: "अनुशंसित",
    price_low_high: "मूल्य: कम से अधिक",
    price_high_low: "मूल्य: अधिक से कम",
    top_rated: "शीर्ष रेटेड",
    no_stays_match: "आपकी आवश्यकताओं के अनुसार कोई स्थान नहीं मिला",
    reset_filters: "सभी फ़िल्टर रीसेट करें",
    
    // Wishlist
    wishlist_title: "पसंदीदा सूची",
    wishlist_collection: "आपका संग्रह",
    wishlist_desc: "आपके पसंदीदा हाउस बोट और अनुभवों का चुनिंदा संग्रह।",
    wishlist_empty: "आपकी पसंदीदा सूची खाली है",
    explore_stays: "स्थानों की खोज करें",
    
    // Settings
    settings_title: "सेटिंग्स",
    settings_desc: "अपने खाते की सेटिंग्स और प्राथमिकताओं को प्रबंधित करें।",
    preferences: "प्राथमिकताएं",
    security_account: "सुरक्षा और खाता",
    save_preferences: "प्राथमिकताएं सहेजें",
    appearance: "प्रकटन (थीम)",
    language: "भाषा",
    currency: "मुद्रा",
    measurement_system: "मापन प्रणाली",
    metric: "मीट्रिक (किमी, किग्रा, °C)",
    imperial: "इंपीरियल (मील, पाउंड, °F)",
    autoplay_animations: "ऑटो-प्ले एनिमेशन",
    enable_transitions: "इंटरफ़ेस एनिमेशन चालू करें"
  }
};

// Map Tamil and Kannada to English for safety
translations.Tamil = translations.English;
translations.Kannada = translations.English;

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('hotelb_language') || 'English'
  );

  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem('hotelb_language') || 'English';
      setCurrentLanguage(savedLanguage);
    };
    window.addEventListener('languageUpdated', handleLanguageChange);
    return () => window.removeEventListener('languageUpdated', handleLanguageChange);
  }, []);

  const t = (key) => {
    const langDict = translations[currentLanguage] || translations.English;
    return langDict[key] || translations.English[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
