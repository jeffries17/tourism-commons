import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sentiment analysis data types
export type SentimentData = {
  stakeholder_name: string;
  total_reviews: number;
  average_rating: number;
  overall_sentiment: number;
  positive_rate: number;
  language_diversity: number;
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

// Load sentiment analysis data from JSON file
function loadSentimentData(): { summary: SentimentSummary; stakeholder_data: SentimentData[] } | null {
  try {
          const dataPath = path.join(__dirname, '../../sentiment/output/comprehensive_sentiment_analysis_results.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sentiment data:', error);
    return null;
  }
}

// Get sentiment data for a specific stakeholder
export function getStakeholderSentiment(stakeholderName: string): SentimentData | null {
  const data = loadSentimentData();
  if (!data) return null;
  
  return data.stakeholder_data.find(
    stakeholder => stakeholder.stakeholder_name.toLowerCase() === stakeholderName.toLowerCase()
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
      
      // Filter by sector (this would need to be enhanced based on your sector mapping)
      const sectorData = allData.filter(stakeholder => {
        // This is a simple filter - you might need to enhance this based on your data structure
        return stakeholder.stakeholder_name.toLowerCase().includes(sectorName.toLowerCase());
      });
      
      res.json(sectorData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load sector sentiment data' });
    }
  });
}
