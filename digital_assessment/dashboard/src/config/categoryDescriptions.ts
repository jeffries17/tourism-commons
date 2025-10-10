// Sector-specific descriptions for each assessment category
// These explain the impact and importance of each category for different sectors

export interface CategoryDescription {
  [sector: string]: {
    [categoryKey: string]: string;
  };
}

export const categoryDescriptions: CategoryDescription = {
  // Tour Operators
  'Tour Operators': {
    socialMedia: 'Essential for showcasing destinations and building trust with travelers through reviews and visual storytelling.',
    website: 'Your digital storefront for itineraries, bookings, and establishing credibility with international travelers.',
    visualContent: 'High-quality photos and videos are critical for inspiring travelers and differentiating your tours.',
    discoverability: 'Being found on search engines and travel platforms is vital for attracting new customers.',
    digitalSales: 'Online booking and payment systems increase conversion rates and enable 24/7 reservations.',
    platformIntegration: 'Listings on TripAdvisor, Booking.com, and OTAs expand your reach to global audiences.',
  },
  
  // Hospitality
  'Hospitality': {
    socialMedia: 'Showcase your property, amenities, and guest experiences to attract bookings and build loyalty.',
    website: 'A professional website with booking capabilities is essential for direct reservations and brand control.',
    visualContent: 'Professional photos and virtual tours directly impact booking decisions and guest expectations.',
    discoverability: 'Appearing in local searches and on booking platforms drives occupancy rates.',
    digitalSales: 'Direct booking engines reduce commission costs and increase profit margins.',
    platformIntegration: 'Presence on Booking.com, Expedia, and review sites is critical for visibility and credibility.',
  },
  
  // Attractions & Activities
  'Attractions & Activities': {
    socialMedia: 'Share engaging content and user-generated experiences to attract visitors and build community.',
    website: 'Your digital hub for schedules, ticket sales, and visitor information.',
    visualContent: 'Captivating visuals showcase your unique experiences and drive ticket sales.',
    discoverability: 'Being found by tourists planning their itineraries is essential for walk-in and online traffic.',
    digitalSales: 'Online ticketing and reservations streamline operations and capture impulse bookings.',
    platformIntegration: 'Listings on GetYourGuide, Viator, and Google Maps expand your customer base.',
  },
  
  // Transport
  'Transport': {
    socialMedia: 'Build trust and showcase reliability, comfort, and safety to attract bookings.',
    website: 'A clear booking system and service information are key to converting inquiries into reservations.',
    visualContent: 'Photos of your fleet and safety measures reassure customers and differentiate your service.',
    discoverability: 'Local search visibility connects you with travelers needing transportation.',
    digitalSales: 'Online booking and payment systems improve efficiency and customer convenience.',
    platformIntegration: 'Integration with travel booking platforms and ride-sharing apps expands your reach.',
  },
  
  // Arts & Crafts
  'Arts & Crafts': {
    socialMedia: 'Showcase your creations, tell your story, and connect directly with buyers and collectors.',
    website: 'A digital portfolio and e-commerce store enable sales to local and international markets.',
    visualContent: 'High-quality images of your work are essential for online sales and gallery representation.',
    discoverability: 'Being found by art buyers, galleries, and tourists drives sales opportunities.',
    digitalSales: 'E-commerce capabilities unlock global markets and reduce reliance on physical sales.',
    platformIntegration: 'Listings on Etsy, art marketplaces, and social commerce expand your customer base.',
  },
  
  // Music & Entertainment
  'Music & Entertainment': {
    socialMedia: 'Build your fanbase, promote events, and share performances to grow your audience.',
    website: 'Your central hub for music, videos, tour dates, and merchandise sales.',
    visualContent: 'Professional videos and photos are crucial for bookings, streaming, and fan engagement.',
    discoverability: 'Being found on streaming platforms and search engines expands your reach.',
    digitalSales: 'Online ticket sales, merchandise, and streaming revenue diversify your income.',
    platformIntegration: 'Presence on Spotify, YouTube, and event platforms is essential for modern musicians.',
  },
  
  // Fashion & Design
  'Fashion & Design': {
    socialMedia: 'Showcase collections, engage with fashion communities, and drive traffic to your store.',
    website: 'A professional site with e-commerce is essential for building your brand and reaching customers.',
    visualContent: 'Lookbooks, product photography, and styled shoots are critical for fashion sales.',
    discoverability: 'SEO and fashion platform visibility connect you with buyers and collaborators.',
    digitalSales: 'Online sales unlock domestic and international markets beyond physical retail.',
    platformIntegration: 'Presence on fashion marketplaces, Instagram Shopping, and styling platforms expands reach.',
  },
  
  // Digital Media
  'Digital Media': {
    socialMedia: 'Share your work, build thought leadership, and attract clients through your portfolio.',
    website: 'Your professional portfolio and contact hub for client acquisition and showcasing expertise.',
    visualContent: 'Your portfolio is your product—high-quality samples demonstrate your capabilities.',
    discoverability: 'Being found by potential clients searching for digital services drives business.',
    digitalSales: 'Online booking, project management, and payment systems streamline client work.',
    platformIntegration: 'Presence on Behance, LinkedIn, and freelance platforms connects you with opportunities.',
  },
};

// Fallback descriptions for sectors not specifically defined
export const defaultCategoryDescriptions = {
  socialMedia: 'Build your audience, engage customers, and showcase your brand on social platforms.',
  website: 'Your digital presence and primary touchpoint for customers seeking information.',
  visualContent: 'Visual storytelling that showcases your offerings and builds credibility.',
  discoverability: 'Being found by customers searching online is essential for business growth.',
  digitalSales: 'Online transactions enable convenient purchasing and expand your market reach.',
  platformIntegration: 'Third-party platforms expand your visibility and connect you with new customers.',
};

/**
 * Get the description for a specific category and sector
 */
export function getCategoryDescription(categoryKey: string, sector: string): string {
  const sectorDescriptions = categoryDescriptions[sector];
  if (sectorDescriptions && sectorDescriptions[categoryKey]) {
    return sectorDescriptions[categoryKey];
  }
  // Fall back to default descriptions
  return defaultCategoryDescriptions[categoryKey as keyof typeof defaultCategoryDescriptions] || '';
}

