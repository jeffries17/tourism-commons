// Shared TypeScript types for the Digital Assessment Dashboard

// Backend API response types
export interface Assessment {
  name: string;
  sector: string;
  region: string;
  // Raw external scores (0-10)
  socialMedia: number;
  website: number;
  visualContent: number;
  discoverability: number;
  digitalSales: number;
  platformIntegration: number;
  // NEW Survey Assessment (October 2025)
  surveyFoundation?: number;     // 0-10
  surveyCapability?: number;     // 0-10
  surveyGrowth?: number;         // 0-10
  surveyTier?: string;           // Absent/Basic, Emerging, Intermediate, Advanced, Expert
  surveyDate?: string;           // Date survey was completed
  surveyDescription?: string;    // Description of maturity tier
  surveyBreakdown?: {            // Detailed breakdown of survey scores
    foundation: {
      website: number;
      socialPlatforms: number;
      postingFrequency: number;
      onlineSales: number;
      reviewManagement: number;
    };
    capability: {
      comfortLevel: number;
      deviceAccess: number;
      internet: number;
      analytics: number;
    };
    growth: {
      marketingKnowledge: number;
      challengeType: number;
      contentCreation: number;
      monthlyInvestment: number;
      training: number;
      growthAmbition: number;
    };
  };
  // Totals
  externalTotal: number;         // 0-70
  surveyTotal?: number;          // 0-30
  combinedScore: number;         // 0-100
  maturityLevel: string;         // Based on external assessment
}

export interface DashboardData {
  sheetName: string;
  total: number;
  maturity: Record<string, number>;
  sectors: {
    sector: string;
    count: number;
    avgExternal: number;
    avgSurvey: number;
    avgCombined: number;
    completionRate: number;
  }[];
  participants: {
    name: string;
    sector: string;
    external: number;
    survey: number;
    combined: number;
    maturity: string;
  }[];
  categoryAverages: {
    socialMedia: number;
    website: number;
    visualContent: number;
    discoverability: number;
    digitalSales: number;
    platformIntegration: number;
  };
  sectorStacked: Record<string, any>;
  overall: {
    withExternal: number;
    withSurvey: number;
    complete: number;
    avgExternal: number;
    avgSurvey: number;
    avgCombined: number;
  };
}

export interface Participant {
  name: string;
  sector: string;
  region?: string;
  overallScore: number;
  maturityLevel: string;
  categories: CategoryScore[];
  digitalPresence: DigitalPresence;
  contact?: ContactInfo;
}

export interface CategoryScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  externalScore?: number;
  surveyScore?: number;
}

export interface DigitalPresence {
  hasWebsite: boolean;
  hasSocialMedia: boolean;
  hasBookingSystem: boolean;
  hasPaymentSystem: boolean;
  platforms: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  nextSteps: string[];
  estimatedImpact: string;
  resources?: string[];
}

export interface ParticipantDetail {
  participant: Participant;
  recommendations: Recommendation[];
  comparisonData: {
    externalVsSector: Array<{
      category: string;
      external: number;
      sector: number;
    }>;
  };
}

export interface SectorConfig {
  id: string;
  name: string;
  color: string;
  sheetName: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  maxScore: number;
  description?: string;
}

export interface MaturityLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  description?: string;
}

export interface CountryConfig {
  name: string;
  code: string;
  assessmentSheets: {
    tourOperators: string;
    creativeIndustries: string;
    recommendations: string;
  };
  sectors: SectorConfig[];
  regions: string[];
  categories: CategoryConfig[];
  maturityLevels: MaturityLevel[];
}

export interface DashboardStats {
  totalParticipants: number;
  averageScore: number;
  bySector: {
    sector: string;
    count: number;
    avgScore: number;
  }[];
  byMaturity: {
    level: string;
    count: number;
    percentage: number;
  }[];
}

// Technical Audit types
export interface TechnicalAudit {
  stakeholderName: string;
  assessmentType: string;
  sector: string;
  website: string;
  auditDate: string;
  status: string;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  performanceStatus: string;
  seoStatus: string;
  overallStatus: string;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  totalIssues: number;
  topIssue1?: string;
  topIssue2?: string;
  topIssue3?: string;
  httpsEnabled: string;
  mobileResponsive: string;
  hasMetaDescription: string;
  lastUpdated: string;
}

export interface TechnicalHealthSummary {
  totalWebsites: number;
  averagePerformance: number;
  averageSEO: number;
  excellentSites: number;
  poorSites: number;
  criticalIssuesTotal: number;
  lastAuditDate: string;
}

export interface SectorBaseline {
  totalStakeholders: number;
  digitalPresence: {
    withWebsite: number;
    withFacebook: number;
    withInstagram: number;
    withTripAdvisor: number;
    withYoutube: number;
    withTiktok: number;
    percentWithWebsite: number;
    percentWithFacebook: number;
    percentWithInstagram: number;
    percentWithTripAdvisor: number;
    percentWithYoutube: number;
    percentWithTiktok: number;
  };
  socialMediaReach: {
    avgFacebookFollowers: number;
    avgInstagramFollowers: number;
    avgTripAdvisorReviews: number;
    avgYoutubeSubscribers: number;
    avgTiktokFollowers: number;
    totalFacebookFollowers: number;
    totalInstagramFollowers: number;
    totalTripAdvisorReviews: number;
    totalYoutubeSubscribers: number;
    totalTiktokFollowers: number;
    stakeholdersWithFbFollowers: number;
    stakeholdersWithIgFollowers: number;
    stakeholdersWithTaReviews: number;
    stakeholdersWithYtSubscribers: number;
    stakeholdersWithTiktokFollowers: number;
  };
  commonPatterns: {
    avgPlatformsPerStakeholder: number;
    mostPopularPlatform: string;
    platformPopularity: Array<{ name: string; count: number }>;
  };
}