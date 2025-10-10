import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { currentCountry } from '../config/index';
import { useDashboardData, useOverallPlatformAdoption, useSentimentData } from '../services/api';
import TechnicalHealthOverview from '../components/sections/TechnicalHealthOverview';
import Tooltip from '../components/common/Tooltip';
import { getThemeDisplayName, getThemeIcon, getThemeDescription, UNIFIED_THEMES } from '../constants/themes';

function ThemeCountryComparison() {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const { data: sentimentData } = useSentimentData();
  const [regionalData, setRegionalData] = useState<any>(null);
  const [operatorsData, setOperatorsData] = useState<any>(null);
  
  // Example keywords that trigger each theme
  const themeExamples: Record<string, string> = {
    'cultural_heritage': 'authentic, traditional, history, heritage, culture, local customs',
    'service_staff': 'friendly, helpful, knowledgeable, attentive, professional, welcoming',
    'facilities_infrastructure': 'clean, well-maintained, modern, comfortable, facilities, amenities',
    'accessibility_transport': 'easy to find, accessible, convenient location, transportation, parking',
    'value_money': 'worth it, affordable, expensive, good value, price, reasonable',
    'safety_security': 'safe, secure, comfortable, dangerous, sketchy, theft',
    'educational_value': 'informative, learned, educational, interesting facts, guided tour',
    'artistic_creative': 'beautiful, artistic, creative, craftsmanship, stunning, unique',
    'atmosphere_experience': 'amazing, wonderful, memorable, atmosphere, vibe, overall experience'
  };
  
  useEffect(() => {
    const basePath = import.meta.env.PROD ? '/gambia-itc' : '';
    Promise.all([
      fetch(`${basePath}/regional_sentiment.json`).then(res => res.json()),
      fetch(`${basePath}/tour_operators_sentiment.json`).then(res => res.json())
    ])
      .then(([regional, operators]) => {
        setRegionalData(regional);
        setOperatorsData(operators);
      })
      .catch(err => console.error('Failed to load theme data:', err));
  }, []);
  
  if (!sentimentData || !regionalData || !operatorsData) {
    return (
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Regional Theme Comparison</h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare how The Gambia performs against Nigeria, Ghana, Senegal, Benin, and Cape Verde across key visitor experience themes.
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[400px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-32 bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const gambianStakeholders = [
    ...(sentimentData.stakeholder_data || []),
    ...(operatorsData.stakeholder_data || [])
  ].filter((s: any) => s.total_reviews > 0);
  
  const regionalStakeholders = (regionalData.stakeholder_data || [])
    .filter((s: any) => s.total_reviews > 0);
  
  const calculateThemeAvg = (stakeholders: any[], theme: string) => {
    const scores: number[] = [];
    stakeholders.forEach(s => {
      if (s.theme_scores && s.theme_scores[theme] && s.theme_scores[theme].mentions > 0) {
        scores.push(s.theme_scores[theme].score);
      }
    });
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  };
  
  const countriesList = ['Nigeria', 'Ghana', 'Senegal', 'Benin', 'Cape Verde'];
  const countryColors = {
    'Gambia': '#10b981',
    'Nigeria': '#3b82f6',
    'Ghana': '#f59e0b',
    'Senegal': '#ec4899',
    'Benin': '#8b5cf6',
    'Cape Verde': '#06b6d4'
  };
  
  const themeComparison = UNIFIED_THEMES.map(theme => {
    const gambiaScore = calculateThemeAvg(gambianStakeholders, theme);
    const countryScores: { [country: string]: number | null } = {
      'Gambia': gambiaScore
    };
    
    countriesList.forEach(country => {
      const countryStakeholders = regionalStakeholders.filter((s: any) => s.country === country);
      countryScores[country] = calculateThemeAvg(countryStakeholders, theme);
    });
    
    // Find the highest scoring country
    const allScores = Object.entries(countryScores).filter(([_, score]) => score !== null);
    const topCountry = allScores.length > 0 
      ? allScores.reduce((prev, curr) => (curr[1]! > prev[1]! ? curr : prev))
      : null;
    
    return {
      theme,
      name: getThemeDisplayName(theme),
      icon: getThemeIcon(theme),
      gambia: gambiaScore,
      countryScores,
      topCountry: topCountry ? topCountry[0] : null,
      topScore: topCountry ? topCountry[1] : null,
      hasData: allScores.length > 0
    };
  }).filter(t => t.hasData).sort((a, b) => {
    const aScore = a.gambia || -999;
    const bScore = b.gambia || -999;
    return bScore - aScore; // Sort by Gambia's score descending
  });
  
  const currentTheme = themeComparison[selectedTheme];
  const allCountries = ['Gambia', ...countriesList];
  
  return (
    <div>
      <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Regional Theme Comparison</h2>
      <p className="text-sm text-gray-600 mb-4">
        Compare how The Gambia performs against Nigeria, Ghana, Senegal, Benin, and Cape Verde across key visitor experience themes. Scale: -1 (negative) to +1 (positive).
      </p>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Theme Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max">
            {themeComparison.map((theme, idx) => (
              <button
                key={theme.theme}
                onClick={() => setSelectedTheme(idx)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  selectedTheme === idx
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{theme.icon}</span>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Current Theme Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentTheme.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentTheme.name}</h3>
                <p className="text-xs text-gray-500">
                  {currentTheme.topCountry ? (
                    currentTheme.topCountry === 'Gambia' ? (
                      <span className="text-green-600">✓ Gambia leads with {currentTheme.topScore?.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-600">
                        {currentTheme.topCountry} leads with {currentTheme.topScore?.toFixed(2)}
                        {currentTheme.gambia !== null && ` • Gambia: ${currentTheme.gambia.toFixed(2)}`}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400">Limited data</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Theme {selectedTheme + 1} of {themeComparison.length}</div>
            </div>
          </div>
          
          {/* Theme Context */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">What we measure:</span> {getThemeDescription(currentTheme.theme)}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Example keywords:</span> {themeExamples[currentTheme.theme]}
            </p>
          </div>
          
          {/* Country Bars */}
          <div className="space-y-3">
            {allCountries.map(country => {
              const score = currentTheme.countryScores[country];
              const isGambia = country === 'Gambia';
              
              if (score === null) return null;
              
              return (
                <div key={country} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 font-medium">
                    {country}
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 z-10"></div>
                    <div 
                      className={`absolute top-0 bottom-0 ${isGambia ? 'bg-green-500' : 'bg-blue-400'} transition-all duration-300`}
                      style={{ 
                        left: score >= 0 ? '50%' : `${((score + 1) / 2) * 100}%`,
                        width: score >= 0 ? `${(score / 2) * 100}%` : `${((Math.abs(score)) / 2) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className={`w-16 text-right text-sm font-bold ${
                    score > 0.1 ? 'text-green-600' : score < -0.1 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {score.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Gambia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-gray-600">Regional Countries</span>
              </div>
            </div>
            <span className="text-gray-500">Scale: -1 (negative) to +1 (positive)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Link to="/reviews-sentiment" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
          <span>View detailed sentiment analysis</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useDashboardData();
  const { data: platformData, isLoading: platformLoading } = useOverallPlatformAdoption();
  const { data: sentimentData } = useSentimentData();

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading dashboard: {(error as Error).message}</p>
        <p className="text-sm text-red-600 mt-2">Make sure Firebase Functions are running locally</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Digital Assessment Dashboard
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            This dashboard provides an overview of digital readiness across creative industries and tourism sectors in {currentCountry.name}. 
            Explore sector performance, digital maturity levels, and technical capabilities to identify strengths and opportunities for growth.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{currentCountry.name}</p>
          <p className="text-xs text-gray-400 mt-1">Assessment 2024-2025</p>
        </div>
      </div>

      {/* Key Insights */}
      {!isLoading && data && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-heading font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Key Insights
            </h2>
            <p className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900">
                {data.total} stakeholders assessed
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {data.sectors.find(s => s.sector.toLowerCase().includes('tour'))?.count || 0} tour operators, {data.sectors.filter(s => !s.sector.toLowerCase().includes('tour')).reduce((sum, s) => sum + s.count, 0) || 0} creative industry participants
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900">
                {Math.max(...Object.values(data.maturity))} stakeholders in most common maturity level
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {Object.entries(data.maturity)
                  .sort((a, b) => b[1] - a[1])[0][0]} is the predominant digital maturity stage
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900">
                {data.sectors.length} sectors represented
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Highest performing: {data.sectors.sort((a, b) => b.avgCombined - a.avgCombined)[0].sector}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Overview */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Assessment Overview</h2>
        <p className="text-sm text-gray-600 mb-4">
          Participation statistics showing total stakeholders assessed and survey completion rates across external evaluation and self-reported surveys.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Participants</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '...' : data?.total || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Tour Operators</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '...' : data?.sectors.find(s => s.sector.toLowerCase().includes('tour'))?.count || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Creative Industry</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '...' : data?.sectors.filter(s => !s.sector.toLowerCase().includes('tour')).reduce((sum, s) => sum + s.count, 0) || 0}
          </p>
        </div>
        </div>
      </div>

      {/* Digital Platform Adoption */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Digital Platform Adoption</h2>
        <p className="text-sm text-gray-600 mb-4">
          Overall platform presence across all creative industries and tourism stakeholders. 
          These metrics show how many organizations have established presences on each platform.
        </p>
        {platformLoading ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : platformData ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-3xl mb-2">🌐</div>
                <div className="text-3xl font-bold text-blue-900">{platformData.platforms.website.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">Website</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.website.count} of {platformData.total}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-3xl mb-2">📘</div>
                <div className="text-3xl font-bold text-blue-900">{platformData.platforms.facebook.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">Facebook</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.facebook.count} of {platformData.total}</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-3xl font-bold text-pink-900">{platformData.platforms.instagram.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">Instagram</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.instagram.count} of {platformData.total}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-3xl mb-2">▶️</div>
                <div className="text-3xl font-bold text-red-900">{platformData.platforms.youtube.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">YouTube</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.youtube.count} of {platformData.total}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-3xl mb-2">🎵</div>
                <div className="text-3xl font-bold text-purple-900">{platformData.platforms.tiktok.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">TikTok</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.tiktok.count} of {platformData.total}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-3xl mb-2">✈️</div>
                <div className="text-3xl font-bold text-green-900">{platformData.platforms.tripadvisor.percentage}%</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">TripAdvisor</div>
                <div className="text-xs text-gray-500 mt-1">{platformData.platforms.tripadvisor.count} of {platformData.total}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link to="/sectors" className="text-primary hover:underline text-sm font-medium">
                View platform adoption by sector →
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Creative Industry + Tourism Sectors */}
      {!isLoading && data && (
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Creative Industry + Tourism Analysis</h2>
          <p className="text-sm text-gray-600 mb-4">
            Digital readiness scores across all sectors, combining online presence assessment with self-reported survey data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.sectors.map((sector) => {
              const isTourOperator = sector.sector.toLowerCase().includes('tour');

              // Determine icon based on sector name
              const getIcon = (sectorName: string) => {
                const name = sectorName.toLowerCase();
                if (name.includes('tour')) return '🚐';
                if (name.includes('festival') || name.includes('event')) return '🎪';
                if (name.includes('craft') || name.includes('art')) return '🎨';
                if (name.includes('cultural') || name.includes('site') || name.includes('museum')) return '🏛️';
                if (name.includes('music') || name.includes('audio')) return '🎵';
                if (name.includes('media') || name.includes('film') || name.includes('video')) return '🎬';
                if (name.includes('design') || name.includes('fashion')) return '✨';
                if (name.includes('food') || name.includes('culinary')) return '🍽️';
                return '🎭';
              };
              
              return (
                <div 
                  key={sector.sector} 
                  className={`p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                    isTourOperator 
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3 className="text-base font-heading font-semibold text-gray-900 leading-tight break-words">
                      {sector.sector}
                    </h3>
                    <span className="text-2xl flex-shrink-0">{getIcon(sector.sector)}</span>
                  </div>
                  
                  <div className="space-y-3 flex-grow">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600 mb-1">Digital Readiness</span>
                      <span className={`text-2xl font-bold ${isTourOperator ? 'text-blue-900' : 'text-purple-900'}`}>
                        {sector.avgCombined}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600">Participants</span>
                      <span className="text-sm font-semibold text-gray-900">{sector.count}</span>
                    </div>
                  </div>
                  
                  {/* View More Button */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link 
                      to={`/sectors/${encodeURIComponent(sector.sector)}`}
                      className={`block text-center text-sm font-medium py-2 px-4 rounded transition-colors ${
                        isTourOperator
                          ? 'text-blue-700 hover:bg-blue-100'
                          : 'text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      View More →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gambia Theme Performance Breakdown */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Visitor Perception of The Gambia</h2>
        <p className="text-sm text-gray-600 mb-4">
          Analysis of visitor reviews across 9 key themes, measured on a scale of -1 (negative) to +1 (positive). 
          These sentiment scores reflect how tourists and visitors perceive different aspects of The Gambia's tourism and creative industries.
        </p>
        {sentimentData && sentimentData.stakeholder_data && sentimentData.stakeholder_data.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {UNIFIED_THEMES.map(theme => {
                const gambianStakeholders = sentimentData.stakeholder_data || [];
                const scores: number[] = [];
                gambianStakeholders.forEach((s: any) => {
                  if (s.theme_scores && s.theme_scores[theme] && s.theme_scores[theme].mentions > 0) {
                    scores.push(s.theme_scores[theme].score);
                  }
                });
                const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                
                if (avgScore === null) return null;
                
                const getSentimentColor = (score: number) => {
                  if (score >= 0.5) return 'text-green-600';
                  if (score >= 0.3) return 'text-green-500';
                  if (score >= 0.1) return 'text-blue-500';
                  if (score >= -0.1) return 'text-gray-500';
                  if (score >= -0.3) return 'text-orange-500';
                  return 'text-red-600';
                };
                
                const getSentimentBg = (score: number) => {
                  if (score >= 0.5) return 'bg-green-50 border-green-200';
                  if (score >= 0.3) return 'bg-green-50 border-green-100';
                  if (score >= 0.1) return 'bg-blue-50 border-blue-100';
                  if (score >= -0.1) return 'bg-gray-50 border-gray-200';
                  if (score >= -0.3) return 'bg-orange-50 border-orange-200';
                  return 'bg-red-50 border-red-200';
                };
                
                return (
                  <div key={theme} className={`p-4 rounded-lg border ${getSentimentBg(avgScore)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getThemeIcon(theme)}</span>
                          <p className="text-sm font-medium text-gray-700">{getThemeDisplayName(theme)}</p>
                        </div>
                        <p className={`text-2xl font-bold ${getSentimentColor(avgScore)}`}>
                          {avgScore.toFixed(2)}
                        </p>
                        <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all ${avgScore >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ 
                              width: `${Math.abs(avgScore) * 100}%`,
                              marginLeft: avgScore < 0 ? `${50 - (Math.abs(avgScore) * 50)}%` : '50%'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on {scores.length} stakeholder{scores.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span className="font-medium">Total Reviews Analyzed:</span> {sentimentData.stakeholder_data?.reduce((sum: number, s: any) => sum + (s.total_reviews || 0), 0).toLocaleString() || 0}
                {' '} • {' '}
                <span className="font-medium">Stakeholders:</span> {sentimentData.stakeholder_data?.length || 0}
              </div>
              <Link to="/reviews-sentiment" className="text-primary hover:underline text-sm font-medium">
                View detailed sentiment analysis →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[300px]">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="p-4 rounded-lg bg-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme Performance Overview */}
      <ThemeCountryComparison />

      {/* Digital Maturity Distribution */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          <Tooltip content="A framework that classifies digital capabilities from no presence to expert-level engagement">
            Digital Maturity
          </Tooltip> Distribution
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Classification of stakeholders by digital maturity level, from{' '}
          <Tooltip content="No digital presence or online visibility">
            <span className="font-medium">Absent</span>
          </Tooltip>{' '}
          (no digital presence) to{' '}
          <Tooltip content="Comprehensive digital strategy with advanced tools, analytics, and multi-channel engagement">
            <span className="font-medium">Expert</span>
          </Tooltip>{' '}
          (comprehensive, strategic digital engagement). 
          This shows the current state of digital adoption across all assessed organizations.
        </p>
        {data && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(data.maturity).map(([level, count]) => {
              const getMaturityColor = (level: string) => {
                const colors: Record<string, string> = {
                  'Absent': 'bg-red-100 border-red-200 text-red-900',
                  'Emerging': 'bg-red-50 border-red-100 text-red-800',
                  'Intermediate': 'bg-yellow-50 border-yellow-100 text-yellow-900',
                  'Advanced': 'bg-green-50 border-green-100 text-green-800',
                  'Expert': 'bg-green-100 border-green-200 text-green-900'
                };
                return colors[level] || 'bg-gray-50 border-gray-200 text-gray-900';
              };
              
              return (
                <div key={level} className={`p-3 rounded-lg text-center border ${getMaturityColor(level)}`}>
                  <p className="text-sm opacity-80">{level}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Performance */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Category Performance</h2>
        <p className="text-sm text-gray-600 mb-4">
          Average scores across six key digital capability categories. These metrics assess{' '}
          <Tooltip content="Business presence on Facebook, Instagram, TikTok, LinkedIn, and other social platforms">
            <span className="font-medium">social media presence</span>
          </Tooltip>,{' '}
          <Tooltip content="Website functionality, mobile responsiveness, loading speed, and user experience">
            <span className="font-medium">website quality</span>
          </Tooltip>,{' '}
          <Tooltip content="Professional photos, videos, graphics, and branded content across platforms">
            <span className="font-medium">visual content</span>
          </Tooltip>,{' '}
          <Tooltip content="Search engine visibility, Google Business Profile, TripAdvisor presence, and online reviews">
            <span className="font-medium">discoverability</span>
          </Tooltip>,{' '}
          <Tooltip content="Online booking systems, digital payment acceptance, e-commerce capabilities">
            <span className="font-medium">digital sales</span>
          </Tooltip>, and{' '}
          <Tooltip content="Integration with booking platforms, CRM systems, and multi-channel management">
            <span className="font-medium">platform integration</span>
          </Tooltip>.
        </p>
        {data && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">Overall Averages</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Scored out of 10</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.categoryAverages).map(([category, score]) => {
              const categoryNames: Record<string, string> = {
                socialMedia: 'Social Media',
                website: 'Website',
                visualContent: 'Visual Content',
                discoverability: 'Discoverability',
                digitalSales: 'Digital Sales',
                platformIntegration: 'Platform Integration'
              };
              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{categoryNames[category]}</p>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{score}/10</p>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Technical Health Overview */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          <Tooltip content="Technical performance metrics from Google PageSpeed Insights, including speed, SEO, and accessibility">
            Technical Health
          </Tooltip>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Website performance and{' '}
          <Tooltip content="Search Engine Optimization - technical factors that affect how search engines find and rank websites">
            <span className="font-medium">technical SEO</span>
          </Tooltip>{' '}
          analysis for stakeholders with web presence. Includes{' '}
          <Tooltip content="Page load time, server response, and overall site speed measured by Google PageSpeed Insights">
            <span className="font-medium">speed metrics</span>
          </Tooltip>,{' '}
          <Tooltip content="How well websites adapt and display on mobile devices, tested with Google Mobile-Friendly Test">
            <span className="font-medium">mobile responsiveness</span>
          </Tooltip>,{' '}
          <Tooltip content="WCAG compliance scores measuring how accessible websites are to users with disabilities">
            <span className="font-medium">accessibility scores</span>
          </Tooltip>, and critical technical issues requiring attention.
        </p>
        <TechnicalHealthOverview />
      </div>

      {/* Next Steps */}
      {!isLoading && data && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Recommended Next Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900 mb-2">For Program Managers:</p>
              <ul className="space-y-1 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Review sector baselines to understand common patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Focus interventions on sectors with lower maturity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Address technical issues for stakeholders with websites</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">For Stakeholders:</p>
              <ul className="space-y-1 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Compare your scores against sector averages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Prioritize low-scoring categories for improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Review personalized recommendations in your profile</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Explore Further</h2>
        <p className="text-sm text-gray-600 mb-4">
          Access detailed participant profiles, sector comparisons, technical audits, and assessment methodology documentation.
        </p>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/participants" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
              <p className="font-semibold text-gray-900 mb-1">👥 All Participants</p>
              <p className="text-xs text-gray-600">Browse complete list of assessed stakeholders with scores and recommendations</p>
            </Link>
            <Link to="/sectors" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
              <p className="font-semibold text-gray-900 mb-1">📊 Sector Analysis</p>
              <p className="text-xs text-gray-600">Compare performance across sectors and view sector-specific baselines</p>
            </Link>
            <Link to="/technical-audit" className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
              <p className="font-semibold text-gray-900 mb-1">🔍 Technical Audit</p>
              <p className="text-xs text-gray-600">View website performance, SEO, and technical health scores for all stakeholders</p>
            </Link>
            <Link to="/methodology" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
              <p className="font-semibold text-gray-900 mb-1">📋 Methodology</p>
              <p className="text-xs text-gray-600">Understand how assessments are conducted and scores are calculated</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

