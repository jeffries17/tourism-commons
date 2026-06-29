export type DestinationType = 'country' | 'city'

// Optional region tag is a flexible grouping (e.g. "Nordics", "Southern Europe")
export interface Destination {
  /** Document ID, e.g. "FR" or "FR_paris" (country_code + city_slug) */
  id: string
  name: string
  type: DestinationType
  /** ISO 3166-1 alpha-2 for the country this destination belongs to */
  countryCode: string
  /** Continent name, e.g. "Europe" */
  continent: string
  /** Optional working region tag for sub-continental groupings */
  region?: string
  population?: number
  populationYear?: number
  populationSourceUrl?: string
  /** Optional list of primary languages, e.g. ["en", "fr"] */
  languages?: string[]
}

export type VerificationStatus = 'unverified' | 'probable' | 'verified'

export interface TourismProfile {
  /** Document ID, typically derived from destinationId (e.g. "FR_main") */
  id: string
  /** Reference to Destination.id */
  destinationId: string

  officialWebsiteUrl?: string
  /** 0–100 confidence score that this is the primary official tourism website */
  websiteConfidence?: number

  instagramHandle?: string
  instagramUrl?: string

  followers?: number
  /** ISO date string when followers were last checked */
  followersLastChecked?: string

  verificationStatus: VerificationStatus
  /** Evidence links such as tourism website social pages, Instagram profile, etc. */
  evidenceUrls?: string[]
  reviewNotes?: string
  lastReviewedBy?: string
  /** ISO date string when this profile was last reviewed */
  lastReviewedAt?: string

  /** Derived metrics, materialized for easy filtering/sorting */
  followersPerCapita?: number
  followersPerAnnualVisitor?: number
}

export interface VisitorSeries {
  id: string
  /** Reference to Destination.id */
  destinationId: string
  /** Whether this is the primary series used for headline ratios */
  isPrimary: boolean

  annualVisitorsValue: number | null
  visitorYear: number | null
  /** Free-text definition, e.g. "International tourist arrivals (UNWTO)" */
  visitorMetricDefinition: string
  visitorSourceUrl?: string
}


