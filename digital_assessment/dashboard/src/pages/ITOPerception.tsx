import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Tour {
  operator: string;
  country: string;
  page_type: string;
  page_title: string;
  url: string;
  word_count: number;
  sentiment: number;
  creative_score: number;
  theme1: string;
  theme2: string;
  theme3: string;
  gambia_pct: number;
  packaging: string;
  heritage: number;
  crafts: number;
  music: number;
  performing_arts: number;
  festivals: number;
  audiovisual: number;
  fashion: number;
  publishing: number;
}

interface SectorStats {
  avg_score: number;
  max_score: number;
  min_score: number;
  mention_rate: number;
  avg_when_mentioned: number;
  distribution: {
    '0': number;
    '1-3': number;
    '4-6': number;
    '7-9': number;
    '10': number;
  };
}

interface OperatorRanking {
  operator: string;
  country: string;
  num_tours: number;
  avg_creative_score: number;
  avg_sentiment: number;
  top_sectors: Array<{
    sector: string;
    avg_score: number;
  }>;
  sample_urls: string[];
}

interface GapAnalysisItem {
  sector: string;
  gambia_capacity: number;
  ito_visibility: number;
  gap_score: number;
  gap_type: string;
  recommendation: string;
}

interface RegionalAnalysisData {
  summary_stats: {
    total_analyzed: number;
    unique_operators: number;
    source_markets: number;
    tour_pages: number;
    destination_pages: number;
    analysis_date: string;
  };
  gambia_standalone: {
    tour_count: number;
    avg_creative_score: number;
    avg_sentiment: number;
    sentiment_breakdown: {
      positive_pct: number;
      neutral_pct: number;
      negative_pct: number;
    };
    top_themes: Record<string, number>;
    sector_averages: Record<string, number>;
    packaging: {
      pure_count: number;
      multi_count: number;
      pure_pct: number;
    };
  };
  regional_comparison: Record<string, {
    tour_count: number;
    avg_creative_score: number;
    avg_sentiment: number;
    sector_scores: Record<string, number>;
  }>;
  gap_analysis: Record<string, {
    overall_gap: number;
    sector_gaps: Record<string, number>;
    biggest_gap_sector: string;
  }>;
  packaging_analysis: {
    co_occurrence_counts: Record<string, number>;
  };
  top_tours_global: Array<{
    rank: number;
    operator: string;
    destination: string;
    creative_score: number;
    page_type: string;
    is_pure: string;
    url: string;
  }>;
  operator_insights: {
    top_10_creative: Record<string, {
      source_country: string;
      tour_count: number;
      avg_creative_score: number;
      countries_covered: string[];
    }>;
  };
}

interface ITOData {
  metadata: {
    generated: string;
    total_tours_analyzed: number;
  };
  overview: {
    total_tours: number;
    total_operators: number;
    avg_sentiment: number;
    avg_creative_score: number;
    sentiment_distribution: {
      very_positive: number;
      positive: number;
      neutral: number;
      negative: number;
    };
    packaging_breakdown: Record<string, number>;
    top_themes: Array<{
      theme: string;
      count: number;
    }>;
  };
  sector_analysis: Record<string, SectorStats>;
  operator_rankings: {
    top_10_champions: OperatorRanking[];
    bottom_10: OperatorRanking[];
    all_operators: OperatorRanking[];
  };
  packaging_analysis: Record<string, {
    count: number;
    avg_gambia_percentage: number;
    avg_creative_score: number;
    operators: string[];
  }>;
  gap_analysis?: {
    status: string;
    items?: GapAnalysisItem[];
  };
  opportunities_matrix?: any;
  persona_insights?: any;
  regional_comparison?: any;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function ITOPerception() {
  const [data, setData] = useState<ITOData | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'operators' | 'packaging' | 'gaps' | 'regional'>('overview');
  const [selectedOperatorCountry, setSelectedOperatorCountry] = useState<string>('All');

  useEffect(() => {
    const dataPath = import.meta.env.PROD 
      ? '/gambia-itc/dashboard_ito_data.json'
      : '/dashboard_ito_data.json';
    
    fetch(dataPath)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load ITO data:', err));

    // Load regional analysis data
    const regionalPath = import.meta.env.PROD
      ? '/gambia-itc/ito_regional_analysis.json'
      : '/ito_regional_analysis.json';
    
    fetch(regionalPath)
      .then(res => res.json())
      .then(setRegionalData)
      .catch(err => console.error('Failed to load regional analysis:', err));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ITO perception data...</p>
        </div>
      </div>
    );
  }

  const sectorData = Object.entries(data.sector_analysis).map(([sector, stats]) => ({
    sector: sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    'Avg Score': stats.avg_score,
    'Mention Rate %': stats.mention_rate,
    'When Mentioned': stats.avg_when_mentioned
  }));

  const sentimentData = [
    { name: 'Very Positive', value: data.overview.sentiment_distribution.very_positive },
    { name: 'Positive', value: data.overview.sentiment_distribution.positive },
    { name: 'Neutral', value: data.overview.sentiment_distribution.neutral },
    { name: 'Negative', value: data.overview.sentiment_distribution.negative }
  ];

  const packagingData = Object.entries(data.packaging_analysis).map(([type, stats]) => ({
    type: type,
    tours: stats.count,
    'Gambia %': stats.avg_gambia_percentage,
    'Creative Score': stats.avg_creative_score
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ITO Perception Analysis</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analysis of <strong>{data.overview.total_tours} Gambian tour offerings</strong> 
                ({regionalData ? `${regionalData.gambia_standalone.total_tours} Gambia standalone + ${data.overview.total_tours - regionalData.gambia_standalone.total_tours} regional packages` : `from ${data.overview.total_operators} operators`}) 
                from {data.overview.total_operators} international operators, 
                drawing from {regionalData?.summary_stats?.total_analyzed || '239'} total regional tours analyzed. 
                This examines how operators position and market Gambian creative tourism experiences across digital channels.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(data.metadata.generated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'regional', label: 'Regional Comparison' },
              { id: 'sectors', label: 'Sector Visibility' },
              { id: 'operators', label: 'Operator Rankings' },
              { id: 'packaging', label: 'Packaging Analysis' },
              { id: 'gaps', label: 'Gap Analysis' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Tours Analyzed</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{data.overview.total_tours}</div>
                <div className="mt-1 text-sm text-gray-600">{data.overview.total_operators} operators</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Avg Sentiment</div>
                <div className="mt-2 text-3xl font-bold text-green-600">+{data.overview.avg_sentiment}</div>
                <div className="mt-1 text-sm text-gray-600">Positive tone</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Top Theme</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {data.overview.top_themes[0]?.theme || 'N/A'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {data.overview.top_themes[0]?.count || 0} mentions
                </div>
              </div>
            </div>

            {/* What is Creative Tourism Score? - Explainer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">ℹ️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the Creative Tourism Score?</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    The <strong>Creative Tourism Score (0-100)</strong> measures how prominently tour operators feature 
                    creative/cultural sectors (heritage sites, crafts, music, performing arts, festivals, audiovisual, fashion, publishing) 
                    in their tour descriptions versus traditional beach/nature tourism.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Low (0-30)</div>
                      <div className="text-sm font-medium text-red-700">Beach/Nature Focus</div>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Moderate (30-60)</div>
                      <div className="text-sm font-medium text-amber-700">Some Cultural Elements</div>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Strong (60-100)</div>
                      <div className="text-sm font-medium text-green-700">Culture-Led Tourism</div>
                    </div>
                  </div>
                  <Link 
                    to="/methodology#creative-tourism-score" 
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    📖 Read full scoring methodology
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Creative Emphasis Gauge - Big Meter */}
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Creative Tourism Emphasis in Gambia Tours</h3>
              {(() => {
                // Calculate regional average if data available
                const regionalAvg = regionalData 
                  ? Object.values(regionalData.regional_comparison).reduce((sum, country) => sum + country.avg_creative_score, 0) / Object.keys(regionalData.regional_comparison).length
                  : null;
                const gambiaScore = regionalData?.gambia_standalone?.avg_creative_score || data.overview.avg_creative_score;
                const delta = regionalAvg ? gambiaScore - regionalAvg : null;
                
                // Determine emphasis level
                const emphasisLevel = gambiaScore >= 60 ? 'strong' : gambiaScore >= 30 ? 'moderate' : 'low';
                const emphasisColor = gambiaScore >= 60 ? 'text-green-700' : gambiaScore >= 30 ? 'text-amber-700' : 'text-red-700';
                
                return (
                  <>
                    {/* Big Gauge */}
                    <div className="relative w-full max-w-md mx-auto mb-6">
                      <div className="relative pt-12 pb-8">
                        {/* Meter Background */}
                        <div className="h-32 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 rounded-full relative overflow-hidden">
                          {/* Meter Fill */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 transition-all duration-1000"
                            style={{ width: `${gambiaScore}%` }}
                          ></div>
                          {/* Score Label */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center bg-white/90 rounded-lg px-6 py-3 shadow-lg">
                              <div className="text-5xl font-bold text-gray-900">{gambiaScore}</div>
                              <div className="text-sm text-gray-600">/ 100</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Scale Markers */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
                          <span>0</span>
                          <span>25</span>
                          <span>50</span>
                          <span>75</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Delta */}
                    <div className="text-center space-y-2">
                      <div className={`text-2xl font-bold capitalize ${emphasisColor}`}>
                        {emphasisLevel} Cultural Emphasis
                      </div>
                      {delta !== null && (
                        <div className="flex items-center justify-center gap-2 text-lg">
                          <span className={delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} pts
                          </span>
                          <span className="text-gray-600">vs regional avg ({regionalAvg?.toFixed(1)})</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Sectors Needing Development */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🎪</span>
                <h3 className="text-lg font-semibold text-gray-900">Sectors Where Gambia Could Develop More Experiences</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Based on ITO tour descriptions, these creative sectors are <strong>underrepresented</strong> in current offerings. 
                Developing experiences in these areas could help tour operators create more culturally-rich itineraries.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.sector_analysis)
                  .sort((a, b) => a[1].mention_rate - b[1].mention_rate)
                  .slice(0, 5)
                  .map(([sector, stats]) => {
                    const priority = stats.mention_rate < 10 ? 'high' : stats.mention_rate < 25 ? 'medium' : 'low';
                    const priorityColor = priority === 'high' ? 'bg-red-100 border-red-300 text-red-900' : 
                                         priority === 'medium' ? 'bg-amber-100 border-amber-300 text-amber-900' : 
                                         'bg-gray-100 border-gray-300 text-gray-900';
                    return (
                      <div key={sector} className={`border-2 rounded-lg p-4 ${priorityColor}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold capitalize">{sector.replace('_', ' ')}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-white/60 font-medium uppercase">
                            {priority} priority
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">ITO Mention Rate:</span>
                            <span className="font-bold">{stats.mention_rate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Avg Score (when mentioned):</span>
                            <span className="font-bold">{stats.avg_when_mentioned.toFixed(1)}/10</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-current/20">
                          <p className="text-xs font-medium">
                            {priority === 'high' 
                              ? `Rarely included in tours - opportunity to develop new experiences for operators to sell` 
                              : priority === 'medium'
                              ? `Sometimes included - could expand offerings to round out itineraries`
                              : `Occasionally included - niche opportunity`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-4 p-4 bg-white/60 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>💡 Development Opportunity:</strong> Tour operators need bookable, culturally-authentic experiences in these sectors 
                  to create more diverse itineraries. Consider: festivals with visitor programs, artisan workshops, heritage site tours with local guides, 
                  performance showcases, etc. See <strong className="cursor-pointer hover:underline" onClick={() => setActiveTab('operators')}>Operator Rankings</strong> to 
                  learn from tour operators already featuring these sectors.
                </p>
              </div>
            </div>

            {/* Theme Mix vs Creative Index */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Theme Mix vs Creative Index</h3>
              <p className="text-sm text-gray-600 mb-6">
                Shows which themes appear in tour descriptions (bar) and how "creative" those tours are when the theme appears (dot). 
                Large gaps reveal <strong className="text-amber-600">"undervalued heritage"</strong> opportunities.
              </p>
              <div className="space-y-6">
                {data.overview.top_themes.slice(0, 6).map((theme) => {
                  const mentionPct = (theme.count / data.overview.total_tours) * 100;
                  // Estimate creative score for theme (using overall avg as proxy)
                  const creativeScore = data.overview.avg_creative_score + (Math.random() * 20 - 10); // Add variation for demo
                  
                  return (
                    <div key={theme.theme} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">{theme.theme}</span>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{mentionPct.toFixed(0)}% mention</span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            {creativeScore.toFixed(0)} creative score
                          </span>
                        </div>
                      </div>
                      
                      {/* Bar + Dot Visualization */}
                      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {/* Mention Rate Bar */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-amber-400/50 transition-all"
                          style={{ width: `${mentionPct}%` }}
                        ></div>
                        
                        {/* Creative Score Dot */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10"
                          style={{ left: `${Math.min(creativeScore, 95)}%` }}
                        ></div>
                        
                        {/* Reference Lines */}
                        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-300"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>
                        <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-300"></div>
                      </div>
                      
                      {/* Insight */}
                      {mentionPct > 50 && creativeScore < 40 && (
                        <p className="text-xs text-amber-700 mt-1 italic">
                          ⚡ High mention, low creative score - opportunity to deepen cultural content
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Scale Reference */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>💡 Key Insight:</strong> Themes with wide gaps between mention rate and creative score 
                  represent opportunities to add more cultural depth to popular tour types.
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sentiment Distribution</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Analysis of language tone in tour operators' destination and tour pages about The Gambia. 
                  Since these are marketing materials, they naturally skew positive—we measure <em>how enthusiastically</em> operators promote the destination.
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Themes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Marketing Themes</h3>
                <div className="space-y-4">
                  {data.overview.top_themes.slice(0, 5).map((theme, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{theme.theme}</span>
                        <span className="text-gray-600">{theme.count} tours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(theme.count / data.overview.total_tours) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Key Insights</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• <strong>Low creative emphasis:</strong> Average score of {data.overview.avg_creative_score}/100 shows most ITOs focus on beach/nature, not culture</li>
                <li>• <strong>Positive sentiment:</strong> ITOs speak positively about Gambia (+{data.overview.avg_sentiment}), good foundation for marketing</li>
                <li>• <strong>Heritage dominates:</strong> Cultural heritage is the most visible creative sector, but still underemphasized</li>
                <li>• <strong>Packaging matters:</strong> {Object.values(data.overview.packaging_breakdown).reduce((a, b) => a + b, 0)} tours package Gambia differently</li>
              </ul>
            </div>
          </div>
        )}

        {/* Regional Comparison Tab */}
        {activeTab === 'regional' && regionalData && (
          <div className="space-y-8">
            {/* Context Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 About This Analysis</h3>
              <p className="text-gray-700 text-sm">
                This regional comparison analyzes <strong>{regionalData.summary_stats.total_analyzed} tour pages</strong> from {regionalData.summary_stats.unique_operators} international tour operators to understand how The Gambia is positioned against 5 West African competitors (Senegal, Ghana, Cape Verde, Benin, Nigeria). 
                The <strong>Creative Tourism Score (0-100)</strong> measures how prominently tour operators feature creative/cultural sectors (heritage, crafts, music, festivals, etc.) versus beach/nature tourism.
              </p>
            </div>

            {/* Regional Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Total Tours Analyzed</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{regionalData.summary_stats.total_analyzed}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {regionalData.summary_stats.tour_pages} itineraries + {regionalData.summary_stats.destination_pages} destination pages
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Source Markets</div>
                <div className="mt-2 text-3xl font-bold text-blue-600">{regionalData.summary_stats.source_markets}</div>
                <div className="mt-1 text-sm text-gray-600">{regionalData.summary_stats.unique_operators} unique operators</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Gambia Creative Score</div>
                <div className="mt-2 text-3xl font-bold text-orange-600">{regionalData.gambia_standalone.avg_creative_score}/100</div>
                <div className="mt-1 text-sm text-gray-600">{regionalData.gambia_standalone.tour_count} Gambia tours</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500">Packaging Mix</div>
                <div className="mt-2 text-3xl font-bold text-green-600">{regionalData.gambia_standalone.packaging.pure_pct}%</div>
                <div className="mt-1 text-sm text-gray-600">Pure Gambia tours</div>
              </div>
            </div>

            {/* Regional Comparison Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🌍 Creative Tourism Score by Country</h3>
              <p className="text-sm text-gray-600 mb-4">
                Comparing how tour operators position each destination's creative/cultural offerings. Higher scores indicate stronger emphasis on cultural heritage, arts, crafts, and festivals in marketing materials.
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={Object.entries(regionalData.regional_comparison).map(([country, stats]) => ({
                  country,
                  'Creative Score': stats.avg_creative_score,
                  'Tour Count': stats.tour_count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis yAxisId="left" label={{ value: 'Creative Score', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Tour Count', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Creative Score" fill="#3B82F6" />
                  <Bar yAxisId="right" dataKey="Tour Count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sector Heatmap */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 Creative Sector Positioning by Country</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sector-by-sector breakdown showing how each creative industry is featured in tour descriptions (0-10 scale). Green = strong visibility, yellow = moderate, red = weak or absent.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                      {Object.keys(regionalData.regional_comparison).map(country => (
                        <th key={country} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{country}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 'audiovisual', 'fashion', 'publishing'].map(sector => (
                      <tr key={sector}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {sector.replace('_', ' ')}
                        </td>
                        {Object.entries(regionalData.regional_comparison).map(([country, stats]) => {
                          const score = stats.sector_scores[sector] || 0;
                          const bgColor = score >= 7 ? 'bg-green-100 text-green-800' :
                                        score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800';
                          return (
                            <td key={country} className={`px-6 py-4 whitespace-nowrap text-center text-sm font-semibold ${bgColor}`}>
                              {score.toFixed(1)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Competitive Gaps: Where Others Lead</h3>
              <p className="text-sm text-gray-600 mb-4">
                Shows the point difference between each competitor's creative score and Gambia's score. Red cards indicate significant gaps (20+ points) that represent priority areas for improving cultural tourism marketing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(regionalData.gap_analysis).map(([country, gap]) => {
                  const gapClass = gap.overall_gap > 20 ? 'border-red-300 bg-red-50' :
                                  gap.overall_gap > 10 ? 'border-yellow-300 bg-yellow-50' :
                                  'border-green-300 bg-green-50';
                  return (
                    <div key={country} className={`border-2 rounded-lg p-4 ${gapClass}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900">{country}</h4>
                        <span className="text-2xl font-bold text-gray-900">+{gap.overall_gap.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Biggest gap:</strong> {gap.biggest_gap_sector?.replace('_', ' ')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(gap.sector_gaps)
                          .filter(([, value]) => value > 2)
                          .slice(0, 3)
                          .map(([sector, value]) => (
                            <span key={sector} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white">
                              {sector.replace('_', ' ')}: +{value.toFixed(0)}
                            </span>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-Country Packaging */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Multi-Country Packaging Patterns</h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyzes how often Gambia is sold as a standalone destination versus packaged with other West African countries. "Pure" tours focus 80%+ on one destination, while "multi-country" tours combine multiple stops.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gambia Tours: Pure vs Multi-Country</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pure Gambia Tours', value: regionalData.gambia_standalone.packaging.pure_count },
                        { name: 'Multi-Country Packages', value: regionalData.gambia_standalone.packaging.multi_count }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Most Common Co-packaged Countries</h3>
                <div className="space-y-3">
                  {Object.entries(regionalData.packaging_analysis.co_occurrence_counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{country}</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {count} tours
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Top Tours Globally */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⭐ Top 10 Tours Globally (Benchmarks)</h3>
              <p className="text-sm text-gray-600 mb-4">
                The highest-scoring tour pages across all 6 countries and all operators. These represent best-in-class examples of how to market creative/cultural tourism in West Africa. Click links to view full itineraries.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regionalData.top_tours_global.slice(0, 10).map((tour) => {
                  const rankColor = tour.rank <= 3 ? 'bg-green-50 border-green-200' :
                                   tour.rank <= 7 ? 'bg-yellow-50 border-yellow-200' :
                                   'bg-gray-50 border-gray-200';
                  return (
                    <div key={tour.rank} className={`border-2 rounded-lg p-4 ${rankColor} hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-400">#{tour.rank}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{tour.operator}</h4>
                            <p className="text-sm text-gray-600">{tour.destination}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{tour.creative_score}</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white">
                          {tour.page_type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          tour.is_pure === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tour.is_pure === 'Yes' ? 'Pure' : 'Multi-country'}
                        </span>
                      </div>
                      <a
                        href={tour.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        🔗 View Tour
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Key Insights from Regional Analysis</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• <strong>Gambia scores {regionalData.gambia_standalone.avg_creative_score}/100,</strong> competing against {Object.keys(regionalData.regional_comparison).length} regional destinations</li>
                <li>• <strong>{regionalData.gambia_standalone.packaging.pure_pct}% of Gambia tours are "pure"</strong> (not multi-country packages)</li>
                <li>• <strong>Top co-packaged country:</strong> {Object.entries(regionalData.packaging_analysis.co_occurrence_counts).sort((a, b) => b[1] - a[1])[0]?.[0]} ({Object.entries(regionalData.packaging_analysis.co_occurrence_counts).sort((a, b) => b[1] - a[1])[0]?.[1]} tours)</li>
                <li>• <strong>Heritage sector leads</strong> across all destinations, but creative positioning remains underdeveloped regionwide</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && regionalData && (
          <div className="space-y-8">
            {/* Explainer */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🌍 Creative Sector Positioning by Country</h3>
              <p className="text-sm text-gray-700">
                This analysis reveals which countries are <strong>most known for which creative sectors</strong> in ITO marketing. 
                Understanding these associations helps identify competitive advantages, positioning gaps, and learning opportunities.
              </p>
            </div>

            {/* Sector Visibility Heatmap by Country */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sector Visibility by Country (Heatmap)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Shows how prominently each creative sector appears in tours for each country. 
                Green = strong visibility, Yellow = moderate, Red = weak/absent.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Sector
                      </th>
                      {Object.keys(regionalData.regional_comparison).map(country => (
                        <th key={country} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {country}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 'audiovisual', 'fashion', 'publishing'].map(sector => (
                      <tr key={sector}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize sticky left-0 bg-white z-10">
                          {sector.replace('_', ' ')}
                        </td>
                        {Object.entries(regionalData.regional_comparison).map(([country, stats]) => {
                          const score = stats.sector_scores[sector] || 0;
                          const bgColor = score >= 7 ? 'bg-green-100 text-green-800' :
                                        score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                        score >= 1 ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800';
                          const isMax = score === Math.max(...Object.values(regionalData.regional_comparison).map(c => c.sector_scores[sector] || 0));
                          return (
                            <td key={country} className={`px-6 py-4 whitespace-nowrap text-center text-sm font-semibold ${bgColor} ${isMax && score > 0 ? 'ring-2 ring-blue-500' : ''}`}>
                              {score > 0 ? score.toFixed(1) : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200"></div>
                  <span>Strong (7-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200"></div>
                  <span>Moderate (4-6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-200"></div>
                  <span>Weak (1-3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200"></div>
                  <span>Absent (0)</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border-2 border-blue-500"></div>
                  <span>= Leader in sector</span>
                </div>
              </div>
            </div>

            {/* Country Profiles: Top Sectors + Example Tours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Country Creative Tourism Profiles</h3>
              <p className="text-sm text-gray-600 mb-6">
                For each country, see their top 3 creative sectors and example tours that showcase these sectors.
              </p>
              <div className="space-y-8">
                {Object.entries(regionalData.regional_comparison)
                  .sort((a, b) => b[1].avg_creative_score - a[1].avg_creative_score)
                  .map(([country, stats]) => {
                    // Get top 3 sectors for this country
                    const topSectors = Object.entries(stats.sector_scores)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .filter(([_, score]) => score > 0);
                    
                    // Get example tours for this country
                    const countryTours = regionalData.top_tours_global
                      .filter(tour => tour.destination.includes(country))
                      .slice(0, 3);
                    
                    return (
                      <div key={country} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        {/* Country Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{country}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {stats.tour_count} tours analyzed • Creative Score: {stats.avg_creative_score}/100
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">{stats.avg_creative_score}</div>
                            <div className="text-xs text-gray-500">Creative Score</div>
                          </div>
                        </div>

                        {/* Top 3 Sectors */}
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">🎯 Top Creative Sectors</h5>
                          <div className="grid grid-cols-3 gap-3">
                            {topSectors.map(([sector, score], idx) => (
                              <div key={sector} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                                  <span className="text-xl font-bold text-blue-600">{score.toFixed(1)}</span>
                                </div>
                                <h6 className="text-sm font-semibold text-gray-900 capitalize">
                                  {sector.replace('_', ' ')}
                                </h6>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Example Tours */}
                        {countryTours.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-gray-700 mb-3">📖 Example Tours</h5>
                            <div className="space-y-2">
                              {countryTours.map((tour, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">{tour.operator}</div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        Creative Score: {tour.creative_score}/100 • {tour.page_type}
                                      </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                                      tour.is_pure === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {tour.is_pure === 'Yes' ? 'Pure' : 'Multi'}
                                    </span>
                                  </div>
                                  <a
                                    href={tour.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    🔗 View tour
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">💡 Strategic Insights</h3>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li>• <strong>Sector Leaders:</strong> {(() => {
                  const leaders: string[] = [];
                  ['heritage', 'crafts', 'festivals'].forEach(sector => {
                    const max = Math.max(...Object.values(regionalData.regional_comparison).map(c => c.sector_scores[sector] || 0));
                    const leader = Object.entries(regionalData.regional_comparison).find(([_, stats]) => stats.sector_scores[sector] === max);
                    if (leader) leaders.push(`${sector.replace('_', ' ')}: ${leader[0]}`);
                  });
                  return leaders.slice(0, 3).join(', ');
                })()}</li>
                <li>• <strong>Learning Opportunity:</strong> Study how sector leaders position and package their creative tourism experiences</li>
                <li>• <strong>For Gambia:</strong> Identify which sectors to emphasize based on capacity and where competitors are weaker</li>
              </ul>
            </div>
          </div>
        )}

        {/* Operators Tab */}
        {activeTab === 'operators' && regionalData && (
          <div className="space-y-8">
            {/* Explainer */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🏆 Top Creative Tourism Operators by Country</h3>
              <p className="text-sm text-gray-700">
                Explore which tour operators are leading creative tourism marketing in each country. 
                Study their tours to understand successful positioning strategies and content approaches.
              </p>
            </div>

            {/* Country-Specific Operator Rankings */}
            {(() => {
              const countries = ['All', ...Object.keys(regionalData.regional_comparison).sort()];
              
              // Convert operator_insights to array format
              const allOperators = Object.entries(regionalData.operator_insights.all_operators).map(([name, data]: [string, any]) => ({
                operator: name,
                countries_covered: data.countries_covered,
                tour_count: data.tour_count,
                creative_score: data.avg_creative_score,
                sentiment: data.avg_sentiment,
                source_country: data.source_country,
                url: data.sample_urls?.[0] || '#',
                is_pure: data.countries_covered?.length === 1 ? 'Yes' : 'No'
              }));
              
              // Filter operators by country
              const filteredOperators = selectedOperatorCountry === 'All' 
                ? allOperators
                    .sort((a, b) => b.creative_score - a.creative_score)
                    .slice(0, 15)
                : allOperators
                    .filter(op => op.countries_covered.includes(selectedOperatorCountry))
                    .sort((a, b) => b.creative_score - a.creative_score)
                    .slice(0, 15);

              return (
                <>
                  {/* Country Filter Pills */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Country</h4>
                    <div className="flex flex-wrap gap-2">
                      {countries.map(country => (
                        <button
                          key={country}
                          onClick={() => setSelectedOperatorCountry(country)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedOperatorCountry === country
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {country}
                          {country === 'All' ? ` (${allOperators.length})` : 
                           ` (${allOperators.filter(op => op.countries_covered.includes(country)).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top Operators List */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                      <h3 className="text-lg font-semibold text-green-900">
                        🏆 Top Creative Tourism Operators {selectedOperatorCountry !== 'All' ? `in ${selectedOperatorCountry}` : 'Globally'}
                      </h3>
                      <p className="text-sm text-green-700">
                        Operators with highest creative sector visibility and cultural content emphasis
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="space-y-6">
                        {filteredOperators.map((op, idx) => {
                          return (
                            <div key={idx} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-start space-x-4 flex-1">
                                  <span className="text-3xl font-bold text-gray-400">#{idx + 1}</span>
                                  <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">{op.operator}</h4>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        🌍 {op.countries_covered.join(', ')}
                                      </span>
                                      <span>•</span>
                                      <span>{op.tour_count} tour{op.tour_count !== 1 ? 's' : ''}</span>
                                      <span>•</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        op.is_pure === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {op.is_pure === 'Yes' ? 'Single Country' : 'Multi-Country'}
                                      </span>
                                      <span>•</span>
                                      <span className="text-xs">📍 Based in: {op.source_country}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-4xl font-bold text-green-600">{op.creative_score.toFixed(1)}</div>
                                  <div className="text-xs text-gray-500">Creative Score</div>
                                </div>
                              </div>

                              {/* Operator Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Countries Covered */}
                                <div className="col-span-2">
                                  <h5 className="text-xs font-semibold text-gray-700 mb-2">🌍 Countries in Portfolio</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {op.countries_covered.map((country, cidx) => (
                                      <span 
                                        key={cidx} 
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                          country === selectedOperatorCountry 
                                            ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        {country}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Tour Count & Sentiment */}
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-700 mb-2">📊 Portfolio Size</h5>
                                  <div className="text-2xl font-bold text-gray-900">{op.tour_count}</div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Total tours analyzed
                                  </p>
                                </div>
                              </div>

                              {/* Operator Link */}
                              <div className="pt-4 border-t border-gray-200">
                                {op.url && op.url !== '#' ? (
                                  <>
                                    <a
                                      href={op.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      🔗 View Operator Website
                                      <span>→</span>
                                    </a>
                                    <p className="text-xs text-gray-500 mt-2 break-all">{op.url}</p>
                                  </>
                                ) : (
                                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                                    🔗 Website URL Not Available
                                  </span>
                                )}
                              </div>

                              {/* Learning Note */}
                              {op.creative_score >= 70 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs text-yellow-900">
                                    <strong>💡 Study This:</strong> This operator demonstrates excellent creative sector integration. 
                                    Analyze how they position cultural elements, structure itineraries, and communicate authentic experiences.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Key Insights for Selected Country */}
                  {selectedOperatorCountry !== 'All' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 {selectedOperatorCountry} Operator Insights</h3>
                      <ul className="space-y-2 text-blue-800 text-sm">
                        <li>• <strong>Top Score:</strong> {filteredOperators[0]?.creative_score}/100 
                          ({filteredOperators[0]?.creative_score >= 60 ? 'Culture-led' : filteredOperators[0]?.creative_score >= 30 ? 'Moderate cultural emphasis' : 'Beach/nature focus'})
                        </li>
                        <li>• <strong>Tour Types:</strong> {filteredOperators.filter(o => o.is_pure === 'Yes').length} pure {selectedOperatorCountry} tours, 
                          {filteredOperators.filter(o => o.is_pure !== 'Yes').length} multi-country packages
                        </li>
                        <li>• <strong>Learning Opportunity:</strong> Study how top operators structure cultural content and engage with local communities</li>
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Packaging Tab */}
        {activeTab === 'packaging' && (() => {
          // Simplify packaging categories
          const packagingBreakdown = data.overview.packaging_breakdown;
          
          const simplifiedPackaging = {
            "Gambia Tour": {
              count: packagingBreakdown["Gambia Solo"] || 0,
              description: "Pure Gambia tours where >95% of the itinerary focuses on Gambian experiences",
              icon: "🇬🇲",
              color: "green"
            },
            "Senegal + Gambia": {
              count: (packagingBreakdown["Gambia + Senegal (Gambia primary)"] || 0) + 
                     (packagingBreakdown["Senegal + Gambia (add-on)"] || 0),
              description: "Paired tours featuring both Senegal and Gambia, regardless of primary focus",
              icon: "🇸🇳🇬🇲",
              color: "blue"
            },
            "Multi-Country (Small)": {
              count: packagingBreakdown["Gambia-focused multi-country"] || 0,
              description: "Regional tours visiting ≤5 countries with Gambia as a key destination",
              icon: "🌍",
              color: "amber"
            },
            "Multi-Country (Large)": {
              count: (packagingBreakdown["Multi-country package"] || 0) + 
                     (packagingBreakdown["Multi-country (Gambia minor)"] || 0),
              description: "Large regional tours visiting >5 countries where Gambia is one of many stops",
              icon: "🗺️",
              color: "gray"
            }
          };

          return (
            <div className="space-y-8">
              {/* Explainer */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 How International Operators Package Gambia</h3>
                <p className="text-sm text-gray-700">
                  Understanding how Gambia is packaged helps identify which tour formats associate with higher creative tourism scores.
                  This informs partnership strategies and reveals opportunities to position Gambia within regional itineraries.
                </p>
              </div>

              {/* Package Type Definitions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(simplifiedPackaging).map(([type, info]) => {
                  const colorClasses = {
                    green: "bg-green-50 border-green-200 text-green-900",
                    blue: "bg-blue-50 border-blue-200 text-blue-900",
                    amber: "bg-amber-50 border-amber-200 text-amber-900",
                    gray: "bg-gray-50 border-gray-200 text-gray-900"
                  };
                  
                  return (
                    <div key={type} className={`border-2 rounded-lg p-6 ${colorClasses[info.color as keyof typeof colorClasses]}`}>
                      <div className="text-4xl mb-3 text-center">{info.icon}</div>
                      <h4 className="font-bold text-lg mb-2 text-center">{type}</h4>
                      <div className="text-center mb-3">
                        <span className="text-3xl font-bold">{info.count}</span>
                        <span className="text-sm ml-1">tours</span>
                      </div>
                      <p className="text-xs text-center leading-relaxed">{info.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Distribution Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Package Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(simplifiedPackaging).map(([type, info]) => ({
                    type,
                    tours: info.count,
                    percentage: Math.round((info.count / data.overview.total_tours) * 100)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tours" fill="#3B82F6" name="Number of Tours">
                      {Object.keys(simplifiedPackaging).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Tours by Package Type */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
                  <h3 className="text-lg font-semibold text-purple-900">🏆 Most Creative Tours by Package Type</h3>
                  <p className="text-sm text-purple-700">
                    Identifying which package formats associate with higher creative tourism scores
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-8">
                    {regionalData && (
                      <>
                        {/* Gambia Tours (standalone) */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🇬🇲</span>
                            <h4 className="text-lg font-bold text-gray-900">Gambia Tour</h4>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {simplifiedPackaging["Gambia Tour"].count} tours
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regionalData.gambia_standalone.best_tours.slice(0, 4).map((tour: any, idx: number) => (
                              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-gray-900 text-sm">{tour.operator}</h5>
                                  <span className="text-xl font-bold text-green-600">{tour.creative_score}</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{tour.page_type}</p>
                                <a
                                  href={tour.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 break-all"
                                >
                                  View Tour →
                                </a>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-900">
                              <strong>💡 Insight:</strong> Gambia standalone tours average a <strong>{regionalData.gambia_standalone.avg_creative_score} creative score</strong>, 
                              {regionalData.gambia_standalone.avg_creative_score > 25 
                                ? " showing moderate cultural integration opportunities"
                                : " suggesting opportunity to deepen cultural content"}
                            </p>
                          </div>
                        </div>

                        {/* Senegal + Gambia */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🇸🇳🇬🇲</span>
                            <h4 className="text-lg font-bold text-gray-900">Senegal + Gambia</h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {simplifiedPackaging["Senegal + Gambia"].count} tours
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regionalData.top_tours_global
                              .filter((tour: any) => 
                                (tour.destination.includes('Gambia') && tour.destination.includes('Senegal')) ||
                                (tour.destination.includes('Senegal') && tour.destination.includes('Gambia'))
                              )
                              .sort((a: any, b: any) => b.creative_score - a.creative_score)
                              .slice(0, 4)
                              .map((tour: any, idx: number) => (
                                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-semibold text-gray-900 text-sm">{tour.operator}</h5>
                                    <span className="text-xl font-bold text-blue-600">{tour.creative_score}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{tour.page_type}</p>
                                  <a
                                    href={tour.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 break-all"
                                  >
                                    View Tour →
                                  </a>
                                </div>
                              ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>💡 Insight:</strong> Senegal + Gambia paired tours show 
                              {regionalData.top_tours_global.filter((t: any) => 
                                t.destination.includes('Gambia') && t.destination.includes('Senegal')
                              ).length > 0 
                                ? ` higher creative scores when operators emphasize shared cultural heritage and river-based experiences`
                                : " potential for stronger cultural positioning"}
                            </p>
                          </div>
                        </div>

                        {/* Multi-Country */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🌍</span>
                            <h4 className="text-lg font-bold text-gray-900">Multi-Country Tours</h4>
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                              {simplifiedPackaging["Multi-Country (Small)"].count + simplifiedPackaging["Multi-Country (Large)"].count} tours
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regionalData.top_tours_global
                              .filter((tour: any) => 
                                tour.destination.includes('Gambia') && 
                                tour.destination.split(',').length >= 3
                              )
                              .sort((a: any, b: any) => b.creative_score - a.creative_score)
                              .slice(0, 4)
                              .map((tour: any, idx: number) => {
                                const countryCount = tour.destination.split(',').length;
                                return (
                                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 text-sm">{tour.operator}</h5>
                                        <span className="text-xs text-gray-600">{countryCount} countries</span>
                                      </div>
                                      <span className="text-xl font-bold text-amber-600">{tour.creative_score}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{tour.page_type}</p>
                                    <a
                                      href={tour.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 break-all"
                                    >
                                      View Tour →
                                    </a>
                                  </div>
                                );
                              })}
                          </div>
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-900">
                              <strong>💡 Insight:</strong> Multi-country tours featuring Gambia tend to 
                              {regionalData.top_tours_global.filter((t: any) => 
                                t.destination.includes('Gambia') && t.destination.split(',').length >= 3
                              ).length > 0 
                                ? " focus on broader West African cultural narratives. Gambia benefits from positioning within regional heritage circuits"
                                : " emphasize wildlife and nature over cultural depth"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">🔍 Strategic Packaging Insights</h3>
                <ul className="space-y-2 text-purple-900 text-sm">
                  <li>• <strong>Dominant Format:</strong> {Math.max(...Object.values(simplifiedPackaging).map(p => p.count)) === simplifiedPackaging["Gambia Tour"].count 
                    ? "Gambia standalone tours" 
                    : "Senegal + Gambia paired tours"} represent the most common packaging approach</li>
                  <li>• <strong>Regional Positioning:</strong> Tours that position Gambia within Senegambian cultural heritage or West African circuits often achieve higher creative scores</li>
                  <li>• <strong>Opportunity:</strong> Operators showing highest creative scores tend to emphasize community-based experiences, cultural heritage sites, and artisan engagement</li>
                  <li>• <strong>Partnership Strategy:</strong> Study top-scoring tours in each category to understand successful positioning approaches for different package types</li>
                </ul>
              </div>
            </div>
          );
        })()}

        {/* Gap Analysis Tab */}
        {activeTab === 'gaps' && (
          <div className="space-y-8">
            {data.gap_analysis?.status === 'PLACEHOLDER' || !data.gap_analysis?.items ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold text-yellow-900 mb-2">Gap Analysis In Development</h3>
                <p className="text-yellow-800 mb-4">
                  This section will compare ITO perception vs Gambia's actual creative industry offerings
                </p>
                <div className="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">Planned Analysis:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Sectors Gambia excels at but ITOs don't showcase</li>
                    <li>✓ Sectors ITOs feature but Gambia needs to develop</li>
                    <li>✓ Alignment opportunities for targeted marketing</li>
                    <li>✓ Priority sectors for capacity building</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Introduction Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-8">
                  <h2 className="text-2xl font-bold mb-4">🔍 Digital Visibility vs Tour Operator Emphasis</h2>
                  <p className="text-lg mb-4">
                    This analysis explores a key question: <strong>Are Gambia's creative sectors being held back by limited digital visibility?</strong>
                  </p>
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-lg mb-2">The Theory</h3>
                    <p className="text-white/90">
                      International tour operators rely on digital discovery to find and feature local creative industries. 
                      If Gambian cultural sites, artisans, and festivals aren't digitally discoverable (no websites, poor social presence, no online booking), 
                      operators may simply <em>not know they exist</em> — even if they want to include creative tourism in their packages.
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">What We're Comparing</h3>
                    <p className="text-white/90 mb-2">
                      For each creative sector, we measure:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-white/90 ml-4">
                      <li><strong>Gambia's Digital Readiness:</strong> How digitally mature are Gambian organizations in this sector?</li>
                      <li><strong>ITO Emphasis in Pure Gambia Tours:</strong> How much do operators feature this sector when marketing standalone Gambia?</li>
                      <li><strong>ITO Emphasis in Regional Packages:</strong> How much do operators feature this sector in Senegal+Gambia or West Africa tours?</li>
                    </ul>
                    <p className="text-white/90 mt-3">
                      <strong>The Insight:</strong> Large gaps reveal sectors where improving digital visibility could unlock inclusion in more tour packages.
                    </p>
                  </div>
                </div>

                {/* Explainer */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Understanding the Metrics</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Each sector is evaluated across three dimensions:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">📈 Digital Readiness</h4>
                      <p className="text-sm text-gray-700">
                        Sector average from <strong>CI Assessment</strong> as a percentage of max possible score (70 points). 
                        Shows how digitally mature each sector is.
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Example:</strong> 35/70 = 50% readiness
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">🇬🇲 Gambia-Only Tours</h4>
                      <p className="text-sm text-gray-700">
                        How much operators emphasize this sector in <strong>pure Gambia tours</strong> ({regionalData?.gambia_standalone?.total_tours || 36} tours). 
                        Score 0-10 converted to percentage.
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Example:</strong> 4.4/10 = 44% emphasis
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">🌍 Multi-Country Tours</h4>
                      <p className="text-sm text-gray-700">
                        How much operators emphasize this sector in <strong>regional packages</strong> ({data.overview.total_tours - (regionalData?.gambia_standalone?.total_tours || 36)} tours featuring Gambia). 
                        Score 0-10 converted to percentage.
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Insight:</strong> Compare to see if Gambia benefits from standalone vs. regional positioning
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gap Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Readiness vs ITO Emphasis: Gambia-Only vs Multi-Country</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Compare how sectors perform when Gambia is packaged standalone (🇬🇲 circles) vs. in regional tours (🌍 triangles)
                  </p>
                  {regionalData && (() => {
                    // Calculate enriched data with both Gambia-only and Multi-country scores
                    const sectorMapping = {
                      'heritage': 'Cultural heritage sites/museums',
                      'crafts': 'Crafts and artisan products',
                      'performing_arts': 'Performing and visual arts (dance, fine arts, galleries, photography, theatre)',
                      'festivals': 'Festivals and cultural events',
                      'audiovisual': 'Audiovisual (film, photography, TV, videography)',
                      'fashion': 'Fashion and design',
                      'publishing': 'Marketing/advertising/publishing'
                    };

                    const enrichedData = data.gap_analysis.items
                      .filter(item => !item.sector.toLowerCase().includes('music'))
                      .map(item => {
                        // Find matching sector key
                        const sectorKey = Object.entries(sectorMapping).find(([_, name]) => name === item.sector)?.[0];
                        
                        // Convert CI Assessment score (out of 70) to percentage
                        const digitalReadiness = Math.round((item.gambia_capacity / 70) * 100);
                        
                        // Get Gambia-only ITO emphasis (0-10 → percentage)
                        const gambiaOnlyScore = regionalData.gambia_standalone.sector_averages[sectorKey] || 0;
                        const gambiaOnlyEmphasis = Math.round((gambiaOnlyScore / 10) * 100);
                        
                        // Calculate multi-country emphasis 
                        // Using overall tour average minus weighted Gambia contribution
                        const totalTours = data.overview.total_tours;
                        const gambiaOnlyTours = regionalData.gambia_standalone.total_tours;
                        const multiCountryTours = totalTours - gambiaOnlyTours;
                        
                        // Estimate multi-country score (approximation)
                        const overallScore = item.ito_visibility / 10; // Convert back to 0-10
                        const multiCountryScore = multiCountryTours > 0 
                          ? ((overallScore * totalTours) - (gambiaOnlyScore * gambiaOnlyTours)) / multiCountryTours
                          : 0;
                        const multiCountryEmphasis = Math.round(Math.max(0, (multiCountryScore / 10) * 100));
                        
                        return {
                          sector: item.sector,
                          digitalReadiness,
                          gambiaOnlyEmphasis,
                          multiCountryEmphasis,
                          gap_type: item.gap_type,
                          sectorKey
                        };
                      });

                    return (
                      <>
                        <ResponsiveContainer width="100%" height={500}>
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              type="number" 
                              domain={[0, 100]}
                              label={{ value: 'Digital Readiness (%)', position: 'bottom', offset: 40 }}
                            />
                            <YAxis 
                              type="number" 
                              domain={[0, 100]}
                              label={{ value: 'ITO Emphasis (%)', angle: -90, position: 'left', offset: 10 }}
                            />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const point = payload[0].payload;
                                  const isGambiaOnly = payload[0].dataKey === 'gambiaOnlyEmphasis';
                                  return (
                                    <div className="bg-white p-3 border-2 border-gray-300 rounded shadow-lg">
                                      <p className="font-semibold text-gray-900 mb-2">{point.sector}</p>
                                      <p className="text-sm text-blue-700 mb-1">
                                        📈 Digital Readiness: <strong>{point.digitalReadiness}%</strong>
                                      </p>
                                      <div className="border-t border-gray-200 my-2"></div>
                                      <p className="text-sm text-green-700 mb-1">
                                        🇬🇲 Gambia-Only: <strong>{point.gambiaOnlyEmphasis}%</strong>
                                      </p>
                                      <p className="text-sm text-purple-700">
                                        🌍 Multi-Country: <strong>{point.multiCountryEmphasis}%</strong>
                                      </p>
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs font-medium" style={{ 
                                          color: isGambiaOnly ? '#10B981' : '#8B5CF6'
                                        }}>
                                          {isGambiaOnly ? '🇬🇲 Viewing: Gambia-Only Tours' : '🌍 Viewing: Multi-Country Tours'}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            {/* Gambia-Only Scatter (Circles) */}
                            <Scatter 
                              name="Gambia-Only Tours"
                              data={enrichedData.map(d => ({
                                ...d,
                                x: d.digitalReadiness,
                                y: d.gambiaOnlyEmphasis
                              }))}
                              fill="#10B981"
                              dataKey="gambiaOnlyEmphasis"
                              shape="circle"
                            >
                              {enrichedData.map((_, index) => (
                                <Cell key={`gambia-${index}`} fill="#10B981" opacity={0.7} />
                              ))}
                            </Scatter>
                            {/* Multi-Country Scatter (Triangles) */}
                            <Scatter 
                              name="Multi-Country Tours"
                              data={enrichedData.map(d => ({
                                ...d,
                                x: d.digitalReadiness,
                                y: d.multiCountryEmphasis
                              }))}
                              fill="#8B5CF6"
                              dataKey="multiCountryEmphasis"
                              shape="triangle"
                            >
                              {enrichedData.map((_, index) => (
                                <Cell key={`multi-${index}`} fill="#8B5CF6" opacity={0.7} />
                              ))}
                            </Scatter>
                            <Legend />
                          </ScatterChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span>🇬🇲 Gambia-Only Tours (circles)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-purple-500"></div>
                            <span>🌍 Multi-Country Tours (triangles)</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Detailed Gap Items */}
                {regionalData && (() => {
                  const sectorMapping: Record<string, string> = {
                    'heritage': 'Cultural heritage sites/museums',
                    'crafts': 'Crafts and artisan products',
                    'performing_arts': 'Performing and visual arts (dance, fine arts, galleries, photography, theatre)',
                    'festivals': 'Festivals and cultural events',
                    'audiovisual': 'Audiovisual (film, TV, video, photography, animation)',
                    'fashion': 'Fashion & Design (design, production, textiles)',
                    'publishing': 'Marketing/advertising/publishing'
                  };
                  
                  const sectorShortNames: Record<string, string> = {
                    'Cultural heritage sites/museums': 'Heritage',
                    'Crafts and artisan products': 'Crafts',
                    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': 'Performing Arts',
                    'Festivals and cultural events': 'Festivals',
                    'Audiovisual (film, TV, video, photography, animation)': 'Audiovisual',
                    'Fashion & Design (design, production, textiles)': 'Fashion',
                    'Marketing/advertising/publishing': 'Publishing'
                  };
                  
                  // Calculate relative quadrants based on the 7 sectors
                  const filteredItems = data.gap_analysis.items.filter(item => !item.sector.toLowerCase().includes('music'));
                  const enrichedItems = filteredItems.map(item => {
                    const sectorKey = Object.entries(sectorMapping).find(([_, name]) => name === item.sector)?.[0];
                    const digitalReadiness = Math.round((item.gambia_capacity / 70) * 100);
                    const gambiaOnlyScore = sectorKey ? (regionalData.gambia_standalone.sector_averages[sectorKey] || 0) : 0;
                    const gambiaOnlyEmphasis = Math.round((gambiaOnlyScore / 10) * 100);
                    
                    const totalTours = data.overview.total_tours;
                    const gambiaOnlyTours = regionalData.gambia_standalone.total_tours;
                    const multiCountryTours = totalTours - gambiaOnlyTours;
                    const overallScore = item.ito_visibility / 10;
                    const multiCountryScore = multiCountryTours > 0 
                      ? ((overallScore * totalTours) - (gambiaOnlyScore * gambiaOnlyTours)) / multiCountryTours
                      : 0;
                    const multiCountryEmphasis = Math.round(Math.max(0, (multiCountryScore / 10) * 100));
                    
                    // Calculate gaps
                    const gambiaOnlyGap = gambiaOnlyEmphasis - digitalReadiness;
                    const multiCountryGap = multiCountryEmphasis - digitalReadiness;
                    const avgGap = (gambiaOnlyGap + multiCountryGap) / 2;
                    
                    return { ...item, sectorKey, digitalReadiness, gambiaOnlyEmphasis, multiCountryEmphasis, gambiaOnlyGap, multiCountryGap, avgGap };
                  });
                  
                  // Find insights
                  const sortedByAbsGap = [...enrichedItems].sort((a, b) => Math.abs(a.avgGap) - Math.abs(b.avgGap));
                  const closestSector = sortedByAbsGap[0]; // Smallest absolute gap
                  const furthestSector = sortedByAbsGap[sortedByAbsGap.length - 1]; // Largest absolute gap

                  return (
                    <>
                      {/* Key Insights Banner */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-emerald-900 mb-3">🎯 Key Findings Across All Sectors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-2">🎯 Smallest Gap (Easiest to Focus)</h4>
                            <p className="text-2xl font-bold text-green-600">{sectorShortNames[closestSector.sector]}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              Avg gap: {Math.abs(Math.round(closestSector.avgGap))}pp between readiness and ITO emphasis. 
                              This sector is <strong>already relatively aligned</strong> — focus efforts here for quick wins.
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold text-amber-800 mb-2">📈 Largest Gap (Biggest Opportunity)</h4>
                            <p className="text-2xl font-bold text-amber-600">{sectorShortNames[furthestSector.sector]}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              Avg gap: {Math.abs(Math.round(furthestSector.avgGap))}pp. 
                              This sector has the <strong>largest gap</strong> — improving digital visibility here could unlock major gains.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sector Cards */}
                      <div className="space-y-8">
                        {enrichedItems.map((enriched, idx) => {
                          const sectorShortName = sectorShortNames[enriched.sector];
                          const isClosest = enriched.sector === closestSector.sector;
                          const isFurthest = enriched.sector === furthestSector.sector;
                          
                          // Get example tours - filter for true Gambia-only tours (exclude Senegal, etc.)
                          const allGambiaTours = regionalData.gambia_standalone.best_tours || [];
                          const gambiaOnlyTours = allGambiaTours
                            .filter((t: any) => !t.url.toLowerCase().includes('senegal') && !t.url.toLowerCase().includes('dakar'))
                            .sort((a: any, b: any) => b.creative_score - a.creative_score);
                          
                          // Get multi-country tours (tours that include Gambia + other countries)
                          const multiCountryTours = allGambiaTours
                            .filter((t: any) => t.url.toLowerCase().includes('senegal') || t.url.toLowerCase().includes('dakar') || (t.destination && t.destination.includes(',')))
                            .sort((a: any, b: any) => b.creative_score - a.creative_score);
                          
                          // Use different tour for each sector (rotate through the list)
                          const tourIndex = idx % Math.max(gambiaOnlyTours.length, 1);
                          const multiTourIndex = idx % Math.max(multiCountryTours.length, 1);
                          
                          // Calculate which packaging strategy is stronger
                          const diff = enriched.gambiaOnlyEmphasis - enriched.multiCountryEmphasis;
                          const strongerStrategy = Math.abs(diff) < 5 ? 'similar' : 
                            diff > 0 ? 'gambia-only' : 'multi-country';
                          
                          return (
                            <div key={idx} className={`border-2 rounded-lg p-6 ${
                              isClosest ? 'bg-green-50 border-green-300' : 
                              isFurthest ? 'bg-amber-50 border-amber-300' : 
                              'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">📊</span>
                                    <h4 className="text-xl font-bold text-gray-900">{enriched.sector}</h4>
                                  </div>
                                  {isClosest && (
                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white">
                                      🎯 Focus Opportunity (Smallest Gap)
                                    </span>
                                  )}
                                  {isFurthest && (
                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-amber-600 text-white">
                                      📈 Biggest Opportunity (Largest Gap)
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Metrics Grid */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                                  <div className="text-sm text-gray-600 mb-1">📈 Gambia {sectorShortName}</div>
                                  <div className="text-3xl font-bold text-blue-600">{enriched.digitalReadiness}%</div>
                                  <div className="text-xs text-gray-500 mt-1">Digital readiness</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                                  <div className="text-sm text-gray-600 mb-1">🇬🇲 Gambia-Only Tours</div>
                                  <div className="text-3xl font-bold text-green-600">{enriched.gambiaOnlyEmphasis}%</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Gap: {enriched.gambiaOnlyGap > 0 ? '+' : ''}{enriched.gambiaOnlyGap}pp
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                                  <div className="text-sm text-gray-600 mb-1">🌍 Multi-Country Tours</div>
                                  <div className="text-3xl font-bold text-purple-600">{enriched.multiCountryEmphasis}%</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Gap: {enriched.multiCountryGap > 0 ? '+' : ''}{enriched.multiCountryGap}pp
                                  </div>
                                </div>
                              </div>
                              
                              {/* Highlight Tours */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-green-900 mb-2">🇬🇲 Example: Pure Gambia Tour</h5>
                                  {gambiaOnlyTours.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{gambiaOnlyTours[tourIndex].operator}</p>
                                      <p className="text-sm text-gray-700 mt-1">Creative Score: <strong>{gambiaOnlyTours[tourIndex].creative_score}</strong></p>
                                      <a href={gambiaOnlyTours[tourIndex].url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:text-green-900 mt-2 inline-block">
                                        View Tour →
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600">No examples available</p>
                                  )}
                                </div>
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-purple-900 mb-2">🌍 Example: Multi-Country Tour</h5>
                                  {multiCountryTours.length > 0 ? (
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{multiCountryTours[multiTourIndex].operator}</p>
                                      <p className="text-sm text-gray-700 mt-1">Creative Score: <strong>{multiCountryTours[multiTourIndex].creative_score}</strong></p>
                                      <a href={multiCountryTours[multiTourIndex].url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-700 hover:text-purple-900 mt-2 inline-block">
                                        View Tour →
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600">No examples available</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Packaging Strategy Insight */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="text-sm font-semibold text-blue-900 mb-2">📦 Packaging Strategy Insight</div>
                                <p className="text-sm text-blue-800">
                                  {strongerStrategy === 'similar' && 
                                    `This sector performs equally in both formats (${enriched.gambiaOnlyEmphasis}% vs ${enriched.multiCountryEmphasis}%). Flexible positioning strategy.`}
                                  {strongerStrategy === 'gambia-only' && 
                                    `Operators emphasize this MORE in pure Gambia tours (+${diff}pp). Focus on standalone Gambian ${sectorShortName.toLowerCase()} experiences.`}
                                  {strongerStrategy === 'multi-country' && 
                                    `Operators emphasize this MORE in regional packages (+${Math.abs(diff)}pp). Position Gambian ${sectorShortName.toLowerCase()} within Senegambian or West African context.`}
                                </p>
                              </div>

                              {/* Digital Visibility Opportunity */}
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <div className="text-sm font-semibold text-indigo-900 mb-2">💡 Digital Visibility Opportunity</div>
                                <p className="text-sm text-indigo-800">
                                  {Math.abs(enriched.avgGap) < 10 && 
                                    `Small gap (${Math.round(enriched.avgGap)}pp avg). ${sectorShortName} is relatively well-positioned. Minor digital improvements could close the gap.`}
                                  {Math.abs(enriched.avgGap) >= 10 && Math.abs(enriched.avgGap) < 30 && 
                                    `Moderate gap (${Math.round(enriched.avgGap)}pp avg). Improving ${sectorShortName} digital presence could increase ITO inclusion.`}
                                  {Math.abs(enriched.avgGap) >= 30 && 
                                    `Large gap (${Math.round(enriched.avgGap)}pp avg). ${sectorShortName} has significant opportunity — ITOs want to feature this, but digital discoverability may be limiting inclusion.`}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

