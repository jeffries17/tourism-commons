import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useParticipants } from '../services/api';
import { findMatchingParticipantName } from '../utils/nameMatching';
import ThemeComparison from '../components/ThemeComparison';

interface CriticalArea {
  theme: string;
  sentiment_score: number;
  mention_count: number;
  quotes: string[];
  priority: string;
}

interface StakeholderSentiment {
  stakeholder_name: string;
  total_reviews: number;
  average_rating: number;
  overall_sentiment: number;
  positive_rate: number;
  language_distribution?: Record<string, number>;
  year_distribution?: Record<string, number>;
  theme_scores?: Record<string, any>;
  theme_quotes?: Record<string, any>;
  critical_areas?: CriticalArea[];
  improvement_quotes?: {
    general_improvements: string[];
  };
  management_response?: {
    response_rate: number;
    total_responses: number;
    total_reviews: number;
    gap_opportunity: number;
  };
  management_response_rate?: number; // Direct field available for creative & operators
  service_quality_score?: number;
  service_quality_mentions?: number;
  source?: string;
  country?: string;
  sector?: string;
  sector_category?: string;
}

interface SentimentData {
  summary: any;
  stakeholder_data: StakeholderSentiment[];
}

export default function ReviewsSentiment() {
  const [data, setData] = useState<SentimentData | null>(null);
  const [activeTab, setActiveTab] = useState<'creative' | 'operators' | 'regional'>('creative');
  const [viewMode, setViewMode] = useState<'stakeholders' | 'themes'>('stakeholders');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const { data: participants } = useParticipants();

  useEffect(() => {
    const basePath = '';
    
    // Load all three datasets
    Promise.all([
      fetch(`${basePath}/sentiment_data.json`).then(res => res.json()),
      fetch(`${basePath}/tour_operators_sentiment.json`).then(res => res.json()),
      fetch(`${basePath}/regional_sentiment.json`).then(res => res.json())
    ])
      .then(([creativeData, operatorData, regionalData]) => {
        // Add source tags to each stakeholder
        const creativeStakeholders = creativeData.stakeholder_data.map((s: any) => ({
          ...s,
          source: 'creative',
          country: 'Gambia'
        }));
        const operatorStakeholders = operatorData.stakeholder_data.map((s: any) => ({
          ...s,
          source: 'operators',
          country: 'Gambia'
        }));
        const regionalStakeholders = regionalData.stakeholder_data.map((s: any) => ({
          ...s,
          source: 'regional'
        }));
        
        // Combine all data
        setData({
          summary: {},
          stakeholder_data: [...creativeStakeholders, ...operatorStakeholders, ...regionalStakeholders]
        });
      })
      .catch(err => console.error('Failed to load sentiment data:', err));
  }, []);


  if (!data || !data.stakeholder_data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sentiment data...</p>
        </div>
      </div>
    );
  }

  // Filter stakeholders based on active tab and selected country
  const stakeholdersWithReviews = data.stakeholder_data
    .filter(s => {
      if (s.source !== activeTab || s.total_reviews === 0) return false;
      if (activeTab === 'regional' && selectedCountry !== 'all') {
        return s.country === selectedCountry;
      }
      return true;
    });
  
  // Count by source for tabs
  const sourceCount = {
    creative: data.stakeholder_data.filter(s => s.source === 'creative' && s.total_reviews > 0).length,
    operators: data.stakeholder_data.filter(s => s.source === 'operators' && s.total_reviews > 0).length,
    regional: data.stakeholder_data.filter(s => s.source === 'regional' && s.total_reviews > 0).length
  };
  
  // Get available countries for regional tab
  const availableCountries = activeTab === 'regional' 
    ? Array.from(new Set(data.stakeholder_data
        .filter(s => s.source === 'regional' && s.total_reviews > 0)
        .map(s => s.country)
        .filter(c => c)
      )).sort()
    : [];
  
  // Country counts for regional tab
  const countryStats = activeTab === 'regional' 
    ? availableCountries.reduce((acc, country) => {
        if (!country) return acc;
        const countryStakeholders = data.stakeholder_data.filter(
          s => s.source === 'regional' && s.country === country && s.total_reviews > 0
        );
        const totalReviewsForCountry = countryStakeholders.reduce((sum, s) => sum + s.total_reviews, 0);
        acc[country] = {
          count: countryStakeholders.length,
          reviews: totalReviewsForCountry,
          avgSentiment: totalReviewsForCountry > 0 
            ? countryStakeholders.reduce((sum, s) => sum + (s.overall_sentiment * s.total_reviews), 0) / totalReviewsForCountry
            : 0
        };
        return acc;
      }, {} as Record<string, {count: number, reviews: number, avgSentiment: number}>)
    : {};
  
  // Calculate aggregate metrics (with safety checks for empty arrays)
  const totalReviews = stakeholdersWithReviews.reduce((sum, s) => sum + s.total_reviews, 0);
  const avgRating = totalReviews > 0 
    ? stakeholdersWithReviews.reduce((sum, s) => sum + (s.average_rating * s.total_reviews), 0) / totalReviews
    : 0;
  const avgSentiment = totalReviews > 0
    ? stakeholdersWithReviews.reduce((sum, s) => sum + (s.overall_sentiment * s.total_reviews), 0) / totalReviews
    : 0;
  const avgPositiveRate = stakeholdersWithReviews.length > 0
    ? stakeholdersWithReviews.reduce((sum, s) => sum + s.positive_rate, 0) / stakeholdersWithReviews.length
    : 0;
  
  // Calculate average response rate (only for stakeholders that have this data)
  const stakeholdersWithResponseRate = stakeholdersWithReviews.filter(s => s.management_response_rate !== undefined);
  const avgResponseRate = stakeholdersWithResponseRate.length > 0
    ? stakeholdersWithResponseRate.reduce((sum, s) => sum + (s.management_response_rate || 0), 0) / stakeholdersWithResponseRate.length
    : 0;

  // Top and bottom performers
  const topPerformers = [...stakeholdersWithReviews].sort((a, b) => b.overall_sentiment - a.overall_sentiment).slice(0, 5);
  const needsAttention = [...stakeholdersWithReviews].sort((a, b) => a.overall_sentiment - b.overall_sentiment).slice(0, 5);

  // Aggregate reviews by year and sector
  const reviewsByYearAndSector: Record<string, Record<string, number>> = {};
  stakeholdersWithReviews.forEach(stakeholder => {
    if (stakeholder.year_distribution) {
      const sector = stakeholder.sector_category || stakeholder.sector || 'Other';
      Object.entries(stakeholder.year_distribution).forEach(([year, count]) => {
        if (!reviewsByYearAndSector[year]) {
          reviewsByYearAndSector[year] = {};
        }
        reviewsByYearAndSector[year][sector] = (reviewsByYearAndSector[year][sector] || 0) + count;
      });
    }
  });
  
  // Get unique sectors
  const sectors = Array.from(new Set(
    Object.values(reviewsByYearAndSector).flatMap(yearData => Object.keys(yearData))
  )).sort();
  
  // Convert to array with all sectors and filter to 2015+
  const reviewsByYearData = Object.entries(reviewsByYearAndSector)
    .filter(([year]) => parseInt(year) >= 2015)
    .map(([year, sectorData]) => {
      const dataPoint: any = { year };
      sectors.forEach(sector => {
        dataPoint[sector] = sectorData[sector] || 0;
      });
      // Calculate total
      dataPoint.total = Object.values(sectorData).reduce((sum: number, val) => sum + (val as number), 0);
      return dataPoint;
    })
    .sort((a, b) => a.year.localeCompare(b.year));
  
  // Sector colors
  const sectorColors: Record<string, string> = {
    'Heritage Sites': '#8B5CF6',
    'Museums': '#EC4899',
    'Crafts': '#F59E0B',
    'Tour Operators': '#3B82F6',
    'Hotels': '#10B981',
    'Restaurants': '#EF4444',
    'Other': '#6B7280'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reviews & Sentiment Analysis</h1>
              <p className="mt-1 text-sm text-gray-500">
                TripAdvisor review analysis across Gambia and regional competitors
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {activeTab === 'creative' ? 'Creative Industries' : activeTab === 'operators' ? 'Tour Operators' : 'Regional'} Reviews
              </div>
              <div className="text-3xl font-bold text-blue-600">{totalReviews.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => {
                  setActiveTab('creative');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'creative'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <div className="text-left">
                    <div>Creative Industries</div>
                    <div className="text-xs text-gray-500 font-normal">Museums, Heritage Sites, Crafts ({sourceCount.creative})</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('operators');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'operators'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🚐</span>
                  <div className="text-left">
                    <div>Tour Operators</div>
                    <div className="text-xs text-gray-500 font-normal">Gambia Tour Companies ({sourceCount.operators})</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('regional');
                  setSelectedCountry('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'regional'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🌍</span>
                  <div className="text-left">
                    <div>Regional Competitors</div>
                    <div className="text-xs text-gray-500 font-normal">Nigeria, Ghana, Senegal, Benin, Cape Verde ({sourceCount.regional})</div>
                  </div>
                </div>
              </button>
            </nav>
          </div>
          
          {/* Country Filter for Regional Tab */}
          {activeTab === 'regional' && availableCountries.length > 0 && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🗺️</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Country-by-Country Analysis</h3>
                  <p className="text-xs text-purple-700 mb-3">
                    Select a country to see detailed performance metrics and compare against Gambia
                  </p>
                  
                  {/* Country Pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCountry('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCountry === 'all'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      All Countries ({sourceCount.regional})
                    </button>
                    {availableCountries.map(country => {
                      if (!country) return null;
                      return (
                        <button
                          key={country}
                          onClick={() => setSelectedCountry(country)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCountry === country
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          {country} ({countryStats[country]?.count || 0})
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Country Stats Grid */}
                  {selectedCountry === 'all' && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                      {availableCountries.map(country => {
                        if (!country) return null;
                        const stats = countryStats[country];
                        if (!stats) return null;
                        return (
                          <div key={country} className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs font-semibold text-purple-900">{country}</div>
                            <div className="text-lg font-bold text-purple-600">
                              {stats.avgSentiment >= 0 ? '+' : ''}{stats.avgSentiment.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">{stats.reviews} reviews</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {selectedCountry !== 'all' && countryStats[selectedCountry] && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Stakeholders</div>
                          <div className="text-2xl font-bold text-purple-600">{countryStats[selectedCountry].count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Total Reviews</div>
                          <div className="text-2xl font-bold text-purple-600">{countryStats[selectedCountry].reviews.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Avg Sentiment (-1 to +1)</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {countryStats[selectedCountry].avgSentiment >= 0 ? '+' : ''}{countryStats[selectedCountry].avgSentiment.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setViewMode('stakeholders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'stakeholders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Stakeholder View
            </button>
            <button
              onClick={() => setViewMode('themes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'themes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 Theme Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Theme Analysis View */}
        {viewMode === 'themes' && (() => {
          const gambianData = data.stakeholder_data.filter(s => 
            s.source && (s.source === 'creative' || s.source === 'operators') && s.total_reviews > 0
          );
          const regionalData = data.stakeholder_data.filter(s => 
            s.source && s.source === 'regional' && s.total_reviews > 0
          );
          
          return (
            <div>
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎨</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Unified Theme Analysis</p>
                    <p className="text-sm text-gray-700">
                      Comparing Gambia ({gambianData.length} stakeholders, {gambianData.reduce((sum, s) => sum + s.total_reviews, 0).toLocaleString()} reviews) 
                      vs Regional Competitors ({regionalData.length} stakeholders, {regionalData.reduce((sum, s) => sum + s.total_reviews, 0).toLocaleString()} reviews) 
                      across 9 standardized themes
                    </p>
                  </div>
                </div>
              </div>
              
              <ThemeComparison 
                gambianData={gambianData as any}
                regionalData={regionalData as any}
                showRadar={true}
                showBars={true}
                highlightGaps={true}
              />
            </div>
          );
        })()}
        
        {/* Stakeholder View */}
        {viewMode === 'stakeholders' && (
          <>
            {/* Tab-specific intro banners */}
        {activeTab === 'creative' && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎨</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Gambia Creative Industries Performance</p>
                <p className="text-sm text-gray-700">
                  Analysis of {stakeholdersWithReviews.length} creative industry stakeholders including museums, heritage sites, craft markets, and cultural attractions. Gambia ranks <strong className="text-green-700">#2 in West Africa</strong> for visitor sentiment.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'operators' && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚐</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Gambia Tour Operators Performance</p>
                <p className="text-sm text-gray-700">
                  Analysis of {stakeholdersWithReviews.length} local tour operators based on TripAdvisor reviews. These companies provide guided tours, day trips, and cultural experiences across The Gambia.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'regional' && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌍</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCountry === 'all' ? 'Regional Competitive Context' : `${selectedCountry} Performance Analysis`}
                </p>
                <p className="text-sm text-gray-700">
                  {selectedCountry === 'all' 
                    ? `Analysis of ${stakeholdersWithReviews.length} creative industry stakeholders across Nigeria, Ghana, Senegal, Benin, and Cape Verde. Use this data to benchmark Gambia's performance against regional competitors.`
                    : `Detailed analysis of ${stakeholdersWithReviews.length} stakeholders in ${selectedCountry} with ${totalReviews.toLocaleString()} reviews. Compare these metrics against Gambia to identify opportunities and best practices.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Average Rating</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
              <div className="ml-2 text-gray-500">/ 5.0</div>
            </div>
            <div className="mt-1 text-xs text-gray-600">{'⭐'.repeat(Math.round(avgRating))}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Avg Sentiment</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-bold text-green-600">{avgSentiment >= 0 ? '+' : ''}{avgSentiment.toFixed(3)}</div>
              <div className="ml-2 text-xs text-gray-500">(-1 to +1)</div>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {avgSentiment >= 0.6 ? 'Very Positive' : avgSentiment >= 0.3 ? 'Positive' : avgSentiment >= 0 ? 'Neutral' : 'Negative'}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Positive Rate</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-bold text-blue-600">{avgPositiveRate.toFixed(0)}%</div>
            </div>
            <div className="mt-1 text-xs text-gray-600">Reviews with positive sentiment</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Response Rate</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-3xl font-bold text-red-600">{avgResponseRate.toFixed(0)}%</div>
            </div>
            <div className="mt-1 text-xs text-red-600">⚠️ Opportunity for engagement</div>
          </div>
        </div>

        {/* Top Performers & Needs Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h3 className="text-lg font-semibold text-green-900">🌟 Top Performers</h3>
              <p className="text-sm text-green-700">Highest visitor satisfaction</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topPerformers.map((stakeholder, idx) => (
                  <Link
                    key={idx}
                    to={`/participant/${encodeURIComponent(stakeholder.stakeholder_name.replace(/_/g, ' '))}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {stakeholder.stakeholder_name.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-yellow-600 font-medium">
                            {stakeholder.average_rating.toFixed(1)} ⭐
                          </span>
                          <span className="text-gray-600">
                            {stakeholder.total_reviews} reviews
                          </span>
                          <span className="text-green-600 font-medium">
                            {stakeholder.overall_sentiment >= 0 ? '+' : ''}{stakeholder.overall_sentiment.toFixed(3)} sentiment
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">#{idx + 1}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <h3 className="text-lg font-semibold text-red-900">⚠️ Needs Attention</h3>
              <p className="text-sm text-red-700">Lower visitor satisfaction - priority for improvement</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {needsAttention.map((stakeholder, idx) => (
                  <Link
                    key={idx}
                    to={`/participant/${encodeURIComponent(stakeholder.stakeholder_name.replace(/_/g, ' '))}`}
                    className="block border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {stakeholder.stakeholder_name.replace(/_/g, ' ')}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-yellow-600 font-medium">
                            {stakeholder.average_rating.toFixed(1)} ⭐
                          </span>
                          <span className="text-gray-600">
                            {stakeholder.total_reviews} reviews
                          </span>
                          <span className={`font-medium ${stakeholder.overall_sentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stakeholder.overall_sentiment >= 0 ? '+' : ''}{stakeholder.overall_sentiment.toFixed(3)} sentiment
                          </span>
                        </div>
                        {stakeholder.critical_areas && stakeholder.critical_areas.length > 0 && (
                          <div className="mt-2 text-xs text-red-600">
                            🚨 {stakeholder.critical_areas.length} critical area(s) identified
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews by Year Chart */}
        {reviewsByYearData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews by Year (2015+) by Sector</h3>
            <p className="text-sm text-gray-600 mb-4">
              Review volume trends over time across {stakeholdersWithReviews.length} stakeholders, broken down by sector
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={reviewsByYearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  tick={{fontSize: 12}}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend />
                {sectors.map((sector) => (
                  <Area
                    key={sector}
                    type="monotone"
                    dataKey={sector}
                    stackId="1"
                    stroke={sectorColors[sector] || '#6B7280'}
                    fill={sectorColors[sector] || '#6B7280'}
                    name={sector}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Management Response Opportunity - Only show for creative & operators tabs */}
        {activeTab !== 'regional' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💬</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Management Response Opportunity</h3>
                <p className="text-gray-700 mb-4">
                  <strong>{avgResponseRate.toFixed(0)}% average response rate</strong> - Most stakeholders are not responding to reviews!
                </p>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📈 Potential Impact of Responding:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>Builds trust:</strong> Shows visitors their feedback matters</li>
                    <li>• <strong>Improves ratings:</strong> Studies show response rates correlate with higher ratings</li>
                    <li>• <strong>Addresses issues:</strong> Opportunity to explain, apologize, or offer solutions</li>
                    <li>• <strong>Shows commitment:</strong> Demonstrates ongoing improvement efforts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Stakeholders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Stakeholders with Reviews</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stakeholder</th>
                  {activeTab === 'regional' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment (-1 to +1)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positive %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stakeholdersWithReviews.map((stakeholder, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {stakeholder.stakeholder_name.replace(/_/g, ' ')}
                      </div>
                    </td>
                    {activeTab === 'regional' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {stakeholder.country}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {stakeholder.total_reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-yellow-600">
                        {stakeholder.average_rating.toFixed(1)} ⭐
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          stakeholder.overall_sentiment >= 0.6 ? 'bg-green-100 text-green-800' :
                          stakeholder.overall_sentiment >= 0.3 ? 'bg-blue-100 text-blue-800' :
                          stakeholder.overall_sentiment >= 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {stakeholder.overall_sentiment >= 0 ? '+' : ''}{stakeholder.overall_sentiment.toFixed(3)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {stakeholder.positive_rate.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stakeholder.management_response_rate !== undefined ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          stakeholder.management_response_rate > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {stakeholder.management_response_rate.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(() => {
                        const participantName = findMatchingParticipantName(
                          stakeholder.stakeholder_name,
                          participants || []
                        );
                        return participantName ? (
                          <Link
                            to={`/participant/${encodeURIComponent(participantName)}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details →
                          </Link>
                        ) : null;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

