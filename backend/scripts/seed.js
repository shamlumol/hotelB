const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Stay = require('../models/Stay');
const Experience = require('../models/Experience');
const Booking = require('../models/Booking');

dotenv.config();

const originalStays = [
  {
    title: "Amber Shore Houseboat",
    description: "A Sanctuary on the Water",
    category: "Houseboats",
    location: "Alleppey, Kerala",
    basePrice: 1850,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwxH8SCQbylSt9lK_hfgMl69WzKb76T0Sf9mQdm_-qNaij8CoBfxc0BIRorqmWws8Esv7MeCwfN7h8HtrSl6g18HhGXW8PiNP0yNv1QYQfmjHMs8JWZEVKsEGquBfhdICngErkU6WEmpu9ZU5NMk_OcAfN4Z9IMUAy1CLS-I9lSl8vKoX5vd7CBkvUabXM4vGAcgdsoWrI5Jh4GjApLHhdCoco73tcpLA4JF1WTlkVZPVpy9teeJpm5IZI_FZgKB4SD0gCIkK9dZM",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwxH8SCQbylSt9lK_hfgMl69WzKb76T0Sf9mQdm_-qNaij8CoBfxc0BIRorqmWws8Esv7MeCwfN7h8HtrSl6g18HhGXW8PiNP0yNv1QYQfmjHMs8JWZEVKsEGquBfhdICngErkU6WEmpu9ZU5NMk_OcAfN4Z9IMUAy1CLS-I9lSl8vKoX5vd7CBkvUabXM4vGAcgdsoWrI5Jh4GjApLHhdCoco73tcpLA4JF1WTlkVZPVpy9teeJpm5IZI_FZgKB4SD0gCIkK9dZM"
    ],
    rating: 4.9,
    reviewsCount: 124,
    amenities: ["ac_unit", "restaurant", "wifi", "spa", "pool", "chef"],
    featured: true,
    overview: "Drift into a world where time slows down. Amber Shore Houseboat offers a poetic escape through the winding backwaters of Alleppey. Crafted from sustainable teak and jackfruit wood, this floating villa blends the heritage of Kettuvalam craftsmanship with contemporary luxury.",
    rooms: [
      {
        title: "Grand Horizon Suite",
        details: "420 sq ft • Private Balcony • Rain Shower",
        price: 1850,
        originalPrice: 2400,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6mWur_cU1UbdNU30YRMpRYV3Oh8Ji6pN-2u5hfWZ3y5tLL1wauQ_rs-HTe-pPLaSqxBpjJx-9ht1R5pjz9w34qqMn2kuuDEQJi_OMfDn9J30IIO7moC9QngUa9Mf3s9cGI4rrK3KgXEoIJ-zB6wXk5lZ78iTC0N4LLNAMqyEPqEKBCoQKJdIFBWRSsEKjOuNvfyZFc_ozbTtSPAb8ngR3z4peVt_23x2_A6R8Oo1GvHGA16dX12fE8Crc3jhdvmzTPVBbWiynzoY"
      }
    ],
    reviews: []
  },
  {
    title: "Tea Mist Heritage",
    description: "Serene Highlands & Mist Valley",
    category: "Heritage Resorts",
    location: "Munnar, Kerala",
    basePrice: 2400,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArmYrp2uzpVAVXip-SlcYrafZUbz1vLp284mc5F0rMMtAYBToyjyWhqihbI8UkNaca3X3Vp75-TthAIgQ0PjR6M81F8Z03FSXipIklB6IZBuY-kRx6eTIFVR3MdIPeumURzTchcFz3KM8sPG2IqZ5R4Rn2Jg6aGEV9e2gp1yg81yYdrmp3o2fTXY78-3d1EdQ6tcc2jXQaRItb_g3vnX9DbiOzXHQLIAMsiywvXz5kBSUaHrzAD4O3w7TgZThsAYD7oOc9ukqKX7A",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuArmYrp2uzpVAVXip-SlcYrafZUbz1vLp284mc5F0rMMtAYBToyjyWhqihbI8UkNaca3X3Vp75-TthAIgQ0PjR6M81F8Z03FSXipIklB6IZBuY-kRx6eTIFVR3MdIPeumURzTchcFz3KM8sPG2IqZ5R4Rn2Jg6aGEV9e2gp1yg81yYdrmp3o2fTXY78-3d1EdQ6tcc2jXQaRItb_g3vnX9DbiOzXHQLIAMsiywvXz5kBSUaHrzAD4O3w7TgZThsAYD7oOc9ukqKX7A"],
    rating: 4.8,
    reviewsCount: 94,
    amenities: ["pool", "spa", "local_parking", "wifi"],
    featured: true,
    overview: "Perched high in the misty hills of Munnar, Tea Mist Heritage is a colonial mansion restored with precision.",
    rooms: [
      {
        title: "Highland View Manor",
        details: "550 sq ft • Private Fireplace • Mountain View",
        price: 2400,
        originalPrice: 3000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArmYrp2uzpVAVXip-SlcYrafZUbz1vLp284mc5F0rMMtAYBToyjyWhqihbI8UkNaca3X3Vp75-TthAIgQ0PjR6M81F8Z03FSXipIklB6IZBuY-kRx6eTIFVR3MdIPeumURzTchcFz3KM8sPG2IqZ5R4Rn2Jg6aGEV9e2gp1yg81yYdrmp3o2fTXY78-3d1EdQ6tcc2jXQaRItb_g3vnX9DbiOzXHQLIAMsiywvXz5kBSUaHrzAD4O3w7TgZThsAYD7oOc9ukqKX7A"
      }
    ],
    reviews: []
  },
  {
    title: "Banyan Canopy Lodge",
    description: "Jungle Sanctuary in the Wilds",
    category: "Treehouses",
    location: "Wayanad, Kerala",
    basePrice: 2800,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI91jLICZm45HbB1bvfrXpuLF9_DSPx1xuE1_HPgYGbI9xf-kPOpBaqRf65f_YZoQwdmLQUiCzXV4ex8fhqaC7OfB7Pt-xfbZ1ZD8FbnXfMIf4_AX26yTwXZt3D2-jGRGebEFvmAmr7xDKgrL48qrfD1zv_fJG8aWDPuKb53qi57KN_I4eAdqeZy6JgTob8hvKVaZ7mQHdRXv4tFTAGbBBQDVf-euieMtA5BcelKSUA4xF_AB-ZxrTuM9gyJ5ZQR-XAr9lwRI_0K4",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDI91jLICZm45HbB1bvfrXpuLF9_DSPx1xuE1_HPgYGbI9xf-kPOpBaqRf65f_YZoQwdmLQUiCzXV4ex8fhqaC7OfB7Pt-xfbZ1ZD8FbnXfMIf4_AX26yTwXZt3D2-jGRGebEFvmAmr7xDKgrL48qrfD1zv_fJG8aWDPuKb53qi57KN_I4eAdqeZy6JgTob8hvKVaZ7mQHdRXv4tFTAGbBBQDVf-euieMtA5BcelKSUA4xF_AB-ZxrTuM9gyJ5ZQR-XAr9lwRI_0K4"],
    rating: 5.0,
    reviewsCount: 56,
    amenities: ["nature_people", "breakfast_dining", "wifi"],
    featured: false,
    overview: "Live within the rainforest canopy. Built entirely from locally-sourced bamboo and cedar.",
    rooms: [
      {
        title: "Canopy Treehouse Room",
        details: "350 sq ft • Suspended Deck • Glass Windows",
        price: 2800,
        originalPrice: 3500,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI91jLICZm45HbB1bvfrXpuLF9_DSPx1xuE1_HPgYGbI9xf-kPOpBaqRf65f_YZoQwdmLQUiCzXV4ex8fhqaC7OfB7Pt-xfbZ1ZD8FbnXfMIf4_AX26yTwXZt3D2-jGRGebEFvmAmr7xDKgrL48qrfD1zv_fJG8aWDPuKb53qi57KN_I4eAdqeZy6JgTob8hvKVaZ7mQHdRXv4tFTAGbBBQDVf-euieMtA5BcelKSUA4xF_AB-ZxrTuM9gyJ5ZQR-XAr9lwRI_0K4"
      }
    ],
    reviews: []
  },
  {
    title: "Vembanad Vista Resort",
    description: "Luxury Lakeside Retreat",
    category: "Boutique Villas",
    location: "Kumarakom, Kerala",
    basePrice: 3200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWkrC1NK7OBKWgOhjxupA98YsMQywTJi-oUcUZvjHUMa9xcy5g7GW4tBTuHh5G4hn-5UCRpvuxbV6_qPHXYzr2LnDVivuqPmGhdxTKN3X62gxwrw7kX5sQDAgMiSgd1n_b78w7xWvWgemnJFgAFUhu4S5N7_HxotkW474RuGhnKmgyfXMVpByFDcn0Oq7K_PO9SgSGEfFlEXLAFHCi5b9E4bTXMUO1_CUmRCGKlyx_j4ddovKPnKzNYwwrV8IS9JWEhSMWk43jDb4",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBWkrC1NK7OBKWgOhjxupA98YsMQywTJi-oUcUZvjHUMa9xcy5g7GW4tBTuHh5G4hn-5UCRpvuxbV6_qPHXYzr2LnDVivuqPmGhdxTKN3X62gxwrw7kX5sQDAgMiSgd1n_b78w7xWvWgemnJFgAFUhu4S5N7_HxotkW474RuGhnKmgyfXMVpByFDcn0Oq7K_PO9SgSGEfFlEXLAFHCi5b9E4bTXMUO1_CUmRCGKlyx_j4ddovKPnKzNYwwrV8IS9JWEhSMWk43jDb4"],
    rating: 4.7,
    reviewsCount: 215,
    amenities: ["pool", "fitness_center", "directions_boat", "wifi"],
    featured: true,
    overview: "Overlooking the vast Vembanad Lake, this resort represents the height of Kumarakom luxury.",
    rooms: [
      {
        title: "Lakeside Luxury Villa",
        details: "650 sq ft • Private Pool • Lakefront View",
        price: 3200,
        originalPrice: 4000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWkrC1NK7OBKWgOhjxupA98YsMQywTJi-oUcUZvjHUMa9xcy5g7GW4tBTuHh5G4hn-5UCRpvuxbV6_qPHXYzr2LnDVivuqPmGhdxTKN3X62gxwrw7kX5sQDAgMiSgd1n_b78w7xWvWgemnJFgAFUhu4S5N7_HxotkW474RuGhnKmgyfXMVpByFDcn0Oq7K_PO9SgSGEfFlEXLAFHCi5b9E4bTXMUO1_CUmRCGKlyx_j4ddovKPnKzNYwwrV8IS9JWEhSMWk43jDb4"
      }
    ],
    reviews: []
  }
];

const extraHotelNames = [
  "Taj Bekal Resort and Spa", "The Leela Kovalam", "Kumarakom Lake Resort", "Grand Hyatt Kochi Bolgatty",
  "Taj Green Cove Resort and Spa", "Ramada Resort by Wyndham Kochi", "Taj Wayanad Resort and Spa",
  "Brunton Boatyard - CGH Earth", "The Lalit Resort and Spa Bekal", "Port Muziris - Tribute Portfolio Hotel",
  "Amal Tamara Ayurvedic Retreat", "Hyatt Regency Trivandrum", "Fragrant Nature Kochi", "The Malabar House",
  "Old Harbour Hotel", "Forte Kochi", "Eighth Bastion - CGH Earth", "Le Colonial 1506", "Kara",
  "Beach Gate Bungalows - CGH Earth", "The Postcard Mandalay Hall", "Kochi Marriott Hotel",
  "Vivanta Ernakulam - Marine Drive", "Le Méridien Kochi", "The Windsor Castle Leisure Hotel", "Tissa's Inn",
  "Windermere Estate", "Olive Eva", "NM Royale County", "Koder House", "Olive Brook", "Old Light House Bristow",
  "Daisyvilla Homestay", "Devonshire Greens", "Hotel Lake Palace", "Hotel Kabani International", "Kabani Regency",
  "Ayana Fort Kochi", "Fragrant Nature Munnar", "Hotel Samrat", "JK Residency Cheruvathur", "Hotel Samudra",
  "Geetha Residency", "Wayanad Wild", "Saj Earth Resort", "The Fog Resorts and Spa",
  "Munnar Tea Country Resort", "Lake Canopy Alleppey", "Varkala Cliff Villa", "Niraamaya Retreats Surya Samudra",
  "Poovar Island Resort", "Zuri Kumarakom", "Chittoor Kottaram - CGH Earth", "Spice Village - CGH Earth",
  "Coconut Lagoon - CGH Earth", "Cardamom County Thekkady", "Scenic Munnar Hills Resort", "Wayanad Silver Woods",
  "Vythiri Resort Wayanad", "Banasura Hill Resort", "Upavan Resort Wayanad", "Lake Palace Resort Alleppey",
  "Vasundhara Sarovar Premiere", "Kondai Lip Heritage Resort", "Lemon Tree Vembanad Lake Resort", "Backwater Ripples Kumarakom",
  "Elixir Hills Munnar", "Blanket Hotel and Spa Munnar", "Chandy's Windy Woods Munnar", "Scenic Valley Treehouse",
  "Panoramic Munnar Heights", "Wayanad Cliff Boutique Villa", "Whispering Waters Cochin", "Kochi Waterfront Pavilion",
  "Fragrant Nature Kollam", "The Raviz Ashtamudi Kollam", "Welcomhotel by ITC Hotels Kollam", "Estuary Sarovar Portico Poovar",
  "Isola Di Cocco Poovar", "Abad Turtle Beach Marari", "Marari Beach Resort - CGH Earth", "Carnoustie Ayurveda & Wellness Resort",
  "Deshadan Cliff Beach Resort Varkala", "Taj Gateway Hotel Marine Drive", "Trident Cochin", "Radisson Blu Kochi",
  "Crowne Plaza Kochi", "Flora Airport Hotel Kochi", "Kochi Palace Leisure Hotel", "Soma Palmshore Kovalam",
  "Uday Samudra Leisure Beach Hotel", "Turtle on the Beach Kovalam", "Travancore Heritage Beach Resort", "Kovalam Beach Haven",
  "Nattika Beach Ayurveda Resort", "Athirappilly Rain Forest Resort", "Samroha Resort Athirappilly", "Casa Maria Homestay Fort Kochi",
  "Spencer Home Heritage Fort Kochi", "Pepper Trail Wayanad", "Wayanad Treehouse Canopy", "Blue Ginger Spa Resort Wayanad",
  "Misty Mountain Resort Munnar", "Tall Trees Munnar"
];

// Curated set of high quality hotel images
const unsplashImages = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424ffe2?w=800",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
];

// Generate dynamic properties for 100+ stays
const generateStaysData = () => {
  const stays = [...originalStays];
  
  extraHotelNames.forEach((name, idx) => {
    // Determine category based on keyword in name, or alternate
    let category = "Heritage Resorts";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("houseboat") || nameLower.includes("cruise") || nameLower.includes("boatyard") || nameLower.includes("lake") || nameLower.includes("lagoon") || nameLower.includes("canopy")) {
      category = "Houseboats";
    } else if (nameLower.includes("treehouse") || nameLower.includes("canopy") || nameLower.includes("wild") || nameLower.includes("forest") || nameLower.includes("jungle")) {
      category = "Treehouses";
    } else if (nameLower.includes("villa") || nameLower.includes("boutique") || nameLower.includes("bungalow") || nameLower.includes("estate")) {
      category = "Boutique Villas";
    } else {
      const cats = ["Heritage Resorts", "Boutique Villas", "Houseboats", "Treehouses"];
      category = cats[idx % cats.length];
    }

    // Determine location based on keyword, or alternate
    let location = "Kochi, Ernakulam, Kerala";
    if (nameLower.includes("bekal")) {
      location = "Bekal, Kasaragod, Kerala";
    } else if (nameLower.includes("kovalam")) {
      location = "Kovalam, Thiruvananthapuram, Kerala";
    } else if (nameLower.includes("kumarakom")) {
      location = "Kumarakom, Kottayam, Kerala";
    } else if (nameLower.includes("munnar")) {
      location = "Munnar, Idukki, Kerala";
    } else if (nameLower.includes("wayanad") || nameLower.includes("vythiri") || nameLower.includes("banasura")) {
      location = "Wayanad, Kerala";
    } else if (nameLower.includes("varkala")) {
      location = "Varkala, Thiruvananthapuram, Kerala";
    } else if (nameLower.includes("kollam") || nameLower.includes("ashtamudi")) {
      location = "Kollam, Kerala";
    } else if (nameLower.includes("marari")) {
      location = "Mararikulam, Alleppey, Kerala";
    } else if (nameLower.includes("alleppey")) {
      location = "Alleppey, Kerala";
    } else {
      const locs = ["Kochi, Ernakulam, Kerala", "Munnar, Idukki, Kerala", "Wayanad, Kerala", "Alleppey, Kerala"];
      location = locs[idx % locs.length];
    }

    const basePrice = Math.floor(Math.random() * (3500 - 1500 + 1)) + 1500; // between 1500 and 3500
    const image = unsplashImages[idx % unsplashImages.length];
    const rating = parseFloat((Math.random() * 0.9 + 4.1).toFixed(1)); // 4.1 to 5.0
    const reviewsCount = Math.floor(Math.random() * 850) + 35; // 35 to 885

    const allAmenities = ["pool", "spa", "wifi", "restaurant", "ac_unit"];
    // assign 3 to 5 random amenities
    const numAmenities = Math.floor(Math.random() * 3) + 3;
    const amenities = allAmenities.slice(0, numAmenities);

    stays.push({
      title: name,
      description: `A stunning premium ${category} offering authentic Kerala hospitality and bespoke services in the heart of ${location.split(',')[0]}.`,
      category,
      location,
      basePrice,
      image,
      images: [image],
      rating,
      reviewsCount,
      amenities,
      featured: idx % 10 === 0, // make 10% featured
      overview: `Escape to ${name}, a premier ${category} situated in the lush landscapes of ${location}. Relax and unwind with traditional therapies, gourmet dining experiences, and personal concierge services designed to make your stay memorable.`,
      rooms: [
        {
          title: "Luxury Premium Room",
          details: "450 sq ft • Private Balcony • Nature View",
          price: basePrice,
          originalPrice: Math.round(basePrice * 1.3),
          image
        }
      ],
      reviews: []
    });
  });

  return stays;
};

const staysData = generateStaysData();

const experiencesData = [
  {
    title: "Private Backwater Houseboat Cruise",
    category: "WATER",
    description: "Navigate the labyrinthine waterways of Alleppey in a hand-crafted Kettuvalam. Experience the rhythm of life on the water while enjoying traditional Kerala cuisine prepared on board.",
    duration: "6 Hours",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSEf9dyOPjvyJQZFrtxrn42TKAxQhLrRQw1i4sHm_8YRoqdLOWqEaVu-Ur9TWGfd7WvC-x8vgWEI_suwrewUDyoh0rXC1o7GN4Dm5_VFrTB_c5D7WpnOCTBMzdGkcYSbBqgRyXTJUe_lhCyzdUWDR7f8_XfF5Dq19ZijApNNjOi-Zau19KITTIEnsbvNb_weRGFrPksen8lMZvgSy8KYuzBVhLiPDzw4HF9HkeGdXFSgOESBnZHeK0CS_VH1pKBDPTIxLhJ_tyOrA"
  },
  {
    title: "Traditional Ayurvedic Rejuvenation",
    category: "WELLNESS",
    description: "Restore balance with an authentic Shirodhara treatment. Guided by expert Vaidyas, this experience uses organic oils and herbs tailored to your body's specific constitution.",
    duration: "90 Minutes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEd7wwagEsYhZN0JGry7enGZLukLYc2OWStCpMBia3OTwgArSPoD9LY_tRAnNtMILwXsj7KTQBzLg4tW6P-TzYVnxANPE9H40km4CjvHHN2N8K-Vn7sqtoQkzGeAX42kUvmJzOteCJsfss-Tvm1ft4H7kWrk24zsXXntby-g7KHogWGrwhex4Ch_6yXWYLDCpnNC1Dh4DXz4yNivT4si9smo-d9u6JQCIwKGo1h74HJ54wtMGMo65jBjugiRsXnRgFeBcsrSBT7V4"
  },
  {
    title: "Kathakali Evening at the Temple",
    category: "CULTURE",
    description: "Witness the ancient art of storytelling through dance. Arrive early to observe the meticulous 'pacha' makeup ritual before the dramatic evening performance begins.",
    duration: "3 Hours",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP1BJROeoKbyBC70zwoMQtJgO2-FXXbmzsGLC18ZPCI1bqoX_O_7hN_6tw-aPtMYBzFRJDdJwbUL07lQIB_tkOMnvdIom-f0OdSMQbemDzdadD-b5UlNRjru8eOnTnTe_0XtnuPxFh1mstaD9MY2w9YQN4J7l45hBu0wHwZ9zXa4r7Id2PNxQ4uT_G2VoHlVhE5KgpPaW_ypc_-aRU7FveWtp0aoXQZVrybt-g8fbFn_Ud6yg1jjyhzovHT09pwodfLuQTDkOcfv8"
  },
  {
    title: "Munnar Tea Plantation Walk",
    category: "NATURE",
    description: "Trek through emerald-green tea estates at dawn. Learn the delicate process of tea harvesting from local pickers and sample world-class infusions amidst the clouds.",
    duration: "4 Hours",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsGAXsl4Ha6NCiCFTKLXYTUwMmLyueVurm8-a9Lf5hLVFVAVV7w3buFt4pGHtGAU7SKXaZ-InrYGXqvLLkL4Y6j00GK3nGvj83Tf_kNBWR6S_-I8XA_s_q80-YQNIuhGIZ1vP6n2ZSXaxENbFT32kdHHx-GRhSZAeXmQkLTvwkM2BSpC6RFp2QCmbRLjuBCnf2OvSQEL_0nKyM5hgGuHwdm9EXV-TsJp_mmYSI6CHcQMQZfgu9x-et0xpfVTwZviuMkGK6xqwiFWs"
  },
  {
    title: "Traditional Kerala Spice Masterclass",
    category: "CULTURE",
    description: "Join our resident chef for a hands-on culinary journey. Discover the secrets of black pepper, cardamom, and coconut as you prepare a traditional four-course Sadya meal.",
    duration: "5 Hours",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCINWNwOSXb9jVgwXnyi0tGhUd6t9k2ppm2hXS2KGvI4yrTXPuzqRWmFMTLvsYcj8bC6VfkF9p_rn0-90p8KboZ2vN8JY8626lL3q9tQKYtQCZA-iQs_0-qv_gr0zBXpfPo2z885-9zFrGRdtD0Zzb0fhV-m0htl_KGH-b2llls7V-5zXanXRg5MKYiL-AANEu7SUKBBZag7Ykwh38GVyioh6IfaVFHB8D5hfPaEjmcgr3uWpceg12mD0HnLX6ME49wi3Hun0jELJ8"
  },
  {
    title: "Forest Bathing & Morning Yoga",
    category: "WELLNESS",
    description: "Start your day in harmony with nature. This guided experience combines a silent mindful walk through ancient forests with a Hatha yoga session on a secluded canopy deck.",
    duration: "2 Hours",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoeW39MMrTX-lX6LIkgd4hdVNyZYxSAg7ut3PEOsBH4CYR7OUszddQuBzAPkkxUf4PKGdAANEqeyDnRM89AgVb1PUMrwh8IpcNd6jlVasoW3Eyi_zbZJa9u0OrNSoy3ZkHqRkA2BIzD-qkT1GvZRqoj3exnabWHSRlhA8huxvgnjM4m3zeUQoJoIBWNXyD-CffED4h7oOavwObIjKx-J-U7Iyh_eNpiFmWffWJHeUZgcNJBBFvMGTyJP-u8tYQv7KS6jiYzS3nCko"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotelB');
    console.log('MongoDB connected for seeding...');

    // Clear old data
    await User.deleteMany();
    await Stay.deleteMany();
    await Experience.deleteMany();
    await Booking.deleteMany();
    console.log('Cleared database collections.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: "Sanctuary Traveler",
        email: "traveler@hotelb.com",
        password: hashedPassword,
        role: "user",
        loyaltyPoints: 12450,
        loyaltyTier: "Gold"
      },
      {
        name: "Admin User",
        email: "admin@hotelb.com",
        password: hashedPassword,
        role: "admin",
        loyaltyPoints: 0,
        loyaltyTier: "None"
      }
    ]);
    console.log(`Seeded ${users.length} users successfully.`);

    // Seed Stays
    const stays = await Stay.create(staysData);
    console.log(`Seeded ${stays.length} stays successfully.`);

    // Seed Experiences
    const experiences = await Experience.create(experiencesData);
    console.log(`Seeded ${experiences.length} experiences successfully.`);

    // Seed a mock booking for Sanctuary Traveler (so it shows on User Dashboard)
    const travelerUser = users.find(u => u.email === 'traveler@hotelb.com');
    const houseboatStay = stays.find(s => s.title === 'Amber Shore Houseboat');
    const vistaStay = stays.find(s => s.title === 'Vembanad Vista Resort');
    const teaStay = stays.find(s => s.title === 'Tea Mist Heritage');

    // 1. Upcoming booking (15 days in future)
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 15);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 18);

    await Booking.create({
      user: travelerUser._id,
      stay: houseboatStay._id,
      roomTitle: "Grand Horizon Suite",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestCount: 2,
      guestDetails: {
        name: "Sanctuary Traveler",
        email: "traveler@hotelb.com",
        phone: "+91 98765 43210",
        specialRequests: "We are celebrating an anniversary! An organic fruit basket or a welcome cake on arrival would be wonderful."
      },
      totalAmount: 40650,
      paymentMethod: "Credit Card",
      bookingNumber: "PI-8829-4412",
      status: "Confirmed"
    });

    // 2. Active booking (yesterday to +3 days)
    const activeCheckIn = new Date();
    activeCheckIn.setDate(activeCheckIn.getDate() - 1);
    const activeCheckOut = new Date();
    activeCheckOut.setDate(activeCheckOut.getDate() + 3);

    await Booking.create({
      user: travelerUser._id,
      stay: vistaStay._id,
      roomTitle: "Lakeside Luxury Villa",
      checkIn: activeCheckIn,
      checkOut: activeCheckOut,
      guestCount: 2,
      guestDetails: {
        name: "Sanctuary Traveler",
        email: "traveler@hotelb.com",
        phone: "+91 98765 43210",
        specialRequests: "Prefer a ground floor villa closer to the lake."
      },
      totalAmount: 139520,
      paymentMethod: "Credit Card",
      bookingNumber: "PI-1049-7756",
      status: "Confirmed"
    });

    // 3. Past booking (30 days ago to 27 days ago)
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 30);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 27);

    await Booking.create({
      user: travelerUser._id,
      stay: teaStay._id,
      roomTitle: "Highland View Manor",
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      guestCount: 2,
      guestDetails: {
        name: "Sanctuary Traveler",
        email: "traveler@hotelb.com",
        phone: "+91 98765 43210",
        specialRequests: ""
      },
      totalAmount: 78480,
      paymentMethod: "Credit Card",
      bookingNumber: "PI-5034-2918",
      status: "Confirmed"
    });

    console.log('Seeded dynamic bookings (Upcoming, Active, Past) for Sanctuary Traveler.');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
