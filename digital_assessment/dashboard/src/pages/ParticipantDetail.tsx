import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useParticipantDetail, useParticipantOpportunities } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCategoryDescription } from '../config/categoryDescriptions';
import TechnicalHealthBadge from '../components/common/TechnicalHealthBadge';
import { findMatchingSentimentStakeholder } from '../utils/nameMatching';
import { getThemeDisplayName, getThemeIcon, getThemeSentimentColor, UNIFIED_THEMES } from '../constants/themes';
import { useAuth } from '../contexts/AuthContext';

export default function ParticipantDetail() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');
  const { user, isAdmin } = useAuth();
  
  const { data: details, isLoading: loadingDetails, error: detailsError } = useParticipantDetail(decodedName);
  const { data: opportunities, isLoading: loadingOpportunities } = useParticipantOpportunities(decodedName);
  
  // Check access - participants can only view their own page
  const hasAccess = isAdmin || (user && user.organizationName === decodedName);
  
  // If no access, show access denied
  if (!hasAccess && !loadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You can only view your own organization's data.
          </p>
          <Link 
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Load sentiment data
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [sectorAverages, setSectorAverages] = useState<any>(null);
  const [allSentimentData, setAllSentimentData] = useState<any[]>([]);
  
  useEffect(() => {
    const basePath = import.meta.env.PROD ? '/gambia-itc' : '';
    
    // Load all three sentiment datasets (creative industries, tour operators, regional)
    Promise.all([
      fetch(`${basePath}/sentiment_data.json`).then(res => res.json()),
      fetch(`${basePath}/tour_operators_sentiment.json`).then(res => res.json()),
      fetch(`${basePath}/regional_sentiment.json`).then(res => res.json())
    ])
      .then(([creativeData, operatorData, regionalData]) => {
        // Combine all stakeholder data
        const allStakeholders = [
          ...(creativeData.stakeholder_data || []),
          ...(operatorData.stakeholder_data || []),
          ...(regionalData.stakeholder_data || [])
        ];
        
        setAllSentimentData(allStakeholders);
        
        // Use fuzzy matching to find the best matching stakeholder
        const stakeholder = findMatchingSentimentStakeholder(
          decodedName,
          allStakeholders
        );
        setSentimentData(stakeholder);
      })
      .catch(err => console.error('Failed to load sentiment data:', err));
  }, [decodedName]);
  
  // Calculate sector averages when we have both participant data and sentiment data
  useEffect(() => {
    if (!details?.profile?.sector || allSentimentData.length === 0) return;
    
    // Match by source and sector:
    // - Tour Operators: compare against all tour operators (source: "gambia_operators")
    // - Creative Industries: compare against their specific sector (e.g., Fashion & Design vs Fashion & Design)
    const isTourOperator = details.profile.sector === 'Tour Operator';
    const sectorStakeholders = allSentimentData.filter((s: any) => {
      if (isTourOperator) {
        // All tour operators together
        return s.source === 'gambia_operators' && s.total_reviews > 0;
      } else {
        // Creative industries: match by specific sector
        return s.source === 'gambia_creative' && s.sector === details.profile.sector && s.total_reviews > 0;
      }
    });
    
    const averages: Record<string, number> = {};
    UNIFIED_THEMES.forEach(theme => {
      const scores: number[] = [];
      sectorStakeholders.forEach((s: any) => {
        if (s.theme_scores && s.theme_scores[theme] && s.theme_scores[theme].mentions > 0) {
          scores.push(s.theme_scores[theme].score);
        }
      });
      if (scores.length > 0) {
        averages[theme] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });
    setSectorAverages(averages);
  }, [details?.profile?.sector, allSentimentData]);

  if (detailsError) {
    return (
      <div className="space-y-6">
        <Link to="/participants" className="text-primary hover:underline">
          ← Back to Participants
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error loading participant: {(detailsError as Error).message}</p>
        </div>
      </div>
    );
  }

  const participant = details?.profile;
  const externalBreakdown = details?.external?.breakdown || [];
  const getMaturityColor = (maturity: string) => {
    const colors: Record<string, string> = {
      'Absent': 'bg-gray-200 text-gray-800',
      'Emerging': 'bg-yellow-200 text-yellow-800',
      'Intermediate': 'bg-blue-200 text-blue-800',
      'Advanced': 'bg-green-200 text-green-800',
      'Expert': 'bg-purple-200 text-purple-800'
    };
    return colors[maturity] || 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/participants" className="text-primary hover:underline">
          ← Back to Participants
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          {decodedName}
        </h1>
        {loadingDetails ? (
          <p className="text-gray-600">Loading participant details...</p>
        ) : participant && (
          <div className="flex gap-4 items-center mt-4">
            <span className="text-sm text-gray-600">Sector: <strong>{participant.sector}</strong></span>
            <span className="text-sm text-gray-600">Region: <strong>{participant.region || 'N/A'}</strong></span>
          </div>
        )}
      </div>

      {/* Scores Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Assessment Scores
        </h2>
        {loadingDetails ? (
          <p className="text-gray-600">Loading scores...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="relative p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <p className="text-sm font-medium text-blue-100 mb-1">Overall Score</p>
                <p className="text-4xl font-bold">{participant?.scores?.combined}%</p>
              </div>
              <div className="relative p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <p className="text-sm font-medium text-purple-100 mb-1">External Score</p>
                <p className="text-4xl font-bold">{participant?.scores?.externalTotal}%</p>
              </div>
              <div className="relative p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <p className="text-sm font-medium text-green-100 mb-1">Survey Score</p>
                <p className="text-4xl font-bold">{participant?.scores?.surveyTotal || 0}%</p>
              </div>
              <div className="relative p-5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <p className="text-sm font-medium text-gray-300 mb-1">Maturity Level</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getMaturityColor(participant?.maturity || '')}`}>
                  {participant?.maturity}
                </span>
              </div>
            </div>

                {/* Survey Assessment Breakdown */}
                {participant?.scores?.surveyTotal && participant?.scores?.surveyTotal > 0 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Survey Assessment: {participant.scores.surveyTotal}/30</h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getMaturityColor(participant.insights?.surveyTier || '')}`}>
                        {participant.insights?.surveyTier || 'N/A'}
                      </span>
                    </div>
                    
                    {participant.insights?.surveyDescription && (
                      <p className="text-sm text-gray-700 italic mb-4 leading-relaxed">
                        "{participant.insights.surveyDescription}"
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-gray-600 mb-2">Digital Foundation</p>
                        <p className="text-3xl font-bold text-green-600">
                          {participant.scores.surveyFoundation || 0}<span className="text-xl text-gray-400">/10</span>
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${((participant.scores.surveyFoundation || 0) / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Current presence & platforms</p>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-gray-600 mb-2">Digital Capability</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {participant.scores.surveyCapability || 0}<span className="text-xl text-gray-400">/10</span>
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((participant.scores.surveyCapability || 0) / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Skills & infrastructure</p>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-gray-600 mb-2">Growth Readiness</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {participant.scores.surveyGrowth || 0}<span className="text-xl text-gray-400">/10</span>
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${((participant.scores.surveyGrowth || 0) / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Investment & knowledge</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Category Scores */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">External Assessment Category Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {externalBreakdown.map((cat: any) => (
                      <div key={cat.key} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <p className="text-base font-semibold text-gray-900 mb-1">{cat.label}</p>
                        <p className="text-3xl font-bold text-primary mb-2">
                          {cat.score}<span className="text-xl text-gray-500">/{cat.max}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Sector avg: {cat.sectorAvg}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {getCategoryDescription(cat.key, participant?.sector || '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Breakdown */}
                <h3 className="text-lg font-semibold mb-4 mt-6">Category Breakdown vs Sector Average</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={externalBreakdown.map((cat: any) => ({
                        name: cat.label,
                        'Participant Score': cat.score,
                        'Sector Avg': cat.sectorAvg,
                        max: cat.max
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      barGap={8}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        label={{ value: 'Score (out of 10)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 10]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                        formatter={(value: any) => [value.toFixed(1), '']}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      <Bar dataKey="Participant Score" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={30} />
                      <Bar dataKey="Sector Avg" fill="#94a3b8" radius={[8, 8, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
          </>
        )}
      </div>

          {/* Digital Presence & Links */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-heading font-semibold mb-4">
              Digital Presence & Links
            </h2>
            {loadingDetails ? (
              <p className="text-gray-600">Loading digital presence data...</p>
            ) : (
              <>
                {/* Technical Health - Show if website exists */}
                {participant?.websiteUrl && (
                  <div className="mb-6">
                    <TechnicalHealthBadge stakeholderName={decodedName} compact={false} />
                  </div>
                )}

                {/* URLs */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">Online Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Website */}
                    {participant?.websiteUrl ? (
                      <a href={participant.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-l-4 border-blue-500">
                        <span className="text-2xl">🌐</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Website</p>
                          <p className="text-xs text-blue-600 truncate hover:underline">{participant.websiteUrl}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">🌐</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">Website</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}

                    {/* Facebook */}
                    {participant?.facebookUrl ? (
                      <a href={participant.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-l-4 border-blue-600">
                        <span className="text-2xl">📘</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Facebook</p>
                          <p className="text-xs text-blue-600 truncate hover:underline">{participant.facebookUrl}</p>
                          {participant.facebookFollowers > 0 && (
                            <p className="text-xs text-gray-600 font-medium">{participant.facebookFollowers.toLocaleString()} followers</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">📘</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">Facebook</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}

                    {/* Instagram */}
                    {participant?.instagramUrl ? (
                      <a href={participant.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors border-l-4 border-pink-500">
                        <span className="text-2xl">📷</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Instagram</p>
                          <p className="text-xs text-pink-600 truncate hover:underline">{participant.instagramUrl}</p>
                          {participant.instagramFollowers > 0 && (
                            <p className="text-xs text-gray-600 font-medium">{participant.instagramFollowers.toLocaleString()} followers</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">📷</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">Instagram</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}

                    {/* TripAdvisor */}
                    {participant?.tripadvisorUrl ? (
                      <a href={participant.tripadvisorUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border-l-4 border-green-600">
                        <span className="text-2xl">✈️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">TripAdvisor</p>
                          <p className="text-xs text-green-600 truncate hover:underline">{participant.tripadvisorUrl}</p>
                          {participant.tripadvisorReviews > 0 && (
                            <p className="text-xs text-gray-600 font-medium">{participant.tripadvisorReviews.toLocaleString()} reviews</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">✈️</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">TripAdvisor</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}

                    {/* YouTube */}
                    {participant?.youtubeUrl ? (
                      <a href={participant.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-l-4 border-red-600">
                        <span className="text-2xl">📺</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">YouTube</p>
                          <p className="text-xs text-red-600 truncate hover:underline">{participant.youtubeUrl}</p>
                          {participant.youtubeSubscribers > 0 && (
                            <p className="text-xs text-gray-600 font-medium">{participant.youtubeSubscribers.toLocaleString()} subscribers</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">📺</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">YouTube</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}

                    {/* TikTok */}
                    {participant?.tiktokUrl ? (
                      <a href={participant.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-l-4 border-purple-600">
                        <span className="text-2xl">🎵</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">TikTok</p>
                          <p className="text-xs text-purple-600 truncate hover:underline">{participant.tiktokUrl}</p>
                          {participant.tiktokFollowers > 0 && (
                            <p className="text-xs text-gray-600 font-medium">{participant.tiktokFollowers.toLocaleString()} followers</p>
                          )}
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border-l-4 border-gray-300 opacity-50">
                        <span className="text-2xl grayscale">🎵</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">TikTok</p>
                          <p className="text-xs text-gray-400">Not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

            {/* Social Metrics Summary */}
            {(participant?.facebookFollowers > 0 || participant?.instagramFollowers > 0 || participant?.tripadvisorReviews > 0 || participant?.youtubeSubscribers > 0 || participant?.tiktokFollowers > 0) && (
              <div>
                <h3 className="text-md font-semibold mb-3">Total Social Reach</h3>
                <div className="flex gap-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-700">Total Followers, Subscribers & Reviews</p>
                    <p className="text-3xl font-bold text-indigo-900 mt-1">
                      {((participant.facebookFollowers || 0) + (participant.instagramFollowers || 0) + (participant.tripadvisorReviews || 0) + (participant.youtubeSubscribers || 0) + (participant.tiktokFollowers || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sentiment Analysis Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
          <span>💬</span>
          Visitor Reviews & Sentiment
        </h2>
        
        {sentimentData && sentimentData.total_reviews > 0 ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-700">Total Reviews</div>
                <div className="text-3xl font-bold text-blue-900 mt-1">{sentimentData.total_reviews}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm font-medium text-yellow-700">Average Rating</div>
                <div className="text-3xl font-bold text-yellow-900 mt-1">{sentimentData.average_rating.toFixed(1)} ⭐</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-700">Sentiment Score</div>
                <div className="text-3xl font-bold text-green-900 mt-1">
                  {sentimentData.overall_sentiment >= 0 ? '+' : ''}{sentimentData.overall_sentiment.toFixed(2)}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {sentimentData.overall_sentiment >= 0.6 ? 'Very Positive' : 
                   sentimentData.overall_sentiment >= 0.3 ? 'Positive' : 
                   sentimentData.overall_sentiment >= 0 ? 'Neutral' : 'Negative'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-700">Positive Reviews</div>
                <div className="text-3xl font-bold text-purple-900 mt-1">{sentimentData.positive_rate.toFixed(0)}%</div>
              </div>
            </div>

            {/* Theme Breakdown */}
            {sentimentData.theme_scores && Object.keys(sentimentData.theme_scores).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🎨</span>
                  {decodedName} Perception
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Breakdown of visitor feedback across themes, based on {sentimentData.total_reviews} reviews. 
                  Scores range from -1 (negative) to +1 (positive), compared against {participant?.sector || 'sector'} average.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {UNIFIED_THEMES.map(themeKey => {
                    const themeData = sentimentData.theme_scores[themeKey];
                    if (!themeData || themeData.mentions === 0) return null;
                    
                    const score = themeData.score;
                    const mentions = themeData.mentions;
                    const sectorAvg = sectorAverages?.[themeKey];
                    const distribution = themeData.distribution || { positive: 0, neutral: 0, negative: 0 };
                    
                    return (
                      <div key={themeKey} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getThemeIcon(themeKey)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {getThemeDisplayName(themeKey)}
                            </h4>
                            <p className="text-xs text-gray-600">{mentions} mentions</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className={`text-2xl font-bold ${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {score >= 0 ? '+' : ''}{score.toFixed(2)}
                          </div>
                          {sectorAvg !== undefined && (
                            <div className={`text-xs mt-1 ${score >= sectorAvg ? 'text-gray-600' : 'text-red-600'}`}>
                              ({score >= sectorAvg ? '+' : ''}{(score - sectorAvg).toFixed(2)} {score >= sectorAvg ? '>' : '<'} {participant?.sector || 'sector'})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 text-xs">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            {distribution.positive} +
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {distribution.neutral} ~
                          </span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            {distribution.negative} −
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Critical Areas */}
            {sentimentData.critical_areas && sentimentData.critical_areas.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <span>🚨</span>
                  Critical Areas for Improvement
                </h3>
                <div className="space-y-4">
                  {sentimentData.critical_areas.slice(0, 3).map((area: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{area.theme}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          area.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {area.priority} priority
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>Sentiment: {area.sentiment_score.toFixed(2)}</span>
                        <span>Mentions: {area.mention_count}</span>
                      </div>
                      {area.quotes && area.quotes.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-gray-700">Example feedback:</div>
                          {area.quotes.slice(0, 2).map((quote: string, qidx: number) => (
                            <blockquote key={qidx} className="text-sm text-gray-700 italic border-l-4 border-red-300 pl-3 py-1">
                              "{quote.replace(/&#39;/g, "'").substring(0, 150)}..."
                            </blockquote>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Management Response Opportunity */}
            {sentimentData.management_response && sentimentData.management_response.response_rate === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <span>💡</span>
                  Engagement Opportunity
                </h3>
                <p className="text-yellow-800 mb-3">
                  <strong>{sentimentData.management_response.gap_opportunity} reviews</strong> without management response!
                  Responding to reviews can improve visitor satisfaction and demonstrate your commitment to quality.
                </p>
                <div className="flex gap-2">
                  <a
                    href={participant?.tripadvisorUrl || `https://www.tripadvisor.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    Start Responding on TripAdvisor →
                  </a>
                </div>
              </div>
            )}

            {/* View All Reviews Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/reviews-sentiment"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full Sentiment Analysis for All Stakeholders →
              </Link>
            </div>
          </div>
        ) : (
          /* Placeholder for participants without reviews */
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Review Data Available</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              This stakeholder doesn't have TripAdvisor reviews in our dataset yet. Collecting visitor feedback
              is crucial for understanding visitor experience and improving service quality.
            </p>
            <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left">
              <h4 className="font-semibold text-gray-900 mb-3">📈 Benefits of Collecting Reviews:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Understand visitor needs:</strong> Get direct feedback on what's working and what needs improvement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Build credibility:</strong> Reviews and ratings increase trust for potential visitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Improve visibility:</strong> Active review engagement boosts online presence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Track progress:</strong> Monitor sentiment trends over time to measure improvements</span>
                </li>
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 Get Started:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. Claim your business on <a href="https://www.tripadvisor.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TripAdvisor</a></p>
                  <p>2. Encourage visitors to leave reviews after their experience</p>
                  <p>3. Respond to reviews to show you value feedback</p>
                  <p>4. Monitor and improve based on visitor insights</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Recommendations
        </h2>
        {loadingOpportunities ? (
          <p className="text-gray-600">Loading recommendations...</p>
        ) : opportunities?.recommendations ? (
          <div className="space-y-4">
            {opportunities.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <h4 className="font-semibold text-gray-900">{rec.category || rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description || rec.recommendation || rec.action}</p>
                {rec.nextSteps && rec.nextSteps.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {rec.nextSteps.map((step: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">• {step}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recommendations available yet</p>
        )}
      </div>
    </div>
  );
}

