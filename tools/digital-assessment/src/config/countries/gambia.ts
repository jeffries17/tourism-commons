import type { CountryConfig } from '../../types/index';

export const gambiaConfig: CountryConfig = {
  name: 'The Gambia',
  code: 'GM',
  assessmentSheets: {
    tourOperators: 'TO Assessment',
    creativeIndustries: 'CI Assessment',
    recommendations: 'Recommendations'
  },
  sectors: [
    { 
      id: 'tour-operators', 
      name: 'Tour Operators', 
      color: '#1565c0',
      sheetName: 'TO Assessment'
    },
    { 
      id: 'creative-industries', 
      name: 'Creative Industries', 
      color: '#7b1fa2',
      sheetName: 'CI Assessment'
    }
  ],
  regions: [
    'Greater Banjul Area',
    'West Coast Region',
    'North Bank Region',
    'Central River Region',
    'Upper River Region',
    'Lower River Region'
  ],
  categories: [
    { 
      id: 'socialMedia', 
      name: 'Social Media', 
      icon: '📱', 
      maxScore: 18,
      description: 'Social media presence and engagement'
    },
    { 
      id: 'website', 
      name: 'Website', 
      icon: '🌐', 
      maxScore: 12,
      description: 'Website quality and functionality'
    },
    { 
      id: 'bookingSystem', 
      name: 'Booking System', 
      icon: '📅', 
      maxScore: 10,
      description: 'Online booking capabilities'
    },
    { 
      id: 'paymentSystem', 
      name: 'Payment System', 
      icon: '💳', 
      maxScore: 10,
      description: 'Digital payment options'
    },
    { 
      id: 'contentQuality', 
      name: 'Content Quality', 
      icon: '📝', 
      maxScore: 15,
      description: 'Quality and relevance of digital content'
    },
    { 
      id: 'digitalMarketing', 
      name: 'Digital Marketing', 
      icon: '📊', 
      maxScore: 12,
      description: 'Digital marketing efforts and reach'
    },
    { 
      id: 'customerEngagement', 
      name: 'Customer Engagement', 
      icon: '💬', 
      maxScore: 13,
      description: 'Customer interaction and response'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: '📈', 
      maxScore: 10,
      description: 'Use of analytics and data insights'
    }
  ],
  maturityLevels: [
    { 
      min: 0, 
      max: 20, 
      label: 'Absent', 
      color: '#f3f4f6',
      description: 'No or minimal digital presence'
    },
    { 
      min: 21, 
      max: 40, 
      label: 'Emerging', 
      color: '#fef3c7',
      description: 'Basic digital presence, inconsistent'
    },
    { 
      min: 41, 
      max: 60, 
      label: 'Developing', 
      color: '#bfdbfe',
      description: 'Regular digital presence, some engagement'
    },
    { 
      min: 61, 
      max: 80, 
      label: 'Established', 
      color: '#bbf7d0',
      description: 'Strong digital presence, good engagement'
    },
    { 
      min: 81, 
      max: 100, 
      label: 'Advanced', 
      color: '#86efac',
      description: 'Comprehensive digital strategy, excellent execution'
    }
  ]
};

