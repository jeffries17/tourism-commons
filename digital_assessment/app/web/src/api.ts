export type Participant = { name: string; sector: string };
export type AssessmentStats = {
  totalAssessments: number;
  averageScores: { external: number; survey: number; combined: number };
  maturityDistribution: Record<string, number>;
  sectorBreakdown: Record<string, {
    count: number;
    totalExternal: number;
    totalSurvey: number;
    totalCombined: number;
    averageExternal: number;
    averageSurvey: number;
    averageCombined: number;
  }>;
};

const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:8787')
  : '/api';

export async function fetchSectors(): Promise<string[]> {
  const res = await fetch(`${API_URL}/sectors`);
  if (!res.ok) throw new Error('Failed to load sectors');
  return res.json();
}

export async function fetchParticipants(sector?: string): Promise<Participant[]> {
  const baseUrl = API_URL.startsWith('http') ? API_URL : `${window.location.origin}${API_URL}`;
  const url = new URL(`${baseUrl}/participants`);
  if (sector) url.searchParams.set('sector', sector);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load participants');
  return res.json();
}

export async function fetchTourOperators(): Promise<Participant[]> {
  const res = await fetch(`${API_URL}/tour-operators`);
  if (!res.ok) throw new Error('Failed to load tour operators');
  return res.json();
}

export async function fetchStats(): Promise<AssessmentStats> {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

// New analysis API types and clients
export type Dashboard = {
  sheetName: string;
  total: number;
  maturity: Record<string, number>;
  sectors: Array<{ sector: string; count: number; avgExternal: number; avgSurvey: number; avgCombined: number; completionRate: number }>;
  participants: Array<{ name: string; sector: string; external: number; survey: number; combined: number; maturity: string }>;
  categoryAverages: { socialMedia: number; website: number; visualContent: number; discoverability: number; digitalSales: number; platformIntegration: number };
  sectorStacked: Record<string, { Absent: number; Emerging: number; Intermediate: number; Advanced: number; Expert: number; total: number }>;
  overall: { withExternal: number; withSurvey: number; complete: number; avgExternal: number; avgSurvey: number; avgCombined: number };
};

export async function fetchDashboard(): Promise<Dashboard> {
  const res = await fetch(`${API_URL}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export type Plan = {
  profile: { name: string; sector: string; region: string; maturity: string; scores: Record<string, number> };
  external: { breakdown: Array<{ key: string; label: string; score: number; sectorAvg: number; max: number }> };
  opportunities: Array<{ category: string; current: string; target: string; actions: string[]; timeframe: string; cost: string; impact: string }>;
  reasons: any;
};

export async function fetchPlan(name: string): Promise<Plan> {
  const res = await fetch(`${API_URL}/participant/plan?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load plan');
  return res.json();
}

export async function fetchJustifications(name: string): Promise<Record<string, string>> {
  const res = await fetch(`${API_URL}/participant/justifications?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load justifications');
  return res.json();
}

export async function fetchPresence(name: string): Promise<Record<string, string>> {
  const res = await fetch(`${API_URL}/participant/presence?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load presence');
  return res.json();
}

export async function fetchSectorContext(name: string): Promise<{ sector: string; priorityArea: string; recommendations: string[]; total: number }> {
  const res = await fetch(`${API_URL}/participant/sector-context?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load sector context');
  return res.json();
}

export async function fetchOpportunities(name: string): Promise<{ customOpportunities: any[]; generatedOpportunities: any[] }> {
  const res = await fetch(`${API_URL}/participant/opportunities?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load opportunities');
  return res.json();
}

// Sector Intelligence Dashboard API functions
export async function fetchSectorOverview(sectorName: string): Promise<{
  sector: string;
  totalStakeholders: number;
  participationRate: number;
  avgExternal: number;
  avgSurvey: number;
  avgCombined: number;
  maturityDistribution: Record<string, number>;
  categoryAverages: Record<string, number>;
  completionStats: {
    withExternal: number;
    withSurvey: number;
    complete: number;
    externalRate: number;
    surveyRate: number;
  };
}> {
  const res = await fetch(`${API_URL}/sector/overview?name=${encodeURIComponent(sectorName)}`);
  if (!res.ok) throw new Error('Failed to load sector overview');
  return res.json();
}

export async function fetchSectorRanking(type: 'creative' | 'all' = 'all'): Promise<{
  type: string;
  sectors: Array<{
    sector: string;
    avgCombined: number;
    participationRate: number;
    totalStakeholders: number;
    completeAssessments: number;
    rank: number;
  }>;
  totalSectors: number;
}> {
  const res = await fetch(`${API_URL}/sector/ranking?type=${type}`);
  if (!res.ok) throw new Error('Failed to load sector ranking');
  return res.json();
}

export async function fetchSectorLeaders(sectorName: string): Promise<{
  sector: string;
  leaders: Array<{
    name: string;
    combinedScore: number;
    externalScore: number;
    surveyScore: number;
    maturityLevel: string;
    region: string;
  }>;
}> {
  const res = await fetch(`${API_URL}/sector/leaders?name=${encodeURIComponent(sectorName)}`);
  if (!res.ok) throw new Error('Failed to load sector leaders');
  return res.json();
}

export async function fetchSectorCategoryComparison(sectorName: string, compareWith: 'creative' | 'all' = 'all'): Promise<{
  targetSector: {
    sector: string;
    categoryAverages: Record<string, number>;
    participantCount: number;
  } | null;
  otherSectors: Array<{
    sector: string;
    categoryAverages: Record<string, number>;
    participantCount: number;
  }>;
  comparisonType: string;
  categories: string[];
  categoryLabels: Record<string, string>;
}> {
  const res = await fetch(`${API_URL}/sector/category-comparison?name=${encodeURIComponent(sectorName)}&compare=${compareWith}`);
  if (!res.ok) throw new Error('Failed to load sector category comparison');
  return res.json();
}

// Sentiment Analysis API types and functions
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

export async function fetchStakeholderSentiment(stakeholderName: string): Promise<SentimentData> {
  const res = await fetch(`${API_URL}/sentiment/stakeholder/${encodeURIComponent(stakeholderName)}`);
  if (!res.ok) throw new Error('Failed to load stakeholder sentiment data');
  return res.json();
}

export async function fetchSentimentSummary(): Promise<SentimentSummary> {
  const res = await fetch(`${API_URL}/sentiment/summary`);
  if (!res.ok) throw new Error('Failed to load sentiment summary');
  return res.json();
}

export async function fetchAllSentimentData(): Promise<SentimentData[]> {
  const res = await fetch(`${API_URL}/sentiment/all`);
  if (!res.ok) throw new Error('Failed to load sentiment data');
  return res.json();
}

export async function fetchSectorSentiment(sectorName: string): Promise<SentimentData[]> {
  const res = await fetch(`${API_URL}/sentiment/sector/${encodeURIComponent(sectorName)}`);
  if (!res.ok) throw new Error('Failed to load sector sentiment data');
  return res.json();
}


