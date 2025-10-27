import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  source?: string;
  country?: string;
  tripadvisor_url?: string;
}

interface SentimentData {
  summary: any;
  stakeholder_data: StakeholderSentiment[];
  metadata: {
    title: string;
    total_stakeholders: number;
    total_reviews: number;
    generated_at: string;
  };
}

// Theme icons, French names, and descriptions
const THEME_CONFIG: Record<string, { icon: string; name: string; color: string; description: string }> = {
  cultural_heritage: { 
    icon: '🏛️', 
    name: 'Patrimoine Culturel', 
    color: '#8b5cf6',
    description: 'Qualité historique, autenticité culturelle, et préservation du patrimoine'
  },
  service_staff: { 
    icon: '👥', 
    name: 'Service & Personnel', 
    color: '#3b82f6',
    description: 'Amitié, professionnalisme et efficacité du personnel'
  },
  facilities_infrastructure: { 
    icon: '🏗️', 
    name: 'Infrastructure', 
    color: '#64748b',
    description: 'Qualité des installations, équipements, et commodités'
  },
  accessibility_transport: { 
    icon: '🚗', 
    name: 'Accessibilité', 
    color: '#06b6d4',
    description: 'Facilité d\'accès, transport, et mobilité réduite'
  },
  value_money: { 
    icon: '💰', 
    name: 'Rapport Qualité-Prix', 
    color: '#10b981',
    description: 'Prix du billet et valeur perçue'
  },
  safety_security: { 
    icon: '🔒', 
    name: 'Sécurité', 
    color: '#f59e0b',
    description: 'Sensation de sécurité et bien-être des visiteurs'
  },
  educational_value: { 
    icon: '📚', 
    name: 'Valeur Éducative', 
    color: '#ec4899',
    description: 'Opportunités d\'apprentissage et informations fournies'
  },
  artistic_creative: { 
    icon: '🎨', 
    name: 'Qualité Artistique', 
    color: '#f43f5e',
    description: 'Qualité esthétique, créativité et expression artistique'
  },
  atmosphere_experience: { 
    icon: '✨', 
    name: 'Atmosphère', 
    color: '#6366f1',
    description: 'Ambiance générale, atmosphère, ambiance - l\'environnement émotionnel et sensoriel global (éclairage, ambiance, ambiance générale, impact émotionnel)'
  }
};

// Color scheme for Benin
const BENIN_COLORS = ['#00843D', '#FCD116', '#C02000', '#6c757d', '#17a2b8'];

export default function BeninSentiment() {
  const [data, setData] = useState<SentimentData | null>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderSentiment | null>(null);

  useEffect(() => {
    fetch('/benin_sentiment_data.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
      })
      .catch(err => console.error('Échec du chargement des données:', err));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'analyse...</p>
        </div>
      </div>
    );
  }

  // Year distribution from first stakeholder (all have the same year data, totaling 1,284)
  const yearChartData = data.stakeholder_data[0]?.year_distribution 
    ? Object.entries(data.stakeholder_data[0].year_distribution)
        .filter(([year]) => parseInt(year) >= 2014)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([year, count]) => ({
          année: year,
          avis: count
        }))
    : [];

  // Language distribution
  const languageData = data.stakeholder_data.reduce((acc, stakeholder) => {
    if (stakeholder.language_distribution) {
      Object.entries(stakeholder.language_distribution).forEach(([lang, count]: [string, any]) => {
        acc[lang] = (acc[lang] || 0) + count;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const languageLabels: Record<string, string> = {
    'en': 'Anglais', 'fr': 'Français', 'pl': 'Polonais', 'it': 'Italien',
    'pt': 'Portugais', 'de': 'Allemand', 'es': 'Espagnol', 'unknown': 'Inconnu'
  };

  const languageChartData = Object.entries(languageData)
    .map(([lang, count]) => ({
      language: languageLabels[lang] || lang.toUpperCase(),
      original: lang.toUpperCase(),
      reviews: count,
      percentage: ((count / data.metadata.total_reviews) * 100).toFixed(1)
    }))
    .sort((a, b) => b.reviews - a.reviews);

  // Calculate sector-wide theme performance
  const themePerformance: Record<string, { avg: number; positive: number; negative: number; neutral: number }> = {};
  const themeAttractions: Record<string, { best: string; worst: string; bestScore: number; worstScore: number }> = {};
  
  // First pass: collect scores and find best/worst
  data.stakeholder_data.forEach(stakeholder => {
    if (stakeholder.theme_scores) {
      Object.entries(stakeholder.theme_scores).forEach(([theme, themeData]: [string, any]) => {
        if (!themePerformance[theme]) {
          themePerformance[theme] = { avg: 0, positive: 0, negative: 0, neutral: 0 };
          themeAttractions[theme] = { best: '', worst: '', bestScore: -Infinity, worstScore: Infinity };
        }
        const dist = themeData.distribution || { positive: 0, neutral: 0, negative: 0 };
        themePerformance[theme].positive += dist.positive;
        themePerformance[theme].negative += dist.negative;
        themePerformance[theme].neutral += dist.neutral;
        
        // Track best and worst attractions for each theme
        const score = themeData.score || themeData.sentiment_score || 0;
        if (score > themeAttractions[theme].bestScore) {
          themeAttractions[theme].best = stakeholder.stakeholder_name;
          themeAttractions[theme].bestScore = score;
        }
        if (score < themeAttractions[theme].worstScore) {
          themeAttractions[theme].worst = stakeholder.stakeholder_name;
          themeAttractions[theme].worstScore = score;
        }
      });
    }
  });

  // Second pass: calculate averages properly
  Object.keys(themePerformance).forEach(theme => {
    let totalScore = 0;
    let count = 0;
    
    data.stakeholder_data.forEach(stakeholder => {
      if (stakeholder.theme_scores && stakeholder.theme_scores[theme]) {
        const themeData = stakeholder.theme_scores[theme];
        totalScore += themeData.score || themeData.sentiment_score || 0;
        count++;
      }
    });
    
    themePerformance[theme].avg = count > 0 ? totalScore / count : 0;
  });

  const sortedThemes = Object.entries(themePerformance)
    .map(([theme, perf]) => ({ theme, ...perf }))
    .sort((a, b) => b.avg - a.avg);

  const topThemes = sortedThemes.slice(0, 3);
  const bottomThemes = sortedThemes.slice(-3).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              BJ
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patrimoine Culturel du Bénin</h1>
              <p className="text-gray-600">Analyse des Sentiments des Avis Touristes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Sites</p>
              <p className="text-2xl font-bold text-green-600">{data.metadata.total_stakeholders}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Avis</p>
              <p className="text-2xl font-bold text-blue-600">{data.metadata.total_reviews}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Sentiment Moyen (-1 à +1)</p>
              <p className="text-2xl font-bold text-purple-600">
                {(data.stakeholder_data.reduce((sum, s) => sum + s.overall_sentiment, 0) / data.stakeholder_data.length >= 0 ? '+' : '')}
                {(data.stakeholder_data.reduce((sum, s) => sum + s.overall_sentiment, 0) / data.stakeholder_data.length).toFixed(3)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Note Moyenne</p>
              <p className="text-2xl font-bold text-orange-600">
                {(data.stakeholder_data.reduce((sum, s) => sum + s.average_rating, 0) / data.stakeholder_data.length).toFixed(1)}/5
              </p>
            </div>
          </div>
        </div>

        {/* Reviews by Year */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Évolution des Avis par Année</h2>
          <p className="text-sm text-gray-600 mb-4">
            Distribution temporelle des avis collectés, montrant les tendances d'engagement des visiteurs au fil du temps. Cette vue vous permet de comprendre comment l'activité de revue a évolué, avec des pics et des baisses d'engagement qui peuvent refléter les événements, les saisons ou les changements dans l'attractivité des sites patrimoniaux.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="année" label={{ value: 'Année', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Nombre d\'avis', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
              <Line type="monotone" dataKey="avis" stroke="#00843D" strokeWidth={2} />
            </LineChart>
              </ResponsiveContainer>
            </div>

        {/* Language Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Langues d'Origine des Avis</h2>
          <p className="text-sm text-gray-600 mb-4">
            Répartition des langues originales des avis. Note: tous les avis ont été traduits en français pour une analyse harmonisée. Cette analyse montre la diversité linguistique des visiteurs et peut indiquer les marchés touristiques dominants. Les avis en anglais représentent la majorité, suivi du français, ce qui reflète l'attraction internationale du patrimoine béninois.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {languageChartData.map((entry, index) => (
              <div 
                key={index}
                className="relative group border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{ borderColor: BENIN_COLORS[index % BENIN_COLORS.length] }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: BENIN_COLORS[index % BENIN_COLORS.length] }}
                  />
                  <span className="font-semibold text-gray-900">{entry.language}</span>
                </div>
                <div className="text-2xl font-bold text-gray-800" style={{ color: BENIN_COLORS[index % BENIN_COLORS.length] }}>
                  {entry.percentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {entry.reviews.toLocaleString()} avis
                </div>
                <div className="absolute right-2 top-2 text-xs text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity">
                  {entry.original}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector-Wide Theme Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Performing Themes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-bold text-gray-900">Points Forts du Secteur</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Thèmes où les visiteurs expriment le sentiment le plus positif. Les barres de couleur montrent la répartition positive, neutre et négative, vous permettant de comprendre si une note moyenne élevée vient d'une majorité d'avis positifs ou d'un mélange de neutres.
            </p>
            <div className="space-y-3">
              {topThemes.map(({ theme, avg, positive, negative, neutral }) => {
                const config = THEME_CONFIG[theme];
                const total = positive + neutral + negative;
                const attractions = themeAttractions[theme];
                return config ? (
                  <div key={theme} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="font-semibold text-gray-900">{config.name}</span>
                      </div>
                      <span className={`text-sm font-bold text-green-600`}>
                        {avg >= 0 ? '+' : ''}{avg.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic mb-2">{config.description}</p>
                    {attractions?.best && attractions.bestScore > 0 && (
                      <div className="text-xs text-gray-700 mb-2">
                        <span className="font-medium">⭐ Exemple:</span> {attractions.best}
                      </div>
                    )}
                    <div className="flex gap-1 h-2 bg-white rounded-full overflow-hidden">
                      {positive > 0 && (
                        <div className="bg-green-500" style={{ width: `${(positive / total) * 100}%` }} />
                      )}
                      {neutral > 0 && (
                        <div className="bg-yellow-500" style={{ width: `${(neutral / total) * 100}%` }} />
                      )}
                      {negative > 0 && (
                        <div className="bg-red-500" style={{ width: `${(negative / total) * 100}%` }} />
                      )}
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-gray-600">
                      <span>✓ {positive}</span>
                      <span>~ {neutral}</span>
                      <span>✗ {negative}</span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-xl font-bold text-gray-900">Points d'Amélioration</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Thèmes où les visiteurs expriment le sentiment le plus négatif ou neutre. Ces domaines représentent des opportunités d'amélioration pour l'expérience des visiteurs. Attention: un sentiment proche de zéro ne signifie pas nécessairement négatif, mais plutôt un manque de réactions fortes.
            </p>
            <div className="space-y-3">
              {bottomThemes.map(({ theme, avg, positive, negative, neutral }) => {
                const config = THEME_CONFIG[theme];
                const total = positive + neutral + negative;
                const attractions = themeAttractions[theme];
                return config ? (
                  <div key={theme} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="font-semibold text-gray-900">{config.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${
                        avg >= 0.6 ? 'text-green-600' :
                        avg >= 0.3 ? 'text-green-500' :
                        avg >= -0.3 ? 'text-yellow-500' :
                        'text-red-600'
                      }`}>
                        {avg >= 0 ? '+' : ''}{avg.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic mb-2">{config.description}</p>
                    {attractions?.worst && attractions.worstScore < 0 && (
                      <div className="text-xs text-gray-700 mb-2">
                        <span className="font-medium">⚠️ Attention:</span> {attractions.worst}
                      </div>
                    )}
                    <div className="flex gap-1 h-2 bg-white rounded-full overflow-hidden">
                      {positive > 0 && (
                        <div className="bg-green-500" style={{ width: `${(positive / total) * 100}%` }} />
                      )}
                      {neutral > 0 && (
                        <div className="bg-yellow-500" style={{ width: `${(neutral / total) * 100}%` }} />
                      )}
                      {negative > 0 && (
                        <div className="bg-red-500" style={{ width: `${(negative / total) * 100}%` }} />
                      )}
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-gray-600">
                      <span>✓ {positive}</span>
                      <span>~ {neutral}</span>
                      <span>✗ {negative}</span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* All Themes Overview Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Résumé Sentimental par Thème</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vue d'ensemble des sentiments pour tous les thèmes analysés. Les barres vertes indiquent un sentiment positif, les barres orange/jaunes indiquent un sentiment neutre, et les barres rouges indiquent un sentiment négatif.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={sortedThemes.map(({ theme, avg, positive, negative, neutral }) => ({
                theme: `${THEME_CONFIG[theme]?.icon || ''} ${THEME_CONFIG[theme]?.name || theme}`,
                avg: avg,
                positive,
                neutral,
                negative
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="theme"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                domain={[0, 500]}
                label={{ value: 'Nombre de mentions', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  return [value, name === 'positive' ? 'Positif' : name === 'neutral' ? 'Neutre' : 'Négatif'];
                }}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              />
              <Legend />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Négatif" />
              <Bar dataKey="neutral" stackId="a" fill="#fbbf24" name="Neutre" />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positif" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stakeholders Grid with Theme Icons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sites du Patrimoine Culturel</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vue d'ensemble de tous les sites patrimoniaux analysés. Cliquez sur un site pour voir l'analyse détaillée des sentiments et des thèmes. Les sites sont triés par sentiment moyen décroissant. Les icônes emoji montrent les thèmes clés mentionnés dans les avis pour chaque site, et la couleur du badge de sentiment (vert, jaune, orange, rouge) indique la qualité globale de l'expérience selon les visiteurs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.stakeholder_data
              .sort((a, b) => b.overall_sentiment - a.overall_sentiment)
              .map((stakeholder) => (
                <div
                  key={stakeholder.stakeholder_name}
                  onClick={() => setSelectedStakeholder(stakeholder)}
                  className="bg-gray-50 rounded-lg shadow-sm p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm flex-1">
                      {stakeholder.stakeholder_name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      stakeholder.overall_sentiment > 0.6 ? 'bg-green-100 text-green-700' :
                      stakeholder.overall_sentiment > 0.3 ? 'bg-green-50 text-green-600' :
                      stakeholder.overall_sentiment > -0.3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {stakeholder.overall_sentiment >= 0 ? '+' : ''}{stakeholder.overall_sentiment.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between text-gray-600">
                      <span>⭐ Note:</span>
                      <span className="font-medium">{stakeholder.average_rating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>📝 Avis:</span>
                      <span className="font-medium">{stakeholder.total_reviews}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Sentiment:</span>
                      <span className={`font-medium ${
                        stakeholder.overall_sentiment >= 0.6 ? 'text-green-600' :
                        stakeholder.overall_sentiment >= 0.3 ? 'text-green-500' :
                        stakeholder.overall_sentiment >= -0.3 ? 'text-yellow-500' :
                        'text-red-600'
                      }`}>
                        {stakeholder.overall_sentiment >= 0 ? '+' : ''}{stakeholder.overall_sentiment.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Theme Icons */}
                  {stakeholder.theme_scores && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Thèmes clés:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(stakeholder.theme_scores)
                          .filter(([, data]: [string, any]) => data.mentions > 3)
                          .sort(([, a]: [string, any], [, b]: [string, any]) => b.mentions - a.mentions)
                          .slice(0, 4)
                          .map(([theme]: [string]) => {
                            const config = THEME_CONFIG[theme];
                            return config ? (
                              <span key={theme} className="text-lg" title={config.name}>
                                {config.icon}
                              </span>
                            ) : null;
                          })}
                      </div>
                    </div>
                  )}

                  {stakeholder.tripadvisor_url && (
                    <a
                      href={stakeholder.tripadvisor_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-block w-full text-center px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Voir sur TripAdvisor →
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Selected Stakeholder Modal */}
        {selectedStakeholder && (
          <div 
            className="fixed inset-0 bg-gray-200 bg-opacity-10 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedStakeholder(null);
              }
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedStakeholder.stakeholder_name}
                  </h3>
                  <button
                    onClick={() => setSelectedStakeholder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Sentiment (-1 à +1)</p>
                    <p className={`text-2xl font-bold ${
                      selectedStakeholder.overall_sentiment >= 0.6 ? 'text-green-600' :
                      selectedStakeholder.overall_sentiment >= 0.3 ? 'text-green-500' :
                      selectedStakeholder.overall_sentiment >= -0.3 ? 'text-yellow-500' :
                      'text-red-600'
                    }`}>
                      {selectedStakeholder.overall_sentiment >= 0 ? '+' : ''}{selectedStakeholder.overall_sentiment.toFixed(3)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Avis</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedStakeholder.total_reviews}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Note</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedStakeholder.average_rating.toFixed(1)}/5
                    </p>
                  </div>
                </div>

                {/* Theme Scores with Visual Bars */}
                {selectedStakeholder.theme_scores && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-900">Analyse par Thème</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedStakeholder.theme_scores)
                        .sort(([, a]: [string, any], [, b]: [string, any]) => {
                          const scoreA = a.score || a.sentiment_score || 0;
                          const scoreB = b.score || b.sentiment_score || 0;
                          return scoreB - scoreA;
                        })
                        .map(([theme, data]: [string, any]) => {
                          const config = THEME_CONFIG[theme];
                          const distribution = data.distribution || {positive: 0, neutral: 0, negative: 0};
                          const total = data.mentions || 0;
                          const score = data.score || data.sentiment_score || 0;
                          
                          return config ? (
                            <div key={theme} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{config.icon}</span>
                                  <span className="font-medium text-gray-900">{config.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-bold ${
                                    score >= 0.6 ? 'text-green-600' :
                                    score >= 0.3 ? 'text-green-500' :
                                    score >= -0.3 ? 'text-yellow-500' :
                                    'text-red-600'
                                  }`}>
                                    {score >= 0 ? '+' : ''}{score.toFixed(2)}
                        </span>
                                  <span className="text-xs text-gray-500">{total} mentions</span>
                                </div>
                              </div>
                              
                              {/* Positive/Neutral/Negative breakdown bars */}
                              {total > 0 && (
                                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                                  {distribution.positive > 0 && (
                                    <div 
                                      className="bg-green-500" 
                                      style={{ width: `${(distribution.positive / total) * 100}%` }}
                                      title={`${distribution.positive} positif`}
                                    />
                                  )}
                                  {distribution.neutral > 0 && (
                                    <div 
                                      className="bg-yellow-500" 
                                      style={{ width: `${(distribution.neutral / total) * 100}%` }}
                                      title={`${distribution.neutral} neutre`}
                                    />
                                  )}
                                  {distribution.negative > 0 && (
                                    <div 
                                      className="bg-red-500" 
                                      style={{ width: `${(distribution.negative / total) * 100}%` }}
                                      title={`${distribution.negative} négatif`}
                                    />
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-1 flex gap-3 text-xs text-gray-500">
                                <span>✓ {distribution.positive} positif</span>
                                <span>~ {distribution.neutral} neutre</span>
                                <span>✗ {distribution.negative} négatif</span>
                              </div>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </div>
                )}

                {selectedStakeholder.tripadvisor_url && (
                  <div className="mb-6">
                    <a
                      href={selectedStakeholder.tripadvisor_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Voir les avis complets sur TripAdvisor →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
