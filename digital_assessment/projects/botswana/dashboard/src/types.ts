export interface ThemeScore {
  score: number
  mentions: number
  sentiment_score: number
  distribution: { positive: number; neutral: number; negative: number }
}

export interface Stakeholder {
  stakeholder_name: string
  sector: 'reserve' | 'lodge' | 'operator' | 'activity'
  zone: string
  tier: 'budget' | 'mid' | 'luxury'
  total_reviews: number
  average_rating: number
  overall_sentiment: number
  eco_credibility_score: number
  tripadvisor_url: string | null
  year_distribution: Record<string, number>
  season_distribution: Record<string, number>
  theme_scores: Record<string, ThemeScore>
}

export interface SectorSummary {
  count: number
  avg_sentiment: number
  avg_eco_credibility: number
  theme_averages: Record<string, number>
  stakeholders: string[]
}

export interface DashboardData {
  metadata: {
    generated_at: string
    title: string
    total_stakeholders: number
    total_reviews: number
    themes: string[]
    eco_credibility_weights: Record<string, number>
  }
  summary: {
    avg_sentiment: number
    theme_averages: Record<string, number>
    theme_visibility: Record<string, number>
    year_distribution: Record<string, number>
    sector_summaries: Record<string, SectorSummary>
    zone_summaries: Record<string, { count: number; avg_sentiment: number; avg_eco_credibility: number; stakeholders: string[] }>
    season_distribution: Record<string, number>
  }
  stakeholder_data: Stakeholder[]
}

export const THEME_LABELS: Record<string, string> = {
  wildlife_experience: 'Wildlife Experience',
  eco_conservation: 'Eco & Conservation',
  service_hospitality: 'Service & Hospitality',
  accommodation_quality: 'Accommodation Quality',
  value_money: 'Value for Money',
  accessibility_logistics: 'Accessibility & Logistics',
  adventure_activities: 'Adventure Activities',
  safety: 'Safety',
  atmosphere_wilderness: 'Atmosphere & Wilderness',
  food_dining: 'Food & Dining',
  environmental_sensitivity: 'Environmental Sensitivity',
}

export const THEME_ORDER = [
  'wildlife_experience',
  'atmosphere_wilderness',
  'service_hospitality',
  'accommodation_quality',
  'adventure_activities',
  'eco_conservation',
  'food_dining',
  'value_money',
  'accessibility_logistics',
  'environmental_sensitivity',
  'safety',
]

export const SECTOR_LABELS: Record<string, string> = {
  reserve: 'Reserves & Parks',
  lodge: 'Lodges & Camps',
  operator: 'Tour Operators',
  activity: 'Activity Providers',
}

export const COLORS = {
  primary: '#00695C',
  primaryDark: '#004D40',
  primaryLight: '#E0F2F1',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  positive: '#059669',
  warning: '#D97706',
  negative: '#DC2626',
  muted: '#6B7280',
  border: '#E5E7EB',
  surface: '#FAFAF8',
}

export function sentimentToPercent(s: number): number {
  return Math.round(((s + 1) / 2) * 100)
}

export function sentimentLabel(s: number): { label: string; color: string } {
  if (s >= 0.6)  return { label: 'Strong',          color: '#15803D' }  // dark green
  if (s >= 0.3)  return { label: 'Positive',         color: '#65A30D' }  // light green
  if (s >= 0.0)  return { label: 'Mixed',             color: COLORS.warning } // yellow
  return               { label: 'Needs Attention',  color: COLORS.negative }  // red
}
