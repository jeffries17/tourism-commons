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
  const url = new URL(`${API_URL}/participants`);
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
  quickWins: Array<{ opportunity: string; currentToTarget: string; actions: string[]; timeframe: string; cost: string; impact: string }>;
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

export async function fetchOpportunities(name: string): Promise<{ opportunities: any[]; quickWins: any[] }> {
  const res = await fetch(`${API_URL}/participant/opportunities?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to load opportunities');
  return res.json();
}


