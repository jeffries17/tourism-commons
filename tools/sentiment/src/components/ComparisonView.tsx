import { useMemo } from 'react';
import { analyzeSentiment, SentimentResult } from '../utils/sentimentAnalysis';
import { detectThemes, ThemeMatch } from '../utils/themeDetection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonViewProps {
  batch1: { reviews: string[]; name: string };
  batch2: { reviews: string[]; name: string };
}

interface BatchStats {
  name: string;
  totalReviews: number;
  avgSentiment: number;
  avgMagnitude: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topThemes: Array<{
    key: string;
    theme: ThemeMatch['theme'];
    totalMentions: number;
    reviewCount: number;
    avgSentiment: number;
  }>;
}

export default function ComparisonView({ batch1, batch2 }: ComparisonViewProps) {
  // Analyze both batches
  const batch1Stats = useMemo(() => {
    const analyses = batch1.reviews.map(review => {
      const sentiment = analyzeSentiment(review);
      const themeResult = detectThemes(review);
      return { sentiment, themes: themeResult.themes };
    });

    const avgSentiment = analyses.reduce((sum, a) => sum + a.sentiment.comparative, 0) / analyses.length;
    const avgMagnitude = analyses.reduce((sum, a) => sum + (a.sentiment.magnitude || 0), 0) / analyses.length;
    
    const sentimentDistribution = {
      positive: analyses.filter(a => a.sentiment.label === 'positive').length,
      neutral: analyses.filter(a => a.sentiment.label === 'neutral').length,
      negative: analyses.filter(a => a.sentiment.label === 'negative').length,
    };

    const themeAggregation: Record<string, {
      theme: ThemeMatch['theme'];
      totalMentions: number;
      reviewCount: number;
      sentimentScores: number[];
    }> = {};

    analyses.forEach(analysis => {
      analysis.themes.forEach(themeMatch => {
        if (!themeAggregation[themeMatch.themeKey]) {
          themeAggregation[themeMatch.themeKey] = {
            theme: themeMatch.theme,
            totalMentions: 0,
            reviewCount: 0,
            sentimentScores: []
          };
        }
        themeAggregation[themeMatch.themeKey].totalMentions += themeMatch.mentions;
        themeAggregation[themeMatch.themeKey].reviewCount += 1;
        if (themeMatch.sentimentScore !== undefined) {
          themeAggregation[themeMatch.themeKey].sentimentScores.push(themeMatch.sentimentScore);
        }
      });
    });

    Object.values(themeAggregation).forEach(agg => {
      if (agg.sentimentScores.length > 0) {
        (agg as any).avgSentiment = agg.sentimentScores.reduce((a, b) => a + b, 0) / agg.sentimentScores.length;
      } else {
        (agg as any).avgSentiment = 0;
      }
    });

    const topThemes = Object.entries(themeAggregation)
      .map(([key, agg]) => ({
        key,
        theme: agg.theme,
        totalMentions: agg.totalMentions,
        reviewCount: agg.reviewCount,
        avgSentiment: (agg as any).avgSentiment
      }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 15);

    return {
      name: batch1.name,
      totalReviews: analyses.length,
      avgSentiment,
      avgMagnitude,
      sentimentDistribution,
      topThemes
    } as BatchStats;
  }, [batch1]);

  const batch2Stats = useMemo(() => {
    const analyses = batch2.reviews.map(review => {
      const sentiment = analyzeSentiment(review);
      const themeResult = detectThemes(review);
      return { sentiment, themes: themeResult.themes };
    });

    const avgSentiment = analyses.reduce((sum, a) => sum + a.sentiment.comparative, 0) / analyses.length;
    const avgMagnitude = analyses.reduce((sum, a) => sum + (a.sentiment.magnitude || 0), 0) / analyses.length;
    
    const sentimentDistribution = {
      positive: analyses.filter(a => a.sentiment.label === 'positive').length,
      neutral: analyses.filter(a => a.sentiment.label === 'neutral').length,
      negative: analyses.filter(a => a.sentiment.label === 'negative').length,
    };

    const themeAggregation: Record<string, {
      theme: ThemeMatch['theme'];
      totalMentions: number;
      reviewCount: number;
      sentimentScores: number[];
    }> = {};

    analyses.forEach(analysis => {
      analysis.themes.forEach(themeMatch => {
        if (!themeAggregation[themeMatch.themeKey]) {
          themeAggregation[themeMatch.themeKey] = {
            theme: themeMatch.theme,
            totalMentions: 0,
            reviewCount: 0,
            sentimentScores: []
          };
        }
        themeAggregation[themeMatch.themeKey].totalMentions += themeMatch.mentions;
        themeAggregation[themeMatch.themeKey].reviewCount += 1;
        if (themeMatch.sentimentScore !== undefined) {
          themeAggregation[themeMatch.themeKey].sentimentScores.push(themeMatch.sentimentScore);
        }
      });
    });

    Object.values(themeAggregation).forEach(agg => {
      if (agg.sentimentScores.length > 0) {
        (agg as any).avgSentiment = agg.sentimentScores.reduce((a, b) => a + b, 0) / agg.sentimentScores.length;
      } else {
        (agg as any).avgSentiment = 0;
      }
    });

    const topThemes = Object.entries(themeAggregation)
      .map(([key, agg]) => ({
        key,
        theme: agg.theme,
        totalMentions: agg.totalMentions,
        reviewCount: agg.reviewCount,
        avgSentiment: (agg as any).avgSentiment
      }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 15);

    return {
      name: batch2.name,
      totalReviews: analyses.length,
      avgSentiment,
      avgMagnitude,
      sentimentDistribution,
      topThemes
    } as BatchStats;
  }, [batch2]);

  // Comparison metrics
  const comparison = useMemo(() => {
    const sentimentDiff = batch2Stats.avgSentiment - batch1Stats.avgSentiment;
    const magnitudeDiff = batch2Stats.avgMagnitude - batch1Stats.avgMagnitude;
    
    // Find common themes
    const batch1ThemeKeys = new Set(batch1Stats.topThemes.map(t => t.key));
    const batch2ThemeKeys = new Set(batch2Stats.topThemes.map(t => t.key));
    const commonThemes = Array.from(batch1ThemeKeys).filter(key => batch2ThemeKeys.has(key));
    
    // Create comparison data for common themes
    const themeComparison = commonThemes.map(key => {
      const b1 = batch1Stats.topThemes.find(t => t.key === key);
      const b2 = batch2Stats.topThemes.find(t => t.key === key);
      return {
        theme: b1?.theme.display_name || '',
        batch1Mentions: b1?.totalMentions || 0,
        batch2Mentions: b2?.totalMentions || 0,
        batch1Sentiment: b1?.avgSentiment || 0,
        batch2Sentiment: b2?.avgSentiment || 0
      };
    }).sort((a, b) => (b.batch1Mentions + b.batch2Mentions) - (a.batch1Mentions + a.batch2Mentions));

    return {
      sentimentDiff,
      magnitudeDiff,
      themeComparison: themeComparison.slice(0, 10)
    };
  }, [batch1Stats, batch2Stats]);

  // Prepare chart data
  const sentimentComparisonData = [
    {
      category: 'Positive',
      [batch1.name]: (batch1Stats.sentimentDistribution.positive / batch1Stats.totalReviews) * 100,
      [batch2.name]: (batch2Stats.sentimentDistribution.positive / batch2Stats.totalReviews) * 100
    },
    {
      category: 'Neutral',
      [batch1.name]: (batch1Stats.sentimentDistribution.neutral / batch1Stats.totalReviews) * 100,
      [batch2.name]: (batch2Stats.sentimentDistribution.neutral / batch2Stats.totalReviews) * 100
    },
    {
      category: 'Negative',
      [batch1.name]: (batch1Stats.sentimentDistribution.negative / batch1Stats.totalReviews) * 100,
      [batch2.name]: (batch2Stats.sentimentDistribution.negative / batch2Stats.totalReviews) * 100
    }
  ];

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">{batch1.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reviews:</span>
                <span className="font-medium">{batch1Stats.totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Sentiment:</span>
                <span className={`font-medium ${batch1Stats.avgSentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {batch1Stats.avgSentiment >= 0 ? '+' : ''}{batch1Stats.avgSentiment.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Magnitude:</span>
                <span className="font-medium">{batch1Stats.avgMagnitude.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">{batch2.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reviews:</span>
                <span className="font-medium">{batch2Stats.totalReviews}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Sentiment:</span>
                <span className={`font-medium ${batch2Stats.avgSentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {batch2Stats.avgSentiment >= 0 ? '+' : ''}{batch2Stats.avgSentiment.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Magnitude:</span>
                <span className="font-medium">{batch2Stats.avgMagnitude.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sentiment Difference:</span>
              <span className={`ml-2 font-bold ${comparison.sentimentDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.sentimentDiff >= 0 ? '+' : ''}{comparison.sentimentDiff.toFixed(3)}
              </span>
              <span className="text-gray-500 ml-1">
                ({comparison.sentimentDiff >= 0 ? batch2.name : batch1.name} is more positive)
              </span>
            </div>
            <div>
              <span className="text-gray-600">Magnitude Difference:</span>
              <span className={`ml-2 font-bold ${comparison.magnitudeDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.magnitudeDiff >= 0 ? '+' : ''}{comparison.magnitudeDiff.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{batch1.name} - Sentiment Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Positive</span>
              <span className="text-xl font-bold text-green-600">
                {batch1Stats.sentimentDistribution.positive}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch1Stats.sentimentDistribution.positive / batch1Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-gray-700">Neutral</span>
              <span className="text-xl font-bold text-yellow-600">
                {batch1Stats.sentimentDistribution.neutral}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch1Stats.sentimentDistribution.neutral / batch1Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-700">Negative</span>
              <span className="text-xl font-bold text-red-600">
                {batch1Stats.sentimentDistribution.negative}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch1Stats.sentimentDistribution.negative / batch1Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{batch2.name} - Sentiment Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Positive</span>
              <span className="text-xl font-bold text-green-600">
                {batch2Stats.sentimentDistribution.positive}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch2Stats.sentimentDistribution.positive / batch2Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-gray-700">Neutral</span>
              <span className="text-xl font-bold text-yellow-600">
                {batch2Stats.sentimentDistribution.neutral}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch2Stats.sentimentDistribution.neutral / batch2Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-700">Negative</span>
              <span className="text-xl font-bold text-red-600">
                {batch2Stats.sentimentDistribution.negative}
              </span>
              <span className="text-sm text-gray-500">
                ({((batch2Stats.sentimentDistribution.negative / batch2Stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Distribution Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sentimentComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend />
            <Bar dataKey={batch1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey={batch2.name} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Theme Comparison */}
      {comparison.themeComparison.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Common Themes Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Theme</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{batch1.name} Mentions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{batch2.name} Mentions</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{batch1.name} Sentiment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{batch2.name} Sentiment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparison.themeComparison.map((theme, idx) => {
                  const mentionDiff = theme.batch2Mentions - theme.batch1Mentions;
                  const sentimentDiff = theme.batch2Sentiment - theme.batch1Sentiment;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {theme.theme}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {theme.batch1Mentions}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {theme.batch2Mentions}
                        {mentionDiff !== 0 && (
                          <span className={`ml-2 text-xs ${mentionDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({mentionDiff > 0 ? '+' : ''}{mentionDiff})
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center font-semibold ${
                        theme.batch1Sentiment >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {theme.batch1Sentiment >= 0 ? '+' : ''}{theme.batch1Sentiment.toFixed(3)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center font-semibold ${
                        theme.batch2Sentiment >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {theme.batch2Sentiment >= 0 ? '+' : ''}{theme.batch2Sentiment.toFixed(3)}
                        {sentimentDiff !== 0 && (
                          <span className={`ml-2 text-xs ${sentimentDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({sentimentDiff > 0 ? '+' : ''}{sentimentDiff.toFixed(3)})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
