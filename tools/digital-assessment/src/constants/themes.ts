/**
 * Unified Theme Taxonomy Constants
 * 9 core themes applicable to all stakeholder types and countries
 */

export const UNIFIED_THEMES = [
  'cultural_heritage',
  'service_staff',
  'facilities_infrastructure',
  'accessibility_transport',
  'value_money',
  'safety_security',
  'educational_value',
  'artistic_creative',
  'atmosphere_experience'
] as const;

export type UnifiedTheme = typeof UNIFIED_THEMES[number];

export const THEME_DISPLAY_NAMES: Record<string, string> = {
  'cultural_heritage': 'Cultural & Heritage Value',
  'service_staff': 'Service & Staff Quality',
  'facilities_infrastructure': 'Facilities & Infrastructure',
  'accessibility_transport': 'Accessibility & Transport',
  'value_money': 'Value for Money',
  'safety_security': 'Safety & Security',
  'educational_value': 'Educational & Informational Value',
  'artistic_creative': 'Artistic & Creative Quality',
  'atmosphere_experience': 'Atmosphere & Overall Experience'
};

export const THEME_DESCRIPTIONS: Record<string, string> = {
  'cultural_heritage': 'Authenticity, historical significance, and cultural preservation',
  'service_staff': 'Staff friendliness, guide knowledge, and hospitality',
  'facilities_infrastructure': 'Physical condition, maintenance, and cleanliness',
  'accessibility_transport': 'Location accessibility, transport options, and wayfinding',
  'value_money': 'Price perception and value received',
  'safety_security': 'Safety concerns and security presence',
  'educational_value': 'Learning opportunities and information quality',
  'artistic_creative': 'Artistic expression, creativity, and craftsmanship',
  'atmosphere_experience': 'Ambiance, overall feel, and visitor experience'
};

export const THEME_ICONS: Record<string, string> = {
  'cultural_heritage': '🏛️',
  'service_staff': '👥',
  'facilities_infrastructure': '🏗️',
  'accessibility_transport': '🚗',
  'value_money': '💰',
  'safety_security': '🔒',
  'educational_value': '📚',
  'artistic_creative': '🎨',
  'atmosphere_experience': '✨'
};

export const THEME_COLORS: Record<string, string> = {
  'cultural_heritage': '#8b5cf6', // purple
  'service_staff': '#3b82f6', // blue
  'facilities_infrastructure': '#64748b', // slate
  'accessibility_transport': '#06b6d4', // cyan
  'value_money': '#10b981', // green
  'safety_security': '#f59e0b', // amber
  'educational_value': '#ec4899', // pink
  'artistic_creative': '#f43f5e', // rose
  'atmosphere_experience': '#6366f1' // indigo
};

/**
 * Get display name for a theme
 */
export function getThemeDisplayName(themeKey: string): string {
  return THEME_DISPLAY_NAMES[themeKey] || themeKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get description for a theme
 */
export function getThemeDescription(themeKey: string): string {
  return THEME_DESCRIPTIONS[themeKey] || '';
}

/**
 * Get icon for a theme
 */
export function getThemeIcon(themeKey: string): string {
  return THEME_ICONS[themeKey] || '📊';
}

/**
 * Get color for a theme
 */
export function getThemeColor(themeKey: string): string {
  return THEME_COLORS[themeKey] || '#64748b';
}

/**
 * Format theme score for display (0-1 scale to percentage or 0-10 scale)
 */
export function formatThemeScore(score: number, format: 'percentage' | 'scale10' = 'scale10'): string {
  if (format === 'percentage') {
    return `${Math.round(score * 100)}%`;
  }
  return (score * 10).toFixed(1);
}

/**
 * Get sentiment label based on score
 */
export function getThemeSentimentLabel(score: number): string {
  if (score >= 0.5) return 'Excellent';
  if (score >= 0.3) return 'Very Good';
  if (score >= 0.1) return 'Good';
  if (score >= -0.1) return 'Neutral';
  if (score >= -0.3) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Get sentiment color based on score
 */
export function getThemeSentimentColor(score: number): string {
  if (score >= 0.5) return 'text-green-600';
  if (score >= 0.3) return 'text-green-500';
  if (score >= 0.1) return 'text-blue-500';
  if (score >= -0.1) return 'text-gray-500';
  if (score >= -0.3) return 'text-orange-500';
  return 'text-red-600';
}

