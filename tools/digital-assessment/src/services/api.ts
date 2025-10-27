import { useQuery } from '@tanstack/react-query';
import type { Assessment, DashboardData, TechnicalAudit, TechnicalHealthSummary } from '../types/index';

// API Base URL - will be proxied in development
const API_BASE = '/api';

// Fetch functions
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

const fetchParticipants = async (sector?: string): Promise<Assessment[]> => {
  const url = sector ? `${API_BASE}/participants?sector=${sector}` : `${API_BASE}/participants`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch participants');
  return response.json();
};

const fetchParticipantDetail = async (name: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/participant/plan?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('Failed to fetch participant details');
  return response.json();
};

const fetchParticipantOpportunities = async (name: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/participant/opportunities?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('Failed to fetch opportunities');
  return response.json();
};

const fetchSectors = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/sectors`);
  if (!response.ok) throw new Error('Failed to fetch sectors');
  return response.json();
};

const fetchTechnicalAudits = async (): Promise<TechnicalAudit[]> => {
  const response = await fetch(`${API_BASE}/technical-audit`);
  if (!response.ok) throw new Error('Failed to fetch technical audits');
  return response.json();
};

const fetchTechnicalHealthSummary = async (): Promise<TechnicalHealthSummary> => {
  const response = await fetch(`${API_BASE}/technical-audit/summary`);
  if (!response.ok) throw new Error('Failed to fetch technical health summary');
  return response.json();
};

const fetchStakeholderTechnicalAudit = async (name: string): Promise<TechnicalAudit | null> => {
  const response = await fetch(`${API_BASE}/technical-audit/${encodeURIComponent(name)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch stakeholder technical audit');
  }
  return response.json();
};

// React Query Hooks
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });
};

export const useParticipants = (sector?: string) => {
  return useQuery({
    queryKey: ['participants', sector],
    queryFn: () => fetchParticipants(sector),
  });
};

export const useParticipantDetail = (name: string) => {
  return useQuery({
    queryKey: ['participant', name],
    queryFn: () => fetchParticipantDetail(name),
    enabled: !!name,
  });
};

export const useParticipantOpportunities = (name: string) => {
  return useQuery({
    queryKey: ['opportunities', name],
    queryFn: () => fetchParticipantOpportunities(name),
    enabled: !!name,
  });
};

export const useSectors = () => {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: fetchSectors,
  });
};

export const useTechnicalAudits = () => {
  return useQuery({
    queryKey: ['technical-audits'],
    queryFn: fetchTechnicalAudits,
  });
};

export const useTechnicalHealthSummary = () => {
  return useQuery({
    queryKey: ['technical-health-summary'],
    queryFn: fetchTechnicalHealthSummary,
  });
};

export const useStakeholderTechnicalAudit = (name: string) => {
  return useQuery({
    queryKey: ['technical-audit', name],
    queryFn: () => fetchStakeholderTechnicalAudit(name),
    enabled: !!name,
  });
};

// Sector Baseline API
const fetchSectorBaseline = async (sectorName: string): Promise<import('../types').SectorBaseline> => {
  const response = await fetch(`${API_BASE}/sector/${encodeURIComponent(sectorName)}/baseline`);
  if (!response.ok) throw new Error('Failed to fetch sector baseline');
  return response.json();
};

export const useSectorBaseline = (sectorName: string) => {
  return useQuery({
    queryKey: ['sector-baseline', sectorName],
    queryFn: () => fetchSectorBaseline(sectorName),
    enabled: !!sectorName,
  });
};

// Platform Adoption APIs
const fetchOverallPlatformAdoption = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/platform-adoption/overall`);
  if (!response.ok) throw new Error('Failed to fetch overall platform adoption');
  return response.json();
};

const fetchPlatformAdoptionBySector = async (): Promise<any> => {
  const response = await fetch(`${API_BASE}/platform-adoption/by-sector`);
  if (!response.ok) throw new Error('Failed to fetch platform adoption by sector');
  return response.json();
};

export const useOverallPlatformAdoption = () => {
  return useQuery({
    queryKey: ['platform-adoption-overall'],
    queryFn: fetchOverallPlatformAdoption,
  });
};

export const usePlatformAdoptionBySector = () => {
  return useQuery({
    queryKey: ['platform-adoption-by-sector'],
    queryFn: fetchPlatformAdoptionBySector,
  });
};

// Sentiment Data API
const fetchSentimentData = async (): Promise<any> => {
  const response = await fetch('/sentiment_data.json');
  if (!response.ok) throw new Error('Failed to fetch sentiment data');
  return response.json();
};

export const useSentimentData = () => {
  return useQuery({
    queryKey: ['sentiment-data'],
    queryFn: fetchSentimentData,
  });
};

// Export API base for direct use if needed
export { API_BASE };

