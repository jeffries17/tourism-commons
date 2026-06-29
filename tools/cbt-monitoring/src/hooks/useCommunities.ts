import { useQuery } from '@tanstack/react-query';
import type { CbtCommunity } from '../types/index';

// Option 2: Fetch from API endpoint
async function fetchCommunitiesFromAPI(authority?: string): Promise<CbtCommunity[]> {
  const API_BASE = '/api';
  const url = authority 
    ? `${API_BASE}/cbt/communities?authority=${authority}`
    : `${API_BASE}/cbt/communities`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // If API doesn't exist yet, return empty array (for MVP without backend)
      if (response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch communities');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.communities || []);
  } catch (error) {
    console.error('Error fetching communities:', error);
    // Return mock data for development/testing
    if (import.meta.env.DEV) {
      return getMockCommunities();
    }
    return [];
  }
}

// Mock data for development (remove in production)
function getMockCommunities(): CbtCommunity[] {
  const today = new Date();
  return [
    {
      id: 'ejubukweni',
      community: 'Ejubukweni',
      region: 'Hhohho',
      contactPerson: 'John Mamba',
      contactInfo: 'john@example.com',
      responsibleStaff: 'Jane Dlamini',
      lastUpdate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysSinceUpdate: 5,
      status: 'green',
      engagementCount: 3,
      contentCount: 2,
      nextVisit: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      id: 'lobamba',
      community: 'Lobamba',
      region: 'Hhohho',
      contactPerson: 'Sarah Khumalo',
      responsibleStaff: 'Jane Dlamini',
      lastUpdate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysSinceUpdate: 20,
      status: 'yellow',
      engagementCount: 1,
      contentCount: 0,
      nextVisit: null,
    },
    {
      id: 'malkerns',
      community: 'Malkerns',
      region: 'Manzini',
      contactPerson: 'Peter Dlamini',
      responsibleStaff: 'Thabo Mabuza',
      lastUpdate: new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysSinceUpdate: 35,
      status: 'red',
      engagementCount: 0,
      contentCount: 0,
      nextVisit: null,
    },
  ];
}

export function useCommunities(authority?: string) {
  return useQuery({
    queryKey: ['cbt-communities', authority],
    queryFn: () => fetchCommunitiesFromAPI(authority), // Start with API, can switch to Firebase later
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

