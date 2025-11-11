import { useState, useEffect } from 'react';
import { analyzeSentiment, SentimentResult } from '../utils/sentimentAnalysis';
import { detectThemes, getWordFrequency, ThemeMatch, Theme } from '../utils/themeDetection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WordCloud from './WordCloud';
import ThemeKeywordEditor from './ThemeKeywordEditor';
import HighlightedReview from './HighlightedReview';
import themesData from '../utils/defaultThemes.json';

interface ResultsDisplayProps {
  review: string;
}

export default function ResultsDisplay({ review }: ResultsDisplayProps) {
  const [customKeywords, setCustomKeywords] = useState<Record<string, string[]>>({});
  const [wordCloudFilter, setWordCloudFilter] = useState<'all' | 'positive' | 'negative'>('all');
  
  // Load custom keywords from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tourism-sentiment-custom-keywords');
    if (saved) {
      try {
        setCustomKeywords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom keywords:', e);
      }
    }
  }, []);

  // Save custom keywords to localStorage when they change
  useEffect(() => {
    if (Object.keys(customKeywords).length > 0) {
      localStorage.setItem('tourism-sentiment-custom-keywords', JSON.stringify(customKeywords));
    }
  }, [customKeywords]);

  // Apply custom keywords to themes before detection
  const getThemesWithCustomKeywords = () => {
    const themes = { ...themesData.universal };
    Object.keys(customKeywords).forEach(themeKey => {
      if (themes[themeKey]) {
        themes[themeKey] = {
          ...themes[themeKey],
          keywords: customKeywords[themeKey]
        };
      }
    });
    return themes;
  };

  const handleKeywordUpdate = (themeKey: string, updatedKeywords: string[]) => {
    setCustomKeywords(prev => ({
      ...prev,
      [themeKey]: updatedKeywords
    }));
  };

  const sentimentResult: SentimentResult = analyzeSentiment(review);
  
  // Build custom themes object from custom keywords
  const customThemes: Record<string, Theme> = {};
  Object.keys(customKeywords).forEach(themeKey => {
    const defaultTheme = (themesData.universal as Record<string, Theme>)[themeKey];
    if (defaultTheme) {
      customThemes[themeKey] = {
        ...defaultTheme,
        keywords: customKeywords[themeKey]
      };
    }
  });
  
  // Detect themes with custom keywords applied
  const themeResult = detectThemes(review, 'universal', Object.keys(customThemes).length > 0 ? customThemes : undefined);
  const wordFreq = getWordFrequency(review);

  // Build sentiment-based word frequency for word cloud
  // Use the same words that appear in sentiment breakdown
  const buildSentimentWordFreq = () => {
    const sentimentWordCount: Record<string, number> = {};
    const textLower = review.toLowerCase();
    
    // Count all positive words (same source as sentiment breakdown)
    sentimentResult.positive.forEach(word => {
      const wordLower = word.toLowerCase();
      const regex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        sentimentWordCount[wordLower] = (sentimentWordCount[wordLower] || 0) + matches.length;
      }
    });
    
    // Count all negative words (same source as sentiment breakdown)
    sentimentResult.negative.forEach(word => {
      const wordLower = word.toLowerCase();
      const regex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        sentimentWordCount[wordLower] = (sentimentWordCount[wordLower] || 0) + matches.length;
      }
    });
    
    // Convert to array format
    return Object.entries(sentimentWordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  const sentimentWordFreq = buildSentimentWordFreq();
  
  // Build combined word frequency for "All" view - use sentiment words + common words
  const buildAllWordFreq = () => {
    const allWordCount: Record<string, number> = {};
    
    // Add all sentiment words (positive + negative) first
    sentimentWordFreq.forEach(({ text, value }) => {
      allWordCount[text] = value;
    });
    
    // Add other frequent words from general frequency (but prioritize sentiment words)
    wordFreq.forEach(({ text, value }) => {
      const textLower = text.toLowerCase();
      // Only add if not already a sentiment word
      if (!allWordCount[textLower]) {
        allWordCount[textLower] = value;
      }
    });
    
    return Object.entries(allWordCount)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Limit to top 50
  };
  
  const allWordFreq = buildAllWordFreq();

  // Get all universal themes to find non-detected ones
  const allUniversalThemes = themesData.universal as Record<string, Theme>;
  const detectedThemeKeys = new Set(themeResult.themes.map(t => t.themeKey));
  const nonDetectedThemes = Object.entries(allUniversalThemes)
    .filter(([key]) => !detectedThemeKeys.has(key))
    .map(([key, theme]) => ({ key, theme }));

  const sentimentColor = 
    sentimentResult.label === 'positive' ? 'text-green-600' :
    sentimentResult.label === 'negative' ? 'text-red-600' :
    'text-yellow-600';

  const sentimentBgColor = 
    sentimentResult.label === 'positive' ? 'bg-green-50 border-green-200' :
    sentimentResult.label === 'negative' ? 'bg-red-50 border-red-200' :
    'bg-yellow-50 border-yellow-200';

  // Prepare chart data
  const themeMentionData = themeResult.themes
    .slice(0, 10) // Top 10 themes
    .map(t => ({
      name: t.theme.display_name.length > 20 
        ? t.theme.display_name.substring(0, 20) + '...' 
        : t.theme.display_name,
      mentions: t.mentions,
      fullName: t.theme.display_name
    }));

  // Calculate pie chart data correctly
  // The sentiment library returns arrays of positive/negative words found
  // We'll use these counts directly - neutral is implicit (not shown if 0)
  const positiveCount = sentimentResult.positive.length;
  const negativeCount = sentimentResult.negative.length;
  // Note: We don't calculate neutral words explicitly since the sentiment library
  // only identifies positive/negative words, not neutral ones
  const neutralCount = 0; // Set to 0 since we can't reliably determine neutral words
  
  const sentimentPieData = [
    {
      name: 'Positive',
      value: positiveCount,
      color: '#10b981'
    },
    {
      name: 'Neutral',
      value: neutralCount,
      color: '#eab308'
    },
    {
      name: 'Negative',
      value: negativeCount,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0); // Only show segments with values

  return (
    <div className="space-y-6">
      {/* Overall Sentiment Card */}
      <div className={`${sentimentBgColor} border-2 rounded-lg p-6`}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Sentiment</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Sentiment Score</p>
            <p className={`text-3xl font-bold ${sentimentColor}`}>
              {sentimentResult.comparative >= 0 ? '+' : ''}{sentimentResult.comparative.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500">(-1 to +1 scale)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Magnitude</p>
            <p className="text-3xl font-bold text-gray-900">
              {sentimentResult.magnitude?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500">(0 to 5 scale)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Label</p>
            <p className={`text-2xl font-bold ${sentimentColor} capitalize`}>
              {sentimentResult.label}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Word Count</p>
            <p className="text-2xl font-bold text-gray-900">
              {review.split(/\s+/).length}
            </p>
          </div>
        </div>
        
        {/* Score Range Visualization */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Score Range</p>
          <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg">
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white font-medium">
              <span>-1</span>
              <span>-0.25</span>
              <span>0</span>
              <span>+0.25</span>
              <span>+1</span>
            </div>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-black"
              style={{
                left: `${((sentimentResult.comparative + 1) / 2) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                {sentimentResult.comparative >= 0 ? '+' : ''}{sentimentResult.comparative.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted Review and Word Cloud Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlighted Review */}
        <HighlightedReview review={review} sentimentResult={sentimentResult} />

        {/* Word Cloud with Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Word Cloud</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setWordCloudFilter('all')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  wordCloudFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setWordCloudFilter('positive')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  wordCloudFilter === 'positive'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setWordCloudFilter('negative')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  wordCloudFilter === 'negative'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Negative
              </button>
            </div>
          </div>
          <WordCloud
            words={wordCloudFilter === 'all' ? allWordFreq : sentimentWordFreq}
            sentimentFilter={wordCloudFilter}
            positiveWords={sentimentResult.positive}
            negativeWords={sentimentResult.negative}
          />
        </div>
      </div>

      {/* Detected Themes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Detected Themes ({themeResult.themes.length})
        </h3>
        
        {themeResult.themes.length > 0 ? (
          <>
            {/* Top Themes Bar Chart */}
            {themeMentionData.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Theme Mentions</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={themeMentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Mentions']}
                      labelFormatter={(label, payload) => 
                        payload?.[0]?.payload?.fullName || label
                      }
                    />
                    <Bar dataKey="mentions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Theme Details List with Sentiment Scores */}
            <div className="space-y-3">
              {themeResult.themes.slice(0, 10).map((themeMatch) => {
                const themeSentimentColor = 
                  themeMatch.sentiment === 'positive' ? 'text-green-600' :
                  themeMatch.sentiment === 'negative' ? 'text-red-600' :
                  'text-yellow-600';
                const themeSentimentBg = 
                  themeMatch.sentiment === 'positive' ? 'bg-green-50' :
                  themeMatch.sentiment === 'negative' ? 'bg-red-50' :
                  'bg-yellow-50';
                
                return (
                  <div 
                    key={themeMatch.themeKey}
                    className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 ${themeSentimentBg}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {themeMatch.theme.display_name}
                      </h4>
                      <div className="flex gap-2">
                        {themeMatch.sentimentScore !== undefined && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${themeSentimentColor} bg-white border`}>
                            Score: {themeMatch.sentimentScore >= 0 ? '+' : ''}{themeMatch.sentimentScore.toFixed(3)}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {themeMatch.mentions} mention{themeMatch.mentions !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      {themeMatch.magnitude !== undefined && (
                        <div>
                          <p className="text-xs text-gray-600">Magnitude</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {themeMatch.magnitude.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {themeMatch.sentiment && (
                        <div>
                          <p className="text-xs text-gray-600">Sentiment</p>
                          <p className={`text-lg font-semibold capitalize ${themeSentimentColor}`}>
                            {themeMatch.sentiment}
                          </p>
                        </div>
                      )}
                    </div>
                    {themeMatch.theme.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {themeMatch.theme.description}
                      </p>
                    )}
                    {themeMatch.sentences.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Example sentences:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {themeMatch.sentences.map((sentence, idx) => (
                            <li key={idx} className="text-sm text-gray-700 italic">
                              "{sentence.substring(0, 100)}{sentence.length > 100 ? '...' : ''}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Theme Keyword Editor */}
                    <ThemeKeywordEditor
                      theme={themeMatch.theme}
                      themeKey={themeMatch.themeKey}
                      onUpdate={(themeKey, updatedKeywords) => {
                        handleKeywordUpdate(themeKey, updatedKeywords);
                        // Force re-analysis by updating state
                        // React will re-render and detectThemes will use new keywords
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-gray-500">No themes detected in this review.</p>
        )}
      </div>

      {/* Non-Detected Themes */}
      {nonDetectedThemes.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Themes Not Detected ({nonDetectedThemes.length})
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    These themes weren't detected because none of their keywords appeared in your review
                  </p>
                </div>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </div>
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonDetectedThemes.map(({ key, theme }) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                      {theme.display_name}
                    </h4>
                    {theme.description && (
                      <p className="text-xs text-gray-600 mb-2">{theme.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {theme.keywords.slice(0, 6).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                      {theme.keywords.length > 6 && (
                        <span className="px-2 py-0.5 bg-gray-300 text-gray-700 rounded text-xs">
                          +{theme.keywords.length - 6} more
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      💡 None of these keywords were found in your review
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Core Sentences Analysis */}
      {sentimentResult.sentences && sentimentResult.sentences.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Core Sentences</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Magnitude
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sentimentResult.sentences.map((sentence, idx) => {
                  const sentColor = 
                    sentence.sentiment === 'positive' ? 'text-green-600' :
                    sentence.sentiment === 'negative' ? 'text-red-600' :
                    'text-yellow-600';
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        "{sentence.text}"
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {Math.abs(sentence.score).toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-sm font-semibold ${sentColor}`}>
                        {sentence.score >= 0 ? '+' : ''}{sentence.score.toFixed(3)}
                        <span className="ml-2 text-xs capitalize">({sentence.sentiment})</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sentiment Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Word Classification</h4>
            <ResponsiveContainer width="100%" height={200}>
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
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Positive Words</h4>
            <div className="flex flex-wrap gap-2">
              {sentimentResult.positive.slice(0, 15).map((word, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-4">Negative Words</h4>
            <div className="flex flex-wrap gap-2">
              {sentimentResult.negative.slice(0, 15).map((word, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Tips for Better Analysis</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="font-semibold mr-2">1.</span>
            <p>
              <strong>Look for contextual negatives:</strong> Phrases like "minus", "eaten up", or "not good" 
              indicate negative sentiment even if individual words seem neutral.
            </p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">2.</span>
            <p>
              <strong>Check per-theme sentiment:</strong> A review can be overall positive but have negative 
              aspects in specific themes (like facilities or value).
            </p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">3.</span>
            <p>
              <strong>Magnitude matters:</strong> A score of +0.8 indicates stronger positive sentiment than +0.3. 
              Use magnitude to understand sentiment strength.
            </p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">4.</span>
            <p>
              <strong>Analyze sentences individually:</strong> Mixed reviews contain both positive and negative 
              sentences. Check the "Core Sentences" section to see sentiment per sentence.
            </p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">5.</span>
            <p>
              <strong>Watch for negation:</strong> Words like "not", "no", "never", "can't" can flip sentiment. 
              The tool now detects phrases like "not good" and "don't recommend".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

