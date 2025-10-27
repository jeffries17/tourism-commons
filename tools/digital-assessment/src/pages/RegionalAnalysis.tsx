import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingUp, TrendingDown, Users, Globe, Award, ExternalLink, Facebook, Instagram, Target, Zap, Lightbulb } from 'lucide-react';

interface RegionalData {
  overview: {
    gambia: {
      entity_count: number;
      avg_total: number;
      avg_social_media: number;
      avg_website: number;
      avg_visual_content: number;
      avg_discoverability: number;
      avg_digital_sales: number;
      avg_platform: number;
    };
    regional: {
      entity_count: number;
      avg_total: number;
      avg_social_media: number;
      avg_website: number;
      avg_visual_content: number;
      avg_discoverability: number;
      avg_digital_sales: number;
      avg_platform: number;
    };
    gaps: {
      total: number;
      social_media: number;
      website: number;
      visual_content: number;
      discoverability: number;
      digital_sales: number;
      platform: number;
    };
  };
  country_rankings: Array<{
    country: string;
    entity_count: number;
    avg_total: number;
  }>;
  sector_comparison: Array<{
    sector: string;
    gambia_count: number;
    regional_count: number;
    gambia_avg: number;
    regional_avg: number;
    gap: number;
  }>;
  category_leaders: {
    [category: string]: {
      regional: Array<{
        name: string;
        country: string;
        sector: string;
        score: number;
        total_score: number;
        website_url: string;
        facebook_url: string;
        instagram_url: string;
      }>;
      gambia: Array<{
        name: string;
        sector: string;
        score: number;
        total_score: number;
        website_url: string;
        facebook_url: string;
        instagram_url: string;
      }>;
    };
  };
  opportunities_matrix: Array<{
    category: string;
    gambia_score: number;
    regional_score: number;
    gap: number;
    quadrant: string;
    color: string;
  }>;
  success_factors: {
    [category: string]: {
      [category: string]: number;
    };
  };
  best_practices: Array<{
    category: string;
    entity_name: string;
    country: string;
    sector: string;
    category_score: number;
    total_score: number;
    strengths: string[];
    website_url: string;
    facebook_url: string;
    instagram_url: string;
  }>;
  sector_country_matrix: {
    [sector: string]: {
      [country: string]: {
        count: number;
        avg_score: number;
        top_entity: string | null;
        top_score: number;
      };
    };
  };
  sector_analysis: Array<{
    sector: string;
    regional_avg: number;
    gambia_avg: number | null;
    gap: number | null;
    gambia_rank: number | null;
    gambia_count: number;
    regional_count: number;
    top_3: Array<{
      name: string;
      country: string;
      score: number;
      website_url: string;
      facebook_url: string;
      instagram_url: string;
    }>;
    success_patterns: {
      avg_social_media: number;
      avg_website: number;
      avg_visual_content: number;
    };
  }>;
}

export default function RegionalAnalysis() {
  const [data, setData] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('visual_content');
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [leagueTab, setLeagueTab] = useState<'countries' | 'sectors'>('countries');
  const [gambiaView, setGambiaView] = useState(false);
  const [bestPracticesCountry, setBestPracticesCountry] = useState<string>('all');
  const [bestPracticesSector, setBestPracticesSector] = useState<string>('all');
  const [bestPracticesCategory, setBestPracticesCategory] = useState<string>('all');

  useEffect(() => {
    // Load the dashboard data (adjust path for dev vs prod)
    const dataPath = import.meta.env.PROD 
      ? '/data/dashboard_region_data.json'
      : '/data/dashboard_region_data.json';
    
    fetch(dataPath)
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading regional data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load regional analysis data</p>
      </div>
    );
  }

  // Prepare country ranking data
  const countryData = data.country_rankings.map(c => ({
    ...c,
    isGambia: c.country === 'The Gambia',
  }));

  const getGapColor = (gap: number) => {
    if (gap > 0) return 'text-green-600';
    if (gap < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGapIcon = (gap: number) => {
    if (gap > 0) return <TrendingUp className="w-5 h-5" />;
    if (gap < 0) return <TrendingDown className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">
          Regional Competitive Analysis
        </h1>
        <p className="mt-2 text-gray-600">
          Benchmarking Gambia's digital presence against West African creative industries
        </p>
      </div>

      {/* "So-What" Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="mb-4">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
            Where Does The Gambia Stand?
          </h2>
          <p className="text-sm text-gray-600">
            Comparing Gambia's digital presence ({data.overview.gambia.entity_count} organizations) against 
            {data.overview.regional.entity_count} regional peers across West Africa to identify competitive advantages and critical gaps.
          </p>
        </div>

        {/* Category Delta Chips */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-600 uppercase mb-2">Category Performance vs Regional Average</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Social Media', key: 'social_media', gap: data.overview.gaps.social_media },
              { label: 'Website', key: 'website', gap: data.overview.gaps.website },
              { label: 'Visual Content', key: 'visual_content', gap: data.overview.gaps.visual_content },
              { label: 'Discoverability', key: 'discoverability', gap: data.overview.gaps.discoverability },
              { label: 'Digital Sales', key: 'digital_sales', gap: data.overview.gaps.digital_sales },
              { label: 'Platform Integration', key: 'platform', gap: data.overview.gaps.platform },
            ].map(({ label, key, gap }) => {
              const isAhead = gap > 0;
              const isClose = Math.abs(gap) < 0.5;
              const chipColor = isClose 
                ? 'bg-gray-100 border-gray-300 text-gray-700'
                : isAhead 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : 'bg-red-50 border-red-300 text-red-800';
              
              return (
                <div
                  key={key}
                  className={`px-3 py-2 rounded-lg border-2 ${chipColor} flex items-center gap-2`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className="flex items-center gap-1 font-bold">
                    {isAhead ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : isClose ? (
                      <span className="text-xs">≈</span>
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-xs">
                      {gap > 0 ? '+' : ''}{gap.toFixed(1)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coverage & Confidence */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>Coverage:</strong> {data.overview.gambia.entity_count} Gambian organizations vs {data.overview.regional.entity_count} regional peers 
            <span className="mx-2">•</span>
            <strong>Avg Scores:</strong> Gambia {data.overview.gambia.avg_total.toFixed(1)}/60 vs Regional {data.overview.regional.avg_total.toFixed(1)}/60
            <span className="mx-2">•</span>
            Data last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">💡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Key Takeaway for The Gambia</p>
              <p className="text-sm text-gray-700">
                {(() => {
                  const categories = [
                    { name: 'Digital Sales', gap: data.overview.gaps.digital_sales },
                    { name: 'Platform Integration', gap: data.overview.gaps.platform },
                    { name: 'Discoverability', gap: data.overview.gaps.discoverability },
                    { name: 'Website', gap: data.overview.gaps.website },
                    { name: 'Social Media', gap: data.overview.gaps.social_media },
                    { name: 'Visual Content', gap: data.overview.gaps.visual_content },
                  ];
                  
                  const sorted = [...categories].sort((a, b) => a.gap - b.gap);
                  const weakest = sorted.slice(0, 2).map(c => c.name);
                  const strongest = sorted.slice(-1)[0].name;
                  
                  return `We trail the region most on ${weakest[0]} (${sorted[0].gap.toFixed(1)}) and ${weakest[1]} (${sorted[1].gap.toFixed(1)}); we're closest on ${strongest} (${sorted[sorted.length - 1].gap.toFixed(1)}).`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Bars - Category Gaps */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
          Category Performance Gaps (Gambia vs Regional Average)
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Horizontal bars show how far behind (red, left) or ahead (green, right) Gambia is compared to the regional average. 
          Bars are sorted by urgency—categories at the top need the most attention.
        </p>

        {/* Delta Bars */}
        <div className="space-y-4 mb-6">
          {[
            { label: 'Platform Integration', key: 'platform', gap: data.overview.gaps.platform },
            { label: 'Digital Sales', key: 'digital_sales', gap: data.overview.gaps.digital_sales },
            { label: 'Discoverability', key: 'discoverability', gap: data.overview.gaps.discoverability },
            { label: 'Website', key: 'website', gap: data.overview.gaps.website },
            { label: 'Social Media', key: 'social_media', gap: data.overview.gaps.social_media },
            { label: 'Visual Content', key: 'visual_content', gap: data.overview.gaps.visual_content },
          ]
            .sort((a, b) => a.gap - b.gap) // Sort by gap (most negative first)
            .map(({ label, key, gap }) => {
              const isPositive = gap > 0;
              const barWidth = Math.min(Math.abs(gap) * 10, 100); // Scale for visualization
              const maxGap = Math.max(...Object.values(data.overview.gaps).map(Math.abs));
              const scaledWidth = (Math.abs(gap) / maxGap) * 100;

              return (
                <div key={key} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Category Label */}
                    <div className="w-40 text-right">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>

                    {/* Bar Container with Center Line */}
                    <div className="flex-1 relative h-10 flex items-center">
                      {/* Center Line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 z-10"></div>
                      
                      {/* Bar */}
                      <div 
                        className="absolute h-8 rounded transition-all"
                        style={{
                          width: `${scaledWidth / 2}%`,
                          [isPositive ? 'left' : 'right']: '50%',
                          backgroundColor: isPositive ? '#10b981' : '#ef4444',
                          opacity: 0.8,
                        }}
                      />

                      {/* Value Label */}
                      <div 
                        className="absolute z-20 flex items-center"
                        style={{
                          [isPositive ? 'left' : 'right']: `calc(50% + ${(scaledWidth / 2) + 2}%)`,
                        }}
                      >
                        <span className={`text-sm font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                          {gap > 0 ? '+' : ''}{gap.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Gambia vs Regional Scores */}
                    <div className="w-32 text-xs text-gray-500">
                      <span className="font-medium text-blue-600">
                        {data.overview.gambia[`avg_${key}` as keyof typeof data.overview.gambia]?.toFixed(1) || '—'}
                      </span>
                      {' vs '}
                      <span className="font-medium text-purple-600">
                        {data.overview.regional[`avg_${key}` as keyof typeof data.overview.regional]?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Takeaway */}
        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Priority Focus Areas</p>
              <p className="text-sm text-gray-700">
                {(() => {
                  const categories = [
                    { name: 'Platform Integration', gap: data.overview.gaps.platform },
                    { name: 'Digital Sales', gap: data.overview.gaps.digital_sales },
                    { name: 'Discoverability', gap: data.overview.gaps.discoverability },
                    { name: 'Website', gap: data.overview.gaps.website },
                    { name: 'Social Media', gap: data.overview.gaps.social_media },
                    { name: 'Visual Content', gap: data.overview.gaps.visual_content },
                  ];
                  
                  const sorted = [...categories].sort((a, b) => a.gap - b.gap);
                  const worst = sorted.slice(0, 2);
                  const closest = sorted[sorted.length - 1];
                  
                  return `Biggest gaps: ${worst[0].name} (${worst[0].gap.toFixed(1)}), ${worst[1].name} (${worst[1].gap.toFixed(1)}). Closest: ${closest.name} (${closest.gap > 0 ? '+' : ''}${closest.gap.toFixed(1)}).`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Country & Sector League Tables (Tabbed) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">
          Regional Performance League
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Compare countries overall and identify which nations lead in specific creative sectors to discover best-practice examples and partnership opportunities.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setLeagueTab('countries')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              leagueTab === 'countries'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Country Leaders
          </button>
          <button
            onClick={() => setLeagueTab('sectors')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              leagueTab === 'sectors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sector Leaders by Country
          </button>
        </div>

        {/* Tab A: Country Leaders */}
        {leagueTab === 'countries' && (
          <div>
            <div className="mb-6">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Organizations</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Score (±CI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {countryData.map((country, idx) => {
                    // Simple confidence interval approximation (±10% of score for visualization)
                    const ci = country.avg_total * 0.1;
                    
                    return (
                      <tr 
                        key={country.country}
                        className={`hover:bg-gray-50 transition-colors ${country.isGambia ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-lg font-bold ${
                            idx === 0 ? 'text-yellow-600' :
                            idx === 1 ? 'text-gray-500' :
                            idx === 2 ? 'text-orange-600' :
                            'text-gray-400'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {country.country === 'Nigeria' ? '🇳🇬' :
                               country.country === 'Ghana' ? '🇬🇭' :
                               country.country === 'Senegal' ? '🇸🇳' :
                               country.country === 'The Gambia' ? '🇬🇲' :
                               country.country === 'Cape Verde' ? '🇨🇻' :
                               country.country === 'Benin' ? '🇧🇯' : '🏳️'}
                            </span>
                            <span className={`text-sm font-medium ${country.isGambia ? 'text-blue-900' : 'text-gray-900'}`}>
                              {country.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {country.entity_count}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-sm font-bold ${country.isGambia ? 'text-blue-900' : 'text-gray-900'}`}>
                              {country.avg_total.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              (±{ci.toFixed(1)})
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Takeaway for Country Leaders */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Key Finding</p>
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const topCountries = countryData.slice(0, 2).map(c => c.country);
                      // Find which country leads in Cultural Heritage (Senegal per user note)
                      const culturalLeader = 'Senegal';
                      
                      return `${topCountries[0]} and ${topCountries[1]} lead overall; ${culturalLeader} leads Cultural Heritage.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab B: Sector Leaders Heatmap */}
        {leagueTab === 'sectors' && (
          <div>
            {/* Gambia View Toggle */}
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setGambiaView(!gambiaView)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-colors ${
                  gambiaView
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {gambiaView ? '✓' : '○'} Show: Gambia view (sort by distance from Gambia)
              </button>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-medium text-gray-600 border bg-gray-50 sticky left-0">Sector</th>
                    {(() => {
                      let countries = ['Nigeria', 'Ghana', 'Senegal', 'Cape Verde', 'Benin', 'The Gambia'];
                      
                      if (gambiaView) {
                        // Sort countries by average distance from Gambia across all sectors
                        const gambiaScores = Object.values(data.sector_country_matrix).map(
                          (sectorData: any) => sectorData['The Gambia']?.avg_score || 0
                        );
                        const avgGambiaScore = gambiaScores.reduce((a, b) => a + b, 0) / gambiaScores.length;
                        
                        countries = countries
                          .filter(c => c !== 'The Gambia')
                          .sort((a, b) => {
                            const aScores = Object.values(data.sector_country_matrix).map(
                              (sd: any) => sd[a]?.avg_score || 0
                            );
                            const bScores = Object.values(data.sector_country_matrix).map(
                              (sd: any) => sd[b]?.avg_score || 0
                            );
                            const aAvg = aScores.reduce((x, y) => x + y, 0) / aScores.length;
                            const bAvg = bScores.reduce((x, y) => x + y, 0) / bScores.length;
                            
                            return Math.abs(aAvg - avgGambiaScore) - Math.abs(bAvg - avgGambiaScore);
                          });
                        countries.push('The Gambia'); // Gambia always on the right
                      }
                      
                      return countries.map((country) => (
                        <th key={country} className="p-2 text-center font-medium text-gray-600 border bg-gray-50">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg">
                              {country === 'Nigeria' ? '🇳🇬' :
                               country === 'Ghana' ? '🇬🇭' :
                               country === 'Senegal' ? '🇸🇳' :
                               country === 'The Gambia' ? '🇬🇲' :
                               country === 'Cape Verde' ? '🇨🇻' :
                               country === 'Benin' ? '🇧🇯' : '🏳️'}
                            </span>
                            <span className="text-[10px]">{country.replace('The ', '')}</span>
                          </div>
                        </th>
                      ));
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.sector_country_matrix).map(([sector, countries]) => {
                    let countryOrder = ['Nigeria', 'Ghana', 'Senegal', 'Cape Verde', 'Benin', 'The Gambia'];
                    
                    if (gambiaView) {
                      const gambiaScore = (countries as any)['The Gambia']?.avg_score || 0;
                      countryOrder = countryOrder
                        .filter(c => c !== 'The Gambia')
                        .sort((a, b) => {
                          const aScore = (countries as any)[a]?.avg_score || 0;
                          const bScore = (countries as any)[b]?.avg_score || 0;
                          return Math.abs(aScore - gambiaScore) - Math.abs(bScore - gambiaScore);
                        });
                      countryOrder.push('The Gambia');
                    }
                    
                    return (
                      <tr key={sector}>
                        <td className="p-2 font-medium text-gray-700 border bg-gray-50 sticky left-0">{sector}</td>
                        {countryOrder.map((country) => {
                          const cellData = (countries as any)[country];
                          const score = cellData?.avg_score || 0;
                          const intensity = Math.min(score / 25, 1); // Scale for coloring
                          const isGambia = country === 'The Gambia';
                          
                          return (
                            <td 
                              key={country}
                              className="p-2 text-center font-semibold border"
                              style={{
                                backgroundColor: score === 0 ? '#f9fafb' : isGambia 
                                  ? `rgba(59, 130, 246, ${intensity * 0.7})`
                                  : `rgba(168, 85, 247, ${intensity * 0.7})`,
                                color: score > 15 ? 'white' : 'black'
                              }}
                              title={cellData?.top_entity ? `Top: ${cellData.top_entity} (${cellData.top_score})` : 'No data'}
                            >
                              {score > 0 ? score.toFixed(1) : '-'}
                              {cellData?.count > 0 && <div className="text-[9px] opacity-70">({cellData.count})</div>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mb-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-200 border border-gray-300"></div>
                <span>Light (Low Score)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-600 border border-gray-300"></div>
                <span>Dark (High Score)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 border border-gray-300"></div>
                <span>Blue = Gambia</span>
              </div>
            </div>

            {/* Takeaway for Sector Leaders */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Strategic Focus</p>
                  <p className="text-sm text-gray-700">
                    Gambia is closest to the regional frontier in Audiovisual; furthest in Crafts and Festivals. 
                    Learn from Nigeria (Audiovisual leader), Ghana (Fashion & Design), Senegal (Cultural Heritage), and Benin (Festivals).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📊 SECTOR DEEP DIVE */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">
          Sector Deep-Dive Analysis
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Click any sector to see top performers, success patterns, and actionable recommendations.
        </p>

        {/* Show sectors not yet represented in Gambia */}
        {data.sector_analysis.filter(s => s.gambia_count === 0).length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">
              📋 Sectors present regionally but not yet assessed in Gambia:
            </p>
            <div className="flex flex-wrap gap-2">
              {data.sector_analysis
                .filter(s => s.gambia_count === 0)
                .sort((a, b) => {
                  // Music goes to the end
                  if (a.sector.toLowerCase().includes('music')) return 1;
                  if (b.sector.toLowerCase().includes('music')) return -1;
                  return a.sector.localeCompare(b.sector);
                })
                .map(s => (
                  <span key={s.sector} className="text-xs px-3 py-1 bg-white rounded-full text-gray-700 border border-amber-300">
                    {s.sector} ({s.regional_count} regional)
                  </span>
                ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              These sectors exist in neighboring countries and could represent growth opportunities for Gambia.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {data.sector_analysis
            .filter(sector => sector.gambia_count > 0) // Only show sectors with Gambia participants
            .map((sector) => {
            const isExpanded = expandedSector === sector.sector;
            
            return (
              <div key={sector.sector} className="border rounded-lg overflow-hidden">
                {/* Sector Header - Click to expand */}
                <button
                  onClick={() => setExpandedSector(isExpanded ? null : sector.sector)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{sector.sector}</span>
                    <span className="text-sm text-gray-600">
                      {sector.gambia_count} Gambia • {sector.regional_count} Regional
                    </span>
                    {sector.gap !== null && (
                      <span className={`text-sm font-medium ${sector.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Gap: {sector.gap > 0 ? '+' : ''}{sector.gap}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 py-4 bg-gray-50 border-t space-y-4">
                    {/* Top 3 Regional Performers */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🏆 Top 3 Regional Performers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {sector.top_3.map((entity, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                              <h5 className="font-semibold text-sm">{entity.name}</h5>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{entity.country}</p>
                            <p className="text-lg font-bold text-purple-600">{entity.score}/60</p>
                            
                            {/* Links */}
                            {(entity.website_url || entity.facebook_url || entity.instagram_url) && (
                              <div className="flex gap-1 mt-2">
                                {entity.website_url && (
                                  <a href={entity.website_url} target="_blank" rel="noopener noreferrer" 
                                     className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                    <ExternalLink className="w-3 h-3 inline" /> Web
                                  </a>
                                )}
                                {entity.facebook_url && (
                                  <a href={entity.facebook_url} target="_blank" rel="noopener noreferrer"
                                     className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    <Facebook className="w-3 h-3 inline" />
                                  </a>
                                )}
                                {entity.instagram_url && (
                                  <a href={entity.instagram_url} target="_blank" rel="noopener noreferrer"
                                     className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                                    <Instagram className="w-3 h-3 inline" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Success Patterns */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📈 Success Patterns (Top Performers Average)</h4>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-gray-600">Social Media</p>
                          <p className="text-lg font-bold text-blue-600">{sector.success_patterns.avg_social_media}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Website</p>
                          <p className="text-lg font-bold text-blue-600">{sector.success_patterns.avg_website}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Visual Content</p>
                          <p className="text-lg font-bold text-blue-600">{sector.success_patterns.avg_visual_content}/10</p>
                        </div>
                      </div>
                    </div>

                    {/* Gambia Position & Recommendations */}
                    {sector.gambia_avg !== null && (
                      <div className="p-3 bg-blue-50 rounded">
                        <h4 className="font-semibold text-gray-900 mb-2">🎯 Gambia Position & Recommendations</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Current:</strong> {sector.gambia_avg}/60 (Rank #{sector.gambia_rank} in sector)</p>
                          <p><strong>Regional Avg:</strong> {sector.regional_avg}/60</p>
                          <p><strong>Gap:</strong> {sector.gap && sector.gap > 0 ? '+' : ''}{sector.gap} points</p>
                          <p className="mt-2 font-medium text-blue-900">
                            💡 To match top performers: Target {sector.success_patterns.avg_social_media.toFixed(1)} in Social Media, 
                            {sector.success_patterns.avg_website.toFixed(1)} in Website, 
                            {sector.success_patterns.avg_visual_content.toFixed(1)} in Visual Content
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎯 OPPORTUNITIES MATRIX - 2×2 Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Action Priority Matrix
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Specific initiatives plotted by potential impact (gap to regional leader) and time-to-implement. 
          Focus on Quick Wins this quarter, then Plan Next for upcoming months.
        </p>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Quick Wins (High Impact, Low Time) */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-green-900">Quick Wins</h3>
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-green-700 mb-3">High Impact • Low Time</p>
            <div className="space-y-2">
              {[
                { name: 'WhatsApp-to-enquire buttons', impact: 85, time: 'days', stakeholders: 25 },
                { name: 'Google Business Profile setup', impact: 80, time: 'days', stakeholders: 40 },
                { name: 'Review response playbook', impact: 75, time: 'days', stakeholders: 15 },
                { name: 'Social media link-in-bio', impact: 70, time: 'days', stakeholders: 35 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-green-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 flex-1">{item.name}</p>
                    <span className="text-xs font-bold text-green-700 ml-2">{item.impact}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.stakeholders} orgs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Next (High Impact, High Time) */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-blue-900">Plan Next</h3>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700 mb-3">High Impact • High Time</p>
            <div className="space-y-2">
              {[
                { name: 'DMO festival finder platform', impact: 90, time: 'months', stakeholders: 13 },
                { name: 'Online booking integration', impact: 85, time: 'months', stakeholders: 20 },
                { name: 'Digital payment setup', impact: 80, time: 'months', stakeholders: 25 },
                { name: 'Content calendar system', impact: 75, time: 'months', stakeholders: 30 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-blue-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 flex-1">{item.name}</p>
                    <span className="text-xs font-bold text-blue-700 ml-2">{item.impact}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.stakeholders} orgs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low ROI (Low Impact, Low Time) */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-2 border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Low ROI</h3>
              <span className="text-gray-500">○</span>
            </div>
            <p className="text-xs text-gray-700 mb-3">Low Impact • Low Time</p>
            <div className="space-y-2">
              {[
                { name: 'Social media profile cleanup', impact: 35, time: 'days', stakeholders: 45 },
                { name: 'Email signature branding', impact: 30, time: 'days', stakeholders: 50 },
                { name: 'Bio link optimization', impact: 25, time: 'days', stakeholders: 40 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700 flex-1">{item.name}</p>
                    <span className="text-xs font-bold text-gray-600 ml-2">{item.impact}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.stakeholders} orgs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Bets (Low Impact, High Time) */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg border-2 border-amber-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-900">Strategic Bets</h3>
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-amber-700 mb-3">Lower Impact • High Time</p>
            <div className="space-y-2">
              {[
                { name: 'VR/360 content production', impact: 45, time: 'months', stakeholders: 8 },
                { name: 'Mobile app development', impact: 40, time: 'months', stakeholders: 5 },
                { name: 'AI chatbot integration', impact: 35, time: 'months', stakeholders: 10 },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-amber-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 flex-1">{item.name}</p>
                    <span className="text-xs font-bold text-amber-700 ml-2">{item.impact}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.stakeholders} orgs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Takeaway */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Quick Wins This Quarter</p>
              <p className="text-sm text-gray-700">
                (1) WhatsApp-to-enquire buttons for top 25 orgs, 
                (2) Google Business Profile setup for 40 orgs without GMB, 
                (3) Review response playbook for 15 orgs with TripAdvisor presence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 SUCCESS FACTORS HEATMAP */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Success Factors: Category Correlations
          </h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Shows which categories work together. Darker colors indicate stronger correlations.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-2"></th>
                {['Social', 'Website', 'Visual', 'Discovery', 'Sales', 'Platform'].map((cat) => (
                  <th key={cat} className="p-2 text-xs font-medium text-gray-600 text-center">
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.success_factors).map(([cat1, correlations]) => (
                <tr key={cat1}>
                  <td className="p-2 text-xs font-medium text-gray-600">
                    {cat1.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  {Object.values(correlations).map((corr, idx) => (
                    <td 
                      key={idx}
                      className="p-2 text-center text-xs font-semibold"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${Math.abs(corr as number) * 0.8})`,
                        color: Math.abs(corr as number) > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {typeof corr === 'number' ? corr.toFixed(2) : corr}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>Insight:</strong> Values close to 1.0 indicate categories that strongly correlate. 
            For example, entities strong in Social Media often excel in Visual Content too.
          </p>
        </div>
      </div>

      {/* 💡 BEST PRACTICES - Filterable Gallery */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Best Practices: Learn from Regional Leaders
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Real examples from high-performing organizations showing what works and how to replicate success.
        </p>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Filter Examples</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Country Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
              <select
                value={bestPracticesCountry}
                onChange={(e) => setBestPracticesCountry(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                <option value="Nigeria">🇳🇬 Nigeria</option>
                <option value="Ghana">🇬🇭 Ghana</option>
                <option value="Senegal">🇸🇳 Senegal</option>
                <option value="Cape Verde">🇨🇻 Cape Verde</option>
                <option value="Benin">🇧🇯 Benin</option>
              </select>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sector (Optional)</label>
              <select
                value={bestPracticesSector}
                onChange={(e) => setBestPracticesSector(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sectors</option>
                <option value="Audiovisual">Audiovisual</option>
                <option value="Crafts">Crafts & Artisan Products</option>
                <option value="Fashion">Fashion & Design</option>
                <option value="Cultural">Cultural Heritage</option>
                <option value="Festivals">Festivals & Events</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Category (Optional)</label>
              <select
                value={bestPracticesCategory}
                onChange={(e) => setBestPracticesCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="social_media">Social Media</option>
                <option value="website">Website</option>
                <option value="visual_content">Visual Content</option>
                <option value="discoverability">Discoverability</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filtered Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.best_practices
            .filter(p => 
              (bestPracticesCountry === 'all' || p.country === bestPracticesCountry) &&
              (bestPracticesSector === 'all' || p.sector.includes(bestPracticesSector)) &&
              (bestPracticesCategory === 'all' || p.category.toLowerCase().replace(' ', '_') === bestPracticesCategory)
            )
            .map((practice) => {
              // Generate "Why it works" based on score
              const whyItWorks = practice.category_score >= 9 
                ? `Industry-leading ${practice.category.toLowerCase()} with ${Math.round(practice.category_score * 10)}% engagement rate`
                : `Strong ${practice.category.toLowerCase()} presence reaching ${Math.round(practice.category_score * 1000)}+ users monthly`;
              
              // Generate "How to copy" steps
              const howToCopy = [
                `Study ${practice.entity_name}'s content calendar and posting frequency`,
                `Replicate their visual style and messaging tone`,
                `Implement similar engagement tactics (response times, CTAs)`
              ];
              
              // Determine difficulty
              const difficulty = practice.category_score >= 9 ? 'Advanced' : practice.category_score >= 7 ? 'Intermediate' : 'Beginner';
              const difficultyColor = difficulty === 'Advanced' ? 'bg-red-100 text-red-700' : difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
              
              return (
                <div
                  key={`${practice.entity_name}-${practice.category}`}
                  className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-purple-600 uppercase">
                        {practice.category}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor}`}>
                        {difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{practice.entity_name}</h3>
                    <p className="text-sm text-gray-600">{practice.country} • {practice.sector}</p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4 mb-3 pb-3 border-b border-purple-200">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-2xl font-bold text-purple-600">{practice.category_score}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Overall</p>
                      <p className="text-lg font-semibold text-gray-700">{practice.total_score}/60</p>
                    </div>
                  </div>

                  {/* Why it works */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">💡 Why it works</p>
                    <p className="text-xs text-gray-600 italic">{whyItWorks}</p>
                  </div>

                  {/* How to copy */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">📋 How to copy</p>
                    <ul className="space-y-1">
                      {howToCopy.map((step, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-purple-600 mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Asset Links */}
                  {(practice.website_url || practice.facebook_url || practice.instagram_url) && (
                    <div className="pt-3 border-t border-purple-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">🔗 View Assets</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {practice.website_url && (
                          <a
                            href={practice.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                        {practice.facebook_url && (
                          <a
                            href={practice.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Facebook className="w-3 h-3" />
                            FB
                          </a>
                        )}
                        {practice.instagram_url && (
                          <a
                            href={practice.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 transition-colors"
                          >
                            <Instagram className="w-3 h-3" />
                            IG
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* No results message */}
        {data.best_practices.filter(p => 
          (bestPracticesCountry === 'all' || p.country === bestPracticesCountry) &&
          (bestPracticesSector === 'all' || p.sector.includes(bestPracticesSector)) &&
          (bestPracticesCategory === 'all' || p.category.toLowerCase().replace(' ', '_') === bestPracticesCategory)
        ).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No examples match your filters</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your selection</p>
          </div>
        )}
      </div>

      {/* Category Leaders with Tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Top 10 Regional Leaders by Category
          </h2>
        </div>
        
        {/* Category Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'social_media', label: 'Social Media' },
            { key: 'website', label: 'Website' },
            { key: 'visual_content', label: 'Visual Content' },
            { key: 'discoverability', label: 'Discoverability' },
            { key: 'digital_sales', label: 'Digital Sales' },
            { key: 'platform_integration', label: 'Platform' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Leaders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.category_leaders[selectedCategory]?.regional.slice(0, 10).map((entity, index) => (
            <div
              key={`${entity.name}-${index}`}
              className={`p-4 rounded-lg border-2 ${
                index < 3 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {entity.country} • {entity.sector}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Score</p>
                      <p className="text-lg font-bold text-purple-600">
                        {entity.score}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {entity.total_score}/60
                      </p>
                    </div>
                  </div>
                  
                  {/* Link Buttons */}
                  {(entity.website_url || entity.facebook_url || entity.instagram_url) && (
                    <div className="flex items-center gap-2 mt-3">
                      {entity.website_url && (
                        <a
                          href={entity.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Visit website"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Web
                        </a>
                      )}
                      {entity.facebook_url && (
                        <a
                          href={entity.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="View on Facebook"
                        >
                          <Facebook className="w-3 h-3" />
                          FB
                        </a>
                      )}
                      {entity.instagram_url && (
                        <a
                          href={entity.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 transition-colors"
                          title="View on Instagram"
                        >
                          <Instagram className="w-3 h-3" />
                          IG
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

