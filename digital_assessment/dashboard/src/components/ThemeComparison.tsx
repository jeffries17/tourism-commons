import { useMemo } from 'react';
import { Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
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
  
  // Calculate average scores for each theme
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
    
    return UNIFIED_THEMES.map(theme => {
      const gambiaStats = calculateAverage(gambianData, theme);
      const regionalStats = calculateAverage(regionalData, theme);
      const gap = gambiaStats.average - regionalStats.average;
      
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
        regionalCount: regionalStats.count
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
      Gambia: (item.gambia * 10).toFixed(1),
      Regional: (item.regional * 10).toFixed(1),
      fullName: item.themeName
    }));
  }, [themeComparison]);
  
  // Find biggest gaps
  const biggestStrength = sortedByGap[0];
  const biggestGap = sortedByGap[sortedByGap.length - 1];
  
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
              <div className="text-3xl font-bold text-green-600">+{(biggestStrength.gap * 10).toFixed(1)}</div>
              <div className="text-sm text-green-700">points ahead of regional average (0-10 scale)</div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Gambia: <span className="font-semibold">{(biggestStrength.gambia * 10).toFixed(1)}/10</span></span>
                <span className="text-green-600">Regional: <span className="font-semibold">{(biggestStrength.regional * 10).toFixed(1)}/10</span></span>
              </div>
            </div>
          </div>
          
          {/* Priority Focus Area */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{biggestGap.icon}</span>
              <div>
                <div className="text-sm font-medium text-orange-700">⚠️ Priority Focus Area</div>
                <div className="text-lg font-bold text-orange-900">{biggestGap.themeName}</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-orange-600">{(biggestGap.gap * 10).toFixed(1)}</div>
              <div className="text-sm text-orange-700">points {biggestGap.gap < 0 ? 'behind' : 'ahead of'} regional average</div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Gambia: <span className="font-semibold">{(biggestGap.gambia * 10).toFixed(1)}/10</span></span>
                <span className="text-orange-600">Regional: <span className="font-semibold">{(biggestGap.regional * 10).toFixed(1)}/10</span></span>
              </div>
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
            Gambia (Creative Industries + Tour Operators) vs Regional Competitors across all 9 themes (0-10 scale)
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="theme" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar 
                name="Gambia" 
                dataKey="Gambia" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar 
                name="Regional Avg" 
                dataKey="Regional" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-sm mb-2">{payload[0].payload.fullName}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-green-600">Gambia: <span className="font-semibold">{payload[0].value}/10</span></p>
                        <p className="text-sm text-blue-600">Regional: <span className="font-semibold">{payload[1]?.value}/10</span></p>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
              Scores are based on sentiment analysis (-1 to +1 scale) multiplied by 10 for easier interpretation (displayed as 0-10 scale)
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
                +{((sortedByGap.reduce((sum, t) => sum + t.gap, 0) / 9) * 10).toFixed(2)}
              </div>
              <div className="text-sm text-purple-700 mt-1">Average Gap</div>
              <div className="text-xs text-purple-600 mt-1">Mean difference across all themes (0-10 scale)</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {sortedByGap.filter(t => t.gap < -0.02).length}<span className="text-lg text-orange-500">/9</span>
              </div>
              <div className="text-sm text-orange-700 mt-1">Themes Needing Focus</div>
              <div className="text-xs text-orange-600 mt-1">Areas below regional average</div>
            </div>
          </div>
          
          {/* Theme-by-Theme Comparison */}
          <h4 className="text-md font-semibold text-gray-900 mb-3">Theme-by-Theme Comparison</h4>
          <div className="space-y-3">
            {sortedByGap.map((item) => {
              const maxScore = Math.max(item.gambia, item.regional);
              const gambiaPercent = maxScore > 0 ? (item.gambia / maxScore) * 100 : 0;
              const regionalPercent = maxScore > 0 ? (item.regional / maxScore) * 100 : 0;
              
              return (
                <div key={item.theme} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.themeName}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.gambiaCount} Gambian stakeholders ({item.gambiaMentions} mentions) • {item.regionalCount} regional stakeholders ({item.regionalMentions} mentions)
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-xl font-bold ${item.gap > 0 ? 'text-green-600' : item.gap < 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {item.gap > 0 ? '+' : ''}{(item.gap * 10).toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">gap</div>
                    </div>
                  </div>
                  
                  {/* Side-by-side bars */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Gambia */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          Gambia
                        </span>
                        <span className="text-sm font-bold text-green-600">{(item.gambia * 10).toFixed(1)}</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-300"
                          style={{ width: `${gambiaPercent}%` }}
                        >
                          {gambiaPercent > 15 && `${(item.gambia * 10).toFixed(1)}`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Regional */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          Regional Avg
                        </span>
                        <span className="text-sm font-bold text-blue-600">{(item.regional * 10).toFixed(1)}</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-300"
                          style={{ width: `${regionalPercent}%` }}
                        >
                          {regionalPercent > 15 && `${(item.regional * 10).toFixed(1)}`}
                        </div>
                      </div>
                    </div>
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


