import themesData from './defaultThemes.json';
import { analyzeThemeSentiment } from './sentimentAnalysis';

export interface Theme {
  display_name: string;
  keywords: string[];
  weight: number;
  description?: string;
}

export interface ThemeMatch {
  themeKey: string;
  theme: Theme;
  mentions: number;
  sentences: string[];
  sentimentScore?: number;
  magnitude?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AnalysisResult {
  themes: ThemeMatch[];
  totalWords: number;
}

/**
 * Detect themes in review text based on keyword matching
 */
export function detectThemes(
  text: string, 
  category: 'universal' | string = 'universal',
  customThemes?: Record<string, Theme>
): AnalysisResult {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const detectedThemes: ThemeMatch[] = [];
  
  // Get themes based on category
  let themesToCheck: Record<string, Theme> = {};
  
  if (category === 'universal') {
    themesToCheck = themesData.universal as Record<string, Theme>;
  } else {
    // For category-specific, combine with universal
    const categoryThemes = (themesData as any)[category] || {};
    themesToCheck = { ...themesData.universal, ...categoryThemes } as Record<string, Theme>;
  }
  
  // Override with custom themes if provided
  if (customThemes) {
    themesToCheck = { ...themesToCheck, ...customThemes };
  }
  
  // Check each theme
  for (const [themeKey, theme] of Object.entries(themesToCheck)) {
    let mentions = 0;
    const matchingSentences: string[] = [];
    
    // Check each keyword
    for (const keyword of theme.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Determine if keyword is intentionally partial (like "deteriorat" to catch "deteriorate")
      // Check if keyword doesn't end with a complete word ending
      // Keywords like "deteriorat" (truncated) should match variations
      // But complete words like "show" should NOT match "showers"
      const isPartialKeyword = keywordLower.endsWith('at') && keywordLower.length > 6 || // e.g., "deteriorat"
        keywordLower.endsWith('ing') && keywordLower.length > 6 || // e.g., "perform"
        keywordLower.includes(' '); // Multi-word phrases like "tour guide"
      
      // Escape special regex characters
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Use exact word boundary matching for complete words (prevents "show" matching "showers")
      // Use partial matching only for intentionally partial keywords (like "deteriorat")
      const regex = isPartialKeyword 
        ? new RegExp(`\\b${escapedKeyword}\\w*`, 'gi') // Partial: matches "deteriorat" in "deteriorate"
        : new RegExp(`\\b${escapedKeyword}\\b`, 'gi'); // Exact: matches "show" but not "showers"
      
      const matches = textLower.match(regex);
      if (matches) {
        mentions += matches.length;
      }
      
      // Find sentences containing this keyword (use exact matching for sentence detection)
      const sentenceRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      for (const sentence of sentences) {
        if (sentenceRegex.test(sentence.toLowerCase()) && !matchingSentences.includes(sentence.trim())) {
          matchingSentences.push(sentence.trim());
        }
      }
    }
    
    // Only include themes with at least one mention
    if (mentions > 0) {
      // Analyze sentiment for this theme
      const themeSentiment = analyzeThemeSentiment(text, theme.keywords);
      
      detectedThemes.push({
        themeKey,
        theme,
        mentions,
        sentences: matchingSentences.slice(0, 3), // Limit to 3 sentences
        sentimentScore: themeSentiment.score,
        magnitude: themeSentiment.magnitude,
        sentiment: themeSentiment.sentiment
      });
    }
  }
  
  // Sort by mentions (descending)
  detectedThemes.sort((a, b) => b.mentions - a.mentions);
  
  return {
    themes: detectedThemes,
    totalWords: words.length
  };
}

/**
 * Get word frequency for word cloud
 */
export function getWordFrequency(text: string, excludeStopWords: boolean = true): Array<{ text: string; value: number }> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'including', 'excluding', 'following',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those',
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'very', 'really', 'quite', 'just', 'only', 'also', 'too', 'so', 'as', 'well'
  ]);
  
  const textLower = text.toLowerCase();
  const words = textLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out very short words
  
  const wordCount: Record<string, number> = {};
  
  for (const word of words) {
    if (excludeStopWords && stopWords.has(word)) {
      continue;
    }
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  
  // Convert to array and sort
  const wordFreq = Object.entries(wordCount)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Top 50 words
  
  return wordFreq;
}

