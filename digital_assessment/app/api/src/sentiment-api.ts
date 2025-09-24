import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sentiment analysis data types
export type SentimentData = {
  stakeholder_name: string;
  industry: 'creative_industries' | 'tour_operators';
  total_reviews: number;
  average_rating: number;
  overall_sentiment: number;
  positive_rate: number;
  language_diversity: number;
  language_distribution: Record<string, number>;
  year_distribution: Record<string, number>;
  analysis_date: string;
  theme_scores: Record<string, { score: number; mentions: number }>;
  critical_areas: Array<{
    theme: string;
    sentiment_score: number;
    priority: string;
    quotes: string[];
  }>;
  key_strengths: Array<{ theme: string; score: number }>;
  key_weaknesses: Array<{ theme: string; score: number }>;
  management_response: {
    response_rate: number;
    total_responses: number;
    gap_opportunity: number;
  };
};

export type SentimentSummary = {
  total_stakeholders: number;
  total_reviews: number;
  average_sentiment: number;
  average_rating: number;
  language_distribution: Record<string, number>;
  theme_averages: Record<string, { average_score: number; total_mentions: number; stakeholder_count: number }>;
  critical_areas_sector: Array<{
    theme: string;
    average_score: number;
    total_mentions: number;
    affected_stakeholders: number;
  }>;
  top_performers: SentimentData[];
  underperformers: SentimentData[];
};

// Load sentiment analysis data from both industry files
function loadSentimentData(): { summary: SentimentSummary; stakeholder_data: SentimentData[] } | null {
  try {
    // Load creative industries data
    const creativeIndustriesPath = path.join(__dirname, '../../../sentiment/output/creative_industries_sentiment_analysis_results.json');
    const tourOperatorsPath = path.join(__dirname, '../../../sentiment/output/tour_operators_sentiment_analysis_results.json');
    
    let creativeData = null;
    let tourOperatorsData = null;
    
    try {
      const creativeFile = fs.readFileSync(creativeIndustriesPath, 'utf8');
      creativeData = JSON.parse(creativeFile);
    } catch (error) {
      console.warn('Could not load creative industries data:', error);
    }
    
    try {
      const tourOperatorsFile = fs.readFileSync(tourOperatorsPath, 'utf8');
      tourOperatorsData = JSON.parse(tourOperatorsFile);
    } catch (error) {
      console.warn('Could not load tour operators data:', error);
    }
    
    if (!creativeData && !tourOperatorsData) {
      console.error('No sentiment data files found');
      return null;
    }
    
    // Merge data from both industries
    const allStakeholderData: SentimentData[] = [];
    
    if (creativeData?.stakeholder_data) {
      const creativeStakeholders = creativeData.stakeholder_data.map((stakeholder: any) => ({
        ...stakeholder,
        industry: 'creative_industries' as const,
        year_distribution: stakeholder.year_distribution || {}
      }));
      allStakeholderData.push(...creativeStakeholders);
    }
    
    if (tourOperatorsData?.stakeholder_data) {
      const tourOperatorStakeholders = tourOperatorsData.stakeholder_data.map((stakeholder: any) => ({
        ...stakeholder,
        industry: 'tour_operators' as const,
        year_distribution: stakeholder.year_distribution || {}
      }));
      allStakeholderData.push(...tourOperatorStakeholders);
    }
    
    // Create unified summary
    const totalStakeholders = allStakeholderData.length;
    const totalReviews = allStakeholderData.reduce((sum, s) => sum + s.total_reviews, 0);
    const averageSentiment = allStakeholderData.reduce((sum, s) => sum + s.overall_sentiment, 0) / totalStakeholders;
    const averageRating = allStakeholderData.reduce((sum, s) => sum + s.average_rating, 0) / totalStakeholders;
    
    // Aggregate language distribution
    const languageDistribution: Record<string, number> = {};
    allStakeholderData.forEach(stakeholder => {
      Object.entries(stakeholder.language_distribution || {}).forEach(([lang, count]) => {
        languageDistribution[lang] = (languageDistribution[lang] || 0) + count;
      });
    });
    
    // Calculate theme averages
    const themeAverages: Record<string, { average_score: number; total_mentions: number; stakeholder_count: number }> = {};
    allStakeholderData.forEach(stakeholder => {
      Object.entries(stakeholder.theme_scores || {}).forEach(([theme, data]: [string, any]) => {
        if (!themeAverages[theme]) {
          themeAverages[theme] = { average_score: 0, total_mentions: 0, stakeholder_count: 0 };
        }
        themeAverages[theme].average_score += data.score || 0;
        themeAverages[theme].total_mentions += data.mentions || 0;
        themeAverages[theme].stakeholder_count += 1;
      });
    });
    
    // Calculate average theme scores
    Object.keys(themeAverages).forEach(theme => {
      if (themeAverages[theme].stakeholder_count > 0) {
        themeAverages[theme].average_score /= themeAverages[theme].stakeholder_count;
      }
    });
    
    // Get top and bottom performers
    const sortedStakeholders = allStakeholderData.sort((a, b) => b.overall_sentiment - a.overall_sentiment);
    const topPerformers = sortedStakeholders.slice(0, 3);
    const underperformers = sortedStakeholders.slice(-3);
    
    const summary: SentimentSummary = {
      total_stakeholders: totalStakeholders,
      total_reviews: totalReviews,
      average_sentiment: averageSentiment,
      average_rating: averageRating,
      language_distribution: languageDistribution,
      theme_averages: themeAverages,
      critical_areas_sector: [], // This would need to be calculated from critical areas
      top_performers: topPerformers,
      underperformers: underperformers
    };
    
    return {
      summary,
      stakeholder_data: allStakeholderData
    };
    
  } catch (error) {
    console.error('Error loading sentiment data:', error);
    return null;
  }
}

// Helper function to normalize stakeholder names for matching
function normalizeStakeholderName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')  // Remove special characters but keep underscores
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/_+/g, '_')  // Replace multiple underscores with single underscore
    .trim();
}

// Get sentiment data for a specific stakeholder
export function getStakeholderSentiment(stakeholderName: string): SentimentData | null {
  const data = loadSentimentData();
  if (!data) return null;
  
  const normalizedInput = normalizeStakeholderName(stakeholderName);
  
  return data.stakeholder_data.find(
    stakeholder => normalizeStakeholderName(stakeholder.stakeholder_name) === normalizedInput
  ) || null;
}

// Get sentiment summary for all stakeholders
export function getSentimentSummary(): SentimentSummary | null {
  const data = loadSentimentData();
  return data?.summary || null;
}

// Get sentiment data for all stakeholders
export function getAllSentimentData(): SentimentData[] {
  const data = loadSentimentData();
  return data?.stakeholder_data || [];
}

// Get sentiment data for a specific industry
export function getIndustrySentimentData(industry: 'creative_industries' | 'tour_operators'): SentimentData[] {
  const data = loadSentimentData();
  return data?.stakeholder_data.filter(stakeholder => stakeholder.industry === industry) || [];
}

// Get sentiment summary for a specific industry
export function getIndustrySentimentSummary(industry: 'creative_industries' | 'tour_operators'): SentimentSummary | null {
  const industryData = getIndustrySentimentData(industry);
  if (!industryData.length) return null;
  
  const totalStakeholders = industryData.length;
  const totalReviews = industryData.reduce((sum, s) => sum + s.total_reviews, 0);
  const averageSentiment = industryData.reduce((sum, s) => sum + s.overall_sentiment, 0) / totalStakeholders;
  const averageRating = industryData.reduce((sum, s) => sum + s.average_rating, 0) / totalStakeholders;
  
  // Aggregate language distribution
  const languageDistribution: Record<string, number> = {};
  industryData.forEach(stakeholder => {
    Object.entries(stakeholder.language_distribution || {}).forEach(([lang, count]) => {
      languageDistribution[lang] = (languageDistribution[lang] || 0) + count;
    });
  });
  
  // Calculate theme averages
  const themeAverages: Record<string, { average_score: number; total_mentions: number; stakeholder_count: number }> = {};
  industryData.forEach(stakeholder => {
    Object.entries(stakeholder.theme_scores || {}).forEach(([theme, data]: [string, any]) => {
      if (!themeAverages[theme]) {
        themeAverages[theme] = { average_score: 0, total_mentions: 0, stakeholder_count: 0 };
      }
      themeAverages[theme].average_score += data.score || 0;
      themeAverages[theme].total_mentions += data.mentions || 0;
      themeAverages[theme].stakeholder_count += 1;
    });
  });
  
  // Calculate average theme scores
  Object.keys(themeAverages).forEach(theme => {
    if (themeAverages[theme].stakeholder_count > 0) {
      themeAverages[theme].average_score /= themeAverages[theme].stakeholder_count;
    }
  });
  
  // Get top and bottom performers
  const sortedStakeholders = industryData.sort((a, b) => b.overall_sentiment - a.overall_sentiment);
  const topPerformers = sortedStakeholders.slice(0, 3);
  const underperformers = sortedStakeholders.slice(-3);
  
  return {
    total_stakeholders: totalStakeholders,
    total_reviews: totalReviews,
    average_sentiment: averageSentiment,
    average_rating: averageRating,
    language_distribution: languageDistribution,
    theme_averages: themeAverages,
    critical_areas_sector: [], // This would need to be calculated from critical areas
    top_performers: topPerformers,
    underperformers: underperformers
  };
}

// API endpoints
export function setupSentimentRoutes(app: any) {
  // Get sentiment data for a specific stakeholder
  app.get('/sentiment/stakeholder/:name', (req: Request, res: Response) => {
    try {
      const stakeholderName = decodeURIComponent(req.params.name);
      const sentimentData = getStakeholderSentiment(stakeholderName);
      
      if (!sentimentData) {
        return res.status(404).json({ error: 'Sentiment data not found for this stakeholder' });
      }
      
      res.json(sentimentData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load sentiment data' });
    }
  });

  // Get sentiment summary
  app.get('/sentiment/summary', (req: Request, res: Response) => {
    try {
      const summary = getSentimentSummary();
      
      if (!summary) {
        return res.status(404).json({ error: 'Sentiment summary not found' });
      }
      
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load sentiment summary' });
    }
  });

  // Get all sentiment data
  app.get('/sentiment/all', (req: Request, res: Response) => {
    try {
      const allData = getAllSentimentData();
      res.json(allData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load sentiment data' });
    }
  });

  // Get sentiment data for stakeholders in a specific sector
  app.get('/sentiment/sector/:sector', (req: Request, res: Response) => {
    try {
      const sectorName = decodeURIComponent(req.params.sector);
      const allData = getAllSentimentData();
      
      // Map stakeholder names to sectors based on the Master Assessment data
      // This mapping should be updated based on the actual sector assignments in your data
      const sectorMapping: Record<string, string[]> = {
        'Festivals and cultural events': [],
        'Audiovisual (film, photography, TV, videography)': [],
        'Marketing/advertising/publishing': [],
        'Crafts and artisan products': [
          'bakau_craft_market',
          'banjul_craft_market', 
          'brikama_woodcarvers_market',
          'senegambia_craft_market',
          'tanji_village_market'
        ],
        'Fashion & Design': [],
        'Music (artists, production, venues, education)': [],
        'Performing and visual arts': [
          'ebunjan_theatre',
          'ebunjan_theatre_company'
        ],
        'Cultural heritage sites/museums': [
          'abuko_nature_reserve',
          'arch_22_museum',
          'fort_bullen_barra_museum',
          'kachikally_crocodile_pool',
          'kunta_kinteh_island',
          'national_museum_gambia',
          'wassu_stone_circles'
        ]
      };
      
      // Get stakeholders for this sector
      const sectorStakeholders = sectorMapping[sectorName] || [];
      const sectorData = allData.filter(stakeholder => {
        const normalizedName = stakeholder.stakeholder_name.toLowerCase().replace(/\s+/g, '_');
        return sectorStakeholders.includes(normalizedName);
      });
      
      res.json(sectorData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load sector sentiment data' });
    }
  });

  // Get sentiment data for a specific industry
  app.get('/sentiment/industry/:industry', (req: Request, res: Response) => {
    try {
      const industry = req.params.industry as 'creative_industries' | 'tour_operators';
      
      if (industry !== 'creative_industries' && industry !== 'tour_operators') {
        return res.status(400).json({ error: 'Invalid industry. Must be "creative_industries" or "tour_operators"' });
      }
      
      const industryData = getIndustrySentimentData(industry);
      res.json(industryData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load industry sentiment data' });
    }
  });

  // Get sentiment summary for a specific industry
  app.get('/sentiment/industry/:industry/summary', (req: Request, res: Response) => {
    try {
      const industry = req.params.industry as 'creative_industries' | 'tour_operators';
      
      if (industry !== 'creative_industries' && industry !== 'tour_operators') {
        return res.status(400).json({ error: 'Invalid industry. Must be "creative_industries" or "tour_operators"' });
      }
      
      const summary = getIndustrySentimentSummary(industry);
      
      if (!summary) {
        return res.status(404).json({ error: 'Sentiment summary not found for this industry' });
      }
      
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load industry sentiment summary' });
    }
  });
}
