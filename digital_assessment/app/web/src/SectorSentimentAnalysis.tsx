import React, { useEffect, useState } from 'react';
import { fetchSectorSentiment, type SentimentData } from './api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SectorSentimentAnalysisProps {
  sectorName: string;
  totalParticipantsInSector: number;
}

const SectorSentimentAnalysis: React.FC<SectorSentimentAnalysisProps> = ({ 
  sectorName, 
  totalParticipantsInSector 
}) => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSectorSentimentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSectorSentiment(sectorName);
        setSentimentData(data);
      } catch (err) {
        setError('No sentiment data available for this sector');
        setSentimentData([]);
      } finally {
        setLoading(false);
      }
    };

    if (sectorName) {
      loadSectorSentimentData();
    }
  }, [sectorName]);

  // Don't render anything if loading, error, or no data
  if (loading) {
    return <div className="card">Loading sector sentiment analysis...</div>;
  }

  if (error || !sentimentData.length) {
    return null; // Don't show anything if no sentiment data
  }

  // Calculate sector-wide metrics
  const totalReviews = sentimentData.reduce((sum, stakeholder) => sum + stakeholder.total_reviews, 0);
  const avgRating = sentimentData.reduce((sum, stakeholder) => sum + stakeholder.average_rating, 0) / sentimentData.length;
  const avgSentiment = sentimentData.reduce((sum, stakeholder) => sum + stakeholder.overall_sentiment, 0) / sentimentData.length;
  const avgPositiveRate = sentimentData.reduce((sum, stakeholder) => sum + stakeholder.positive_rate, 0) / sentimentData.length;
  
  // Calculate coverage metrics
  const participantsWithSentiment = sentimentData.length;
  const coveragePercentage = (participantsWithSentiment / totalParticipantsInSector) * 100;
  
  // Aggregate theme scores
  const themeAggregates: Record<string, { totalScore: number; totalMentions: number; count: number }> = {};
  sentimentData.forEach(stakeholder => {
    Object.entries(stakeholder.theme_scores).forEach(([theme, data]) => {
      if (!themeAggregates[theme]) {
        themeAggregates[theme] = { totalScore: 0, totalMentions: 0, count: 0 };
      }
      themeAggregates[theme].totalScore += data.score;
      themeAggregates[theme].totalMentions += data.mentions;
      themeAggregates[theme].count += 1;
    });
  });

  const sectorThemeAverages = Object.entries(themeAggregates).map(([theme, data]) => ({
    theme,
    averageScore: data.totalScore / data.count,
    totalMentions: data.totalMentions,
    participantCount: data.count
  }));

  // Aggregate language distribution
  const languageAggregates: Record<string, number> = {};
  sentimentData.forEach(stakeholder => {
    Object.entries(stakeholder.language_distribution).forEach(([lang, count]) => {
      languageAggregates[lang] = (languageAggregates[lang] || 0) + count;
    });
  });

  // Aggregate year distribution
  const yearAggregates: Record<string, number> = {};
  sentimentData.forEach(stakeholder => {
    Object.entries(stakeholder.year_distribution).forEach(([year, count]) => {
      yearAggregates[year] = (yearAggregates[year] || 0) + count;
    });
  });

  // Find critical areas across the sector
  const allCriticalAreas = sentimentData.flatMap(stakeholder => 
    stakeholder.critical_areas?.map(area => ({
      ...area,
      stakeholder: stakeholder.stakeholder_name
    })) || []
  );

  // Group critical areas by theme
  const criticalAreasByTheme: Record<string, any[]> = {};
  allCriticalAreas.forEach(area => {
    if (!criticalAreasByTheme[area.theme]) {
      criticalAreasByTheme[area.theme] = [];
    }
    criticalAreasByTheme[area.theme].push(area);
  });

  const sectorCriticalAreas = Object.entries(criticalAreasByTheme).map(([theme, areas]) => ({
    theme,
    averageScore: areas.reduce((sum, area) => sum + area.sentiment_score, 0) / areas.length,
    totalMentions: areas.reduce((sum, area) => sum + area.mention_count, 0),
    affectedStakeholders: areas.length,
    stakeholders: areas.map(area => area.stakeholder)
  })).sort((a, b) => a.averageScore - b.averageScore).slice(0, 5);

  // Helper function to create sentiment distribution data
  const createSentimentDistributionData = () => {
    const positive = avgPositiveRate;
    const neutral = 100 - positive;
    
    return {
      labels: ['Positive', 'Neutral'],
      datasets: [
        {
          data: [positive, neutral],
          backgroundColor: ['#28a745', '#6c757d'],
          borderWidth: 0,
        },
      ],
    };
  };

  // Helper function to create theme analysis data
  const createThemeAnalysisData = () => {
    const themes = sectorThemeAverages.map(t => t.theme);
    const scores = sectorThemeAverages.map(t => t.averageScore);
    
    return {
      labels: themes.map(theme => theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [
        {
          label: 'Average Sentiment Score',
          data: scores,
          backgroundColor: scores.map(score => 
            score > 0.5 ? '#28a745' : score > 0 ? '#ffc107' : '#dc3545'
          ),
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  };

  // Helper function to create language distribution data
  const createLanguageDistributionData = () => {
    const languages = Object.keys(languageAggregates);
    const counts = languages.map(lang => languageAggregates[lang]);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const percentages = counts.map(count => ((count / total) * 100).toFixed(1));
    
    return {
      labels: languages.map(lang => lang.toUpperCase()),
      datasets: [
        {
          label: 'Percentage (%)',
          data: percentages,
          backgroundColor: ['#007bff', '#6f42c1', '#fd7e14', '#dc3545', '#20c997', '#6c757d'],
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  };

  // Helper function to create review frequency data
  const createReviewFrequencyData = () => {
    const years = Object.keys(yearAggregates).sort();
    const counts = years.map(year => yearAggregates[year]);
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Number of Reviews',
          data: counts,
          backgroundColor: '#007bff',
          borderWidth: 1,
          borderColor: '#0056b3',
        },
      ],
    };
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18, color: '#1565c0' }}>
        📊 Sector-Wide Visitor Sentiment Analysis
      </div>
      
      {/* Data Coverage Transparency */}
      <div style={{ 
        padding: 12, 
        backgroundColor: '#e7f3ff', 
        borderRadius: 8, 
        border: '1px solid #b3d9ff',
        marginBottom: 16
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#004085' }}>
          📈 Data Coverage & Representation
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#004085' }}>Participants Analyzed</div>
            <div style={{ color: '#004085' }}>
              {participantsWithSentiment} of {totalParticipantsInSector} 
              ({coveragePercentage.toFixed(1)}% coverage)
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#004085' }}>Total Reviews Analyzed</div>
            <div style={{ color: '#004085' }}>{totalReviews.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#004085' }}>Average Reviews per Participant</div>
            <div style={{ color: '#004085' }}>{(totalReviews / participantsWithSentiment).toFixed(1)}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#004085' }}>Data Completeness</div>
            <div style={{ color: coveragePercentage >= 80 ? '#28a745' : coveragePercentage >= 50 ? '#ffc107' : '#dc3545' }}>
              {coveragePercentage >= 80 ? 'High' : coveragePercentage >= 50 ? 'Moderate' : 'Limited'}
            </div>
          </div>
        </div>
        {coveragePercentage < 80 && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#004085', fontStyle: 'italic' }}>
            ⚠️ Note: This analysis represents {coveragePercentage.toFixed(1)}% of sector participants. 
            Results may not be fully representative of the entire sector.
          </div>
        )}
      </div>

      {/* Sector KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>
            {totalReviews.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Reviews</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#28a745', marginBottom: 4 }}>
            {avgRating.toFixed(1)}/5
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Avg Rating</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#17a2b8', marginBottom: 4 }}>
            {avgSentiment.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Avg Sentiment</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffc107', marginBottom: 4 }}>
            {avgPositiveRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Positive Rate</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Sentiment Distribution */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Sector Sentiment Distribution</h4>
          <div style={{ height: 200 }}>
            <Doughnut
              data={createSentimentDistributionData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 10,
                      font: { size: 11 }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Theme Analysis */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Sector Theme Performance</h4>
          <div style={{ height: 200 }}>
            <Bar
              data={createThemeAnalysisData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    min: -1,
                    max: 1,
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Sentiment Score',
                      font: { size: 11 }
                    }
                  },
                  x: {
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Themes',
                      font: { size: 11 }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Language and Year Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Language Distribution */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Review Languages</h4>
          <div style={{ height: 200 }}>
            <Bar
              data={createLanguageDistributionData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Percentage (%)',
                      font: { size: 11 }
                    }
                  },
                  x: {
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Language',
                      font: { size: 11 }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Review Frequency by Year */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Reviews by Year</h4>
          <div style={{ height: 200 }}>
            <Bar
              data={createReviewFrequencyData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Number of Reviews',
                      font: { size: 11 }
                    }
                  },
                  x: {
                    ticks: { font: { size: 10 } },
                    title: {
                      display: true,
                      text: 'Year',
                      font: { size: 11 }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Sector Critical Areas */}
      {sectorCriticalAreas.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#dc3545' }}>
            Sector-Wide Areas for Improvement
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sectorCriticalAreas.map((area, index) => (
              <div key={index} style={{ 
                padding: 12, 
                backgroundColor: '#f8d7da', 
                borderRadius: 8, 
                border: '1px solid #f5c6cb'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#721c24' }}>
                  {area.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontSize: 12, color: '#721c24', marginBottom: 4 }}>
                  Average Score: {area.averageScore.toFixed(2)} • {area.totalMentions} mentions • 
                  Affects {area.affectedStakeholders} participants
                </div>
                <div style={{ fontSize: 11, color: '#721c24' }}>
                  Participants: {area.stakeholders.slice(0, 3).join(', ')}
                  {area.stakeholders.length > 3 && ` +${area.stakeholders.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorSentimentAnalysis;
