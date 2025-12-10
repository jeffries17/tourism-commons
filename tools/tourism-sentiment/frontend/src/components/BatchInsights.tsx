import { useMemo, useState } from 'react';
import { analyzeSentiment, SentimentResult } from '../utils/sentimentAnalysis';
import { detectThemes, ThemeMatch } from '../utils/themeDetection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface BatchInsightsProps {
  reviews: string[];
  onExport?: () => void;
  onReviewClick?: (index: number) => void;
}

interface ReviewAnalysis {
  review: string;
  sentiment: SentimentResult;
  themes: ThemeMatch[];
  index: number;
}

export default function BatchInsights({ reviews, onExport, onReviewClick }: BatchInsightsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [showReviewList, setShowReviewList] = useState(false);

  // Analyze all reviews
  const analyses = useMemo(() => {
    return reviews.map((review, index) => {
      const sentiment = analyzeSentiment(review);
      const themeResult = detectThemes(review);
      return {
        review,
        sentiment,
        themes: themeResult.themes,
        index
      } as ReviewAnalysis;
    });
  }, [reviews]);

  // Filter reviews based on search and sentiment
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      const matchesSearch = !searchQuery || 
        analysis.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.themes.some(t => t.theme.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSentiment = sentimentFilter === 'all' || analysis.sentiment.label === sentimentFilter;
      return matchesSearch && matchesSentiment;
    });
  }, [analyses, searchQuery, sentimentFilter]);

  // Aggregate statistics (use filtered analyses if search is active, otherwise all)
  const stats = useMemo(() => {
    const reviewsToAnalyze = searchQuery || sentimentFilter !== 'all' ? filteredAnalyses : analyses;
    const totalReviews = reviewsToAnalyze.length;
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        avgSentiment: 0,
        avgMagnitude: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        topThemes: [],
        sentimentTrend: [],
        mostPositive: [],
        mostNegative: []
      };
    }

    const avgSentiment = reviewsToAnalyze.reduce((sum, a) => sum + a.sentiment.comparative, 0) / totalReviews;
    const avgMagnitude = reviewsToAnalyze.reduce((sum, a) => sum + (a.sentiment.magnitude || 0), 0) / totalReviews;
    
    const sentimentDistribution = {
      positive: reviewsToAnalyze.filter(a => a.sentiment.label === 'positive').length,
      neutral: reviewsToAnalyze.filter(a => a.sentiment.label === 'neutral').length,
      negative: reviewsToAnalyze.filter(a => a.sentiment.label === 'negative').length,
    };

    // Aggregate themes across all reviews
    const themeAggregation: Record<string, {
      theme: ThemeMatch['theme'];
      totalMentions: number;
      reviewCount: number;
      avgSentiment: number;
      sentimentScores: number[];
    }> = {};

    reviewsToAnalyze.forEach(analysis => {
      analysis.themes.forEach(themeMatch => {
        if (!themeAggregation[themeMatch.themeKey]) {
          themeAggregation[themeMatch.themeKey] = {
            theme: themeMatch.theme,
            totalMentions: 0,
            reviewCount: 0,
            avgSentiment: 0,
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

    // Calculate average sentiment per theme
    Object.values(themeAggregation).forEach(agg => {
      if (agg.sentimentScores.length > 0) {
        agg.avgSentiment = agg.sentimentScores.reduce((a, b) => a + b, 0) / agg.sentimentScores.length;
      }
    });

    // Top themes by mentions
    const topThemes = Object.entries(themeAggregation)
      .map(([key, agg]) => ({
        key,
        ...agg
      }))
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 15);

    // Sentiment distribution over reviews (for trend analysis)
    const sentimentTrend = reviewsToAnalyze.map((a, idx) => ({
      review: idx + 1,
      sentiment: a.sentiment.comparative,
      label: a.sentiment.label
    }));

    // Most positive and negative reviews
    const sortedBySentiment = [...reviewsToAnalyze].sort((a, b) => b.sentiment.comparative - a.sentiment.comparative);
    const mostPositive = sortedBySentiment.slice(0, 3);
    const mostNegative = sortedBySentiment.slice(-3).reverse();

    return {
      totalReviews,
      avgSentiment,
      avgMagnitude,
      sentimentDistribution,
      topThemes,
      sentimentTrend,
      mostPositive,
      mostNegative
    };
  }, [analyses, filteredAnalyses, searchQuery, sentimentFilter]);

  // Prepare chart data
  const sentimentPieData = [
    { name: 'Positive', value: stats.sentimentDistribution.positive, color: '#10b981' },
    { name: 'Neutral', value: stats.sentimentDistribution.neutral, color: '#eab308' },
    { name: 'Negative', value: stats.sentimentDistribution.negative, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const themeChartData = stats.topThemes.slice(0, 10).map(t => ({
    name: t.theme.display_name.length > 20 
      ? t.theme.display_name.substring(0, 20) + '...' 
      : t.theme.display_name,
    mentions: t.totalMentions,
    reviews: t.reviewCount,
    avgSentiment: t.avgSentiment,
    fullName: t.theme.display_name
  }));

  const handleExport = () => {
    const exportData = {
      summary: {
        totalReviews: stats.totalReviews,
        averageSentiment: stats.avgSentiment,
        averageMagnitude: stats.avgMagnitude,
        sentimentDistribution: stats.sentimentDistribution
      },
      topThemes: stats.topThemes.map(t => ({
        theme: t.theme.display_name,
        totalMentions: t.totalMentions,
        reviewCount: t.reviewCount,
        averageSentiment: t.avgSentiment
      })),
      reviews: analyses.map(a => ({
        index: a.index + 1,
        sentiment: a.sentiment.comparative,
        label: a.sentiment.label,
        magnitude: a.sentiment.magnitude,
        themes: a.themes.map(t => t.theme.display_name)
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExport) onExport();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews or themes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <button
              onClick={() => setShowReviewList(!showReviewList)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {showReviewList ? 'Hide' : 'Show'} Review List ({filteredAnalyses.length})
            </button>
          </div>
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredAnalyses.length} review{filteredAnalyses.length !== 1 ? 's' : ''} matching your search
          </div>
        )}
      </div>

      {/* Review List */}
      {showReviewList && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Filtered Reviews</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAnalyses.length > 0 ? (
              filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.index}
                  className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    analysis.sentiment.label === 'positive' ? 'border-green-200 bg-green-50' :
                    analysis.sentiment.label === 'negative' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}
                  onClick={() => onReviewClick?.(analysis.index)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-600">Review #{analysis.index + 1}</span>
                    <span className={`text-sm font-bold ${
                      analysis.sentiment.comparative >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analysis.sentiment.comparative >= 0 ? '+' : ''}{analysis.sentiment.comparative.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {analysis.review}
                  </p>
                  {analysis.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {analysis.themes.slice(0, 5).map((theme, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {theme.theme.display_name}
                        </span>
                      ))}
                      {analysis.themes.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{analysis.themes.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews match your filters</p>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Reviews</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Sentiment</h3>
          <p className={`text-3xl font-bold ${stats.avgSentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.avgSentiment >= 0 ? '+' : ''}{stats.avgSentiment.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500 mt-1">(-1 to +1 scale)</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Magnitude</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.avgMagnitude.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">(0 to 5 scale)</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Top Themes</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.topThemes.length}</p>
          <p className="text-xs text-gray-500 mt-1">Unique themes detected</p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Sentiment Distribution</h3>
          {onExport && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              📥 Export Insights
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Positive</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.sentimentDistribution.positive}
              </span>
              <span className="text-sm text-gray-500">
                ({((stats.sentimentDistribution.positive / stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-gray-700">Neutral</span>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.sentimentDistribution.neutral}
              </span>
              <span className="text-sm text-gray-500">
                ({((stats.sentimentDistribution.neutral / stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-700">Negative</span>
              <span className="text-2xl font-bold text-red-600">
                {stats.sentimentDistribution.negative}
              </span>
              <span className="text-sm text-gray-500">
                ({((stats.sentimentDistribution.negative / stats.totalReviews) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Trend */}
      {stats.sentimentTrend.length > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Trend Across Reviews</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="review" />
              <YAxis domain={[-1, 1]} />
              <Tooltip 
                formatter={(value: number) => [value >= 0 ? '+' : '' + value.toFixed(3), 'Sentiment']}
                labelFormatter={(label) => `Review ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Themes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Themes Across All Reviews</h3>
        {themeChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={themeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'mentions') return [value, 'Total Mentions'];
                    if (name === 'reviews') return [value, 'Reviews Mentioned'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => 
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="mentions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Theme Details Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Theme</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Mentions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Sentiment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topThemes.slice(0, 15).map((theme) => (
                    <tr key={theme.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {theme.theme.display_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {theme.totalMentions}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {theme.reviewCount} ({((theme.reviewCount / stats.totalReviews) * 100).toFixed(1)}%)
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${
                        theme.avgSentiment >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {theme.avgSentiment >= 0 ? '+' : ''}{theme.avgSentiment.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No themes detected across reviews.</p>
        )}
      </div>

      {/* Most Positive & Negative Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Most Positive Reviews</h3>
          <div className="space-y-3">
            {stats.mostPositive.map((analysis, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">Review #{analysis.index + 1}</span>
                  <span className="text-lg font-bold text-green-600">
                    {analysis.sentiment.comparative >= 0 ? '+' : ''}{analysis.sentiment.comparative.toFixed(3)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {analysis.review.substring(0, 200)}{analysis.review.length > 200 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Most Negative Reviews</h3>
          <div className="space-y-3">
            {stats.mostNegative.map((analysis, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600">Review #{analysis.index + 1}</span>
                  <span className="text-lg font-bold text-red-600">
                    {analysis.sentiment.comparative >= 0 ? '+' : ''}{analysis.sentiment.comparative.toFixed(3)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {analysis.review.substring(0, 200)}{analysis.review.length > 200 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
