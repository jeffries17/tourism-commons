import { useMemo, useState } from 'react';
import { Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { getThemeDisplayName, getThemeIcon, UNIFIED_THEMES } from '../constants/themes';

interface ThemeScore {
  score: number;
  mentions: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface StakeholderThemeData {
  stakeholder_name: string;
  source: string;
  country?: string;
  theme_scores: Record<string, ThemeScore>;
  total_reviews: number;
}

interface ThemeComparisonProps {
  gambianData: StakeholderThemeData[];
  regionalData: StakeholderThemeData[];
  showRadar?: boolean;
  showBars?: boolean;
  highlightGaps?: boolean;
}

export default function ThemeComparison({ 
  gambianData, 
  regionalData, 
  showRadar = true,
  showBars = true,
  highlightGaps = true
}: ThemeComparisonProps) {
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  
  // Calculate average scores for each theme, including per-country breakdown
  const themeComparison = useMemo(() => {
    const calculateAverage = (data: StakeholderThemeData[], theme: string) => {
      const scores: number[] = [];
      let totalMentions = 0;
      
      data.forEach(stakeholder => {
        if (stakeholder.theme_scores && stakeholder.theme_scores[theme]) {
          const themeData = stakeholder.theme_scores[theme];
          if (themeData.mentions > 0) {
            scores.push(themeData.score);
            totalMentions += themeData.mentions;
          }
        }
      });
      
      return {
        average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        mentions: totalMentions,
        count: scores.length
      };
    };

    const calculateCountryAverage = (data: StakeholderThemeData[], theme: string, country: string) => {
      const scores: number[] = [];
      const countryData = data.filter(s => s.country === country);
      
      countryData.forEach(stakeholder => {
        if (stakeholder.theme_scores && stakeholder.theme_scores[theme]) {
          const themeData = stakeholder.theme_scores[theme];
          if (themeData.mentions > 0) {
            scores.push(themeData.score);
          }
        }
      });
      
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    };

    // Get unique countries from regional data
    const countries = Array.from(new Set(regionalData.map(s => s.country).filter(Boolean))) as string[];
    countries.sort();
    
    return UNIFIED_THEMES.map(theme => {
      const gambiaStats = calculateAverage(gambianData, theme);
      const regionalStats = calculateAverage(regionalData, theme);
      const gap = gambiaStats.average - regionalStats.average;
      
      // Calculate per-country averages
      const countryAverages: Record<string, number> = {};
      countries.forEach(country => {
        const avg = calculateCountryAverage(regionalData, theme, country);
        if (avg !== null) {
          countryAverages[country] = avg;
        }
      });
      
      // Find the leader
      const allScores = Object.entries(countryAverages);
      const leader = allScores.length > 0 
        ? allScores.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))
        : null;
      
      return {
        theme,
        themeName: getThemeDisplayName(theme),
        themeShort: getThemeDisplayName(theme).split('&')[0].trim(),
        icon: getThemeIcon(theme),
        gambia: gambiaStats.average,
        regional: regionalStats.average,
        gap,
        gambiaMentions: gambiaStats.mentions,
        regionalMentions: regionalStats.mentions,
        gambiaCount: gambiaStats.count,
        regionalCount: regionalStats.count,
        countryAverages,
        leaderCountry: leader ? leader[0] : null,
        leaderScore: leader ? leader[1] : null,
        gapToLeader: leader ? gambiaStats.average - leader[1] : null
      };
    });
  }, [gambianData, regionalData]);
  
  // Sort by gap for bar chart
  const sortedByGap = useMemo(() => {
    return [...themeComparison].sort((a, b) => b.gap - a.gap);
  }, [themeComparison]);
  
  // Prepare radar chart data
  const radarData = useMemo(() => {
    return themeComparison.map(item => ({
      theme: item.themeShort,
      Gambia: item.gambia.toFixed(3),
      Regional: item.regional.toFixed(3),
      Leader: item.leaderScore !== null ? item.leaderScore.toFixed(3) : null,
      fullName: item.themeName,
      leaderCountry: item.leaderCountry
    }));
  }, [themeComparison]);
  
  // Find biggest gaps
  const biggestStrength = sortedByGap[0];
  const biggestGap = sortedByGap[sortedByGap.length - 1];
  
  // Find Gambia's lowest-scoring theme (relative to its own themes, not regional comparison)
  const sortedByGambiaScore = useMemo(() => {
    return [...themeComparison].sort((a, b) => a.gambia - b.gambia);
  }, [themeComparison]);
  const lowestGambiaTheme = sortedByGambiaScore[0];
  
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {highlightGaps && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Biggest Strength */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{biggestStrength.icon}</span>
              <div>
                <div className="text-sm font-medium text-green-700">🎯 Gambia's Biggest Strength</div>
                <div className="text-lg font-bold text-green-900">{biggestStrength.themeName}</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-green-600">{biggestStrength.gap >= 0 ? '+' : ''}{biggestStrength.gap.toFixed(3)}</div>
              <div className="text-sm text-green-700">points ahead of regional average (-1 to +1 scale)</div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Gambia: <span className="font-semibold">{biggestStrength.gambia >= 0 ? '+' : ''}{biggestStrength.gambia.toFixed(3)}</span></span>
                <span className="text-green-600">Regional: <span className="font-semibold">{biggestStrength.regional >= 0 ? '+' : ''}{biggestStrength.regional.toFixed(3)}</span></span>
              </div>
            </div>
          </div>
          
          {/* Priority Focus Area - Gambia's Lowest Theme */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{lowestGambiaTheme.icon}</span>
              <div>
                <div className="text-sm font-medium text-orange-700">🎯 Priority Focus Area</div>
                <div className="text-lg font-bold text-orange-900">{lowestGambiaTheme.themeName}</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-orange-600">{lowestGambiaTheme.gambia >= 0 ? '+' : ''}{lowestGambiaTheme.gambia.toFixed(3)}</div>
              <div className="text-sm text-orange-700">Gambia's lowest-scoring theme (relative to own performance)</div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Gambia: <span className="font-semibold">{lowestGambiaTheme.gambia >= 0 ? '+' : ''}{lowestGambiaTheme.gambia.toFixed(3)}</span></span>
                <span className="text-orange-600">Regional: <span className="font-semibold">{lowestGambiaTheme.regional >= 0 ? '+' : ''}{lowestGambiaTheme.regional.toFixed(3)}</span></span>
              </div>
              {lowestGambiaTheme.gap >= 0 && (
                <div className="mt-2 text-xs text-orange-600 italic">
                  ✓ Still above regional average ({lowestGambiaTheme.gap >= 0 ? '+' : ''}{lowestGambiaTheme.gap.toFixed(3)} gap)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Radar Chart */}
      {showRadar && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span>
            Theme Performance Comparison
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Gambia (Creative Industries + Tour Operators) vs Regional Average vs Regional Leaders across all 9 themes (-1 to +1 scale)
          </p>
          <ResponsiveContainer width="100%" height={600}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="theme" 
                tick={{ fill: '#374151', fontSize: 14, fontWeight: 'medium' }}
              />
              <PolarRadiusAxis angle={90} domain={[-1, 1]} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 'medium' }} />
              <Radar 
                name="Gambia" 
                dataKey="Gambia" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.35}
                strokeWidth={3}
              />
              <Radar 
                name="Regional Avg" 
                dataKey="Regional" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.25}
                strokeWidth={3}
              />
              <Radar 
                name="Regional Leader" 
                dataKey="Leader" 
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.3}
                strokeWidth={3}
                strokeDasharray="8 4"
              />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const gambiaVal = parseFloat(payload[0].value as string);
                  const regionalVal = payload[1] ? parseFloat(payload[1].value as string) : 0;
                  const leaderVal = payload[2] ? parseFloat(payload[2].value as string) : null;
                  const leaderCountry = payload[0].payload.leaderCountry;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-sm mb-2">{payload[0].payload.fullName}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-green-600">Gambia: <span className="font-semibold">{gambiaVal >= 0 ? '+' : ''}{gambiaVal.toFixed(3)}</span></p>
                        <p className="text-sm text-blue-600">Regional Avg: <span className="font-semibold">{regionalVal >= 0 ? '+' : ''}{regionalVal.toFixed(3)}</span></p>
                        {leaderVal !== null && (
                          <p className="text-sm text-orange-600">
                            Regional Leader ({leaderCountry}): <span className="font-semibold">{leaderVal >= 0 ? '+' : ''}{leaderVal.toFixed(3)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconSize={14} iconType="line" />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Detailed Bar Chart */}
      {showBars && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span>
            Theme Performance vs Regional Competitors
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Comparing Gambia's performance across 9 unified themes against regional competitors (Nigeria, Ghana, Senegal, Benin, Cape Verde)
          </p>
          
          {/* Info banner about scoring */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="flex items-center gap-2">
              <span className="font-semibold">ℹ️ About the scores:</span>
              Scores are based on sentiment analysis on a -1 to +1 scale, where +1 is most positive and -1 is most negative
            </p>
          </div>
          
          {/* Summary boxes */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {sortedByGap.filter(t => t.gap > 0.02).length}<span className="text-lg text-green-500">/9</span>
              </div>
              <div className="text-sm text-green-700 mt-1">Overall Themes Leading</div>
              <div className="text-xs text-green-600 mt-1">Gambia scores above regional average</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {((sortedByGap.reduce((sum, t) => sum + t.gap, 0) / 9) >= 0 ? '+' : '')}{((sortedByGap.reduce((sum, t) => sum + t.gap, 0) / 9)).toFixed(3)}
              </div>
              <div className="text-sm text-purple-700 mt-1">Average Gap</div>
              <div className="text-xs text-purple-600 mt-1">Mean difference across all themes (-1 to +1 scale)</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {sortedByGap.filter(t => t.gap < -0.02).length}<span className="text-lg text-orange-500">/9</span>
              </div>
              <div className="text-sm text-orange-700 mt-1">Themes Needing Focus</div>
              <div className="text-xs text-orange-600 mt-1">Areas below regional average</div>
            </div>
          </div>
          
          {/* Theme-by-Theme Comparison with Vertical Bar Charts */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Theme-by-Theme Comparison</h4>
            
            {/* Theme Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
              {sortedByGap.map((item, index) => (
                <button
                  key={item.theme}
                  onClick={() => setSelectedThemeIndex(index)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedThemeIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.themeName}</span>
                  <span className="sm:hidden">{item.themeShort}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Selected Theme Display */}
          <div className="space-y-6">
            {sortedByGap.map((item, index) => {
              if (index !== selectedThemeIndex) return null;
              // Prepare data for bar chart: Gambia, Regional Avg, then each country
              const countries = Object.keys(item.countryAverages).sort();
              const chartData = [
                {
                  name: 'Gambia',
                  score: item.gambia,
                  isGambia: true,
                  isRegional: false
                },
                {
                  name: 'Regional Avg',
                  score: item.regional,
                  isGambia: false,
                  isRegional: true
                },
                ...countries.map(country => ({
                  name: country,
                  score: item.countryAverages[country],
                  isGambia: false,
                  isRegional: false
                }))
              ];
              
              // Determine color for each bar
              const getBarColor = (name: string) => {
                if (name === 'Gambia') return '#10b981'; // green
                if (name === 'Regional Avg') return '#3b82f6'; // blue
                return '#94a3b8'; // gray for other countries
              };
              
              return (
                <div key={item.theme} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.themeName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.gambiaCount} Gambian stakeholders ({item.gambiaMentions} mentions) • {item.regionalCount} regional stakeholders ({item.regionalMentions} mentions)
                        </p>
                        {item.theme === lowestGambiaTheme.theme && (
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            🎯 Gambia's lowest-scoring theme {item.gap >= 0 ? '(still above regional average)' : ''}
                          </p>
                        )}
                        {item.gapToLeader !== null && item.gapToLeader < 0 && item.theme !== lowestGambiaTheme.theme && (
                          <p className="text-xs text-gray-600 mt-1">
                            Leader: {item.leaderCountry} (+{(item.gapToLeader > 0 ? '+' : '')}{item.leaderScore?.toFixed(3)})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-xl font-bold ${item.gap > 0 ? 'text-green-600' : item.gap < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {item.gap >= 0 ? '+' : ''}{item.gap.toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-500">vs Regional Avg</div>
                    </div>
                  </div>
                  
                  {/* Vertical Bar Chart - Larger for better readability */}
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
                        barGap={12}
                        barCategoryGap="25%"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          label={{ value: 'Sentiment Score (-1 to +1)', angle: -90, position: 'insideLeft', style: { fontSize: '13px' } }}
                          domain={[-1, 1]}
                          tick={{ fontSize: 12 }}
                          width={50}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                          formatter={(value: number) => [(value >= 0 ? '+' : '') + value.toFixed(3), 'Score']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar 
                          dataKey="score" 
                          radius={[6, 6, 0, 0]}
                          barSize={50}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


