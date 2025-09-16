import React, { useEffect, useState } from 'react';
import { fetchStakeholderSentiment, type SentimentData } from './api';
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

// Helper function to create language distribution data
const createLanguageDistributionData = (data: SentimentData) => {
  const languages = Object.keys(data.language_distribution);
  const counts = languages.map(lang => data.language_distribution[lang]);
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

interface SentimentDisplayProps {
  participantName: string;
}

const SentimentDisplay: React.FC<SentimentDisplayProps> = ({ participantName }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSentimentData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStakeholderSentiment(participantName);
        setSentimentData(data);
      } catch (err) {
        // If no sentiment data exists for this participant, don't show the component
        setError('No sentiment data available');
        setSentimentData(null);
      } finally {
        setLoading(false);
      }
    };

    if (participantName) {
      loadSentimentData();
    }
  }, [participantName]);

  // Show loading state
  if (loading) {
    return (
      <div className="card">
        <div className="muted">Loading sentiment analysis...</div>
      </div>
    );
  }

  // Show graceful message when no sentiment data is available
  if (error || !sentimentData) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Reviews Not Found</div>
          <div className="muted" style={{ lineHeight: '1.5' }}>
            For more in-depth analysis, please share where reviews can be found.
          </div>
        </div>
      </div>
    );
  }

  // Helper function to create sentiment distribution data
  const createSentimentDistributionData = (data: SentimentData) => {
    const positive = data.positive_rate;
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
  const createThemeAnalysisData = (data: SentimentData) => {
    const themes = Object.keys(data.theme_scores);
    const scores = themes.map(theme => data.theme_scores[theme].score);
    
    return {
      labels: themes.map(theme => theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [
        {
          label: 'Sentiment Score',
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

  // Helper function to create reviews by year data
  const createReviewsByYearData = (data: SentimentData) => {
    const years = Object.keys(data.year_distribution).sort();
    const counts = years.map(year => data.year_distribution[year]);
    
    // If no year data, show a helpful message
    if (years.length === 0) {
      return {
        labels: ['Year data not available'],
        datasets: [
          {
            label: 'Reviews by Year',
            data: [0],
            backgroundColor: '#6c757d',
            borderWidth: 1,
            borderColor: '#495057',
          },
        ],
      };
    }
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Reviews by Year',
          data: counts,
          backgroundColor: '#007bff',
          borderWidth: 1,
          borderColor: '#0056b3',
        },
      ],
    };
  };

  return (
    <div className="card" style={{ gridColumn: '1 / span 2', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16, color: '#1565c0' }}>
        📊 Visitor Sentiment Analysis
      </div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        Based on {sentimentData.total_reviews} visitor reviews • 
        {sentimentData.overall_sentiment > 0.5 ? 'Positive' : sentimentData.overall_sentiment > 0 ? 'Neutral' : 'Negative'} overall sentiment • 
        {sentimentData.language_diversity > 0.7 ? 'High' : sentimentData.language_diversity > 0.4 ? 'Moderate' : 'Low'} language diversity
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>
            {sentimentData.total_reviews}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Reviews</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#28a745', marginBottom: 4 }}>
            {sentimentData.average_rating.toFixed(1)}/5
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Avg Rating</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#17a2b8', marginBottom: 4 }}>
            {sentimentData.overall_sentiment.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Sentiment</div>
        </div>
        <div style={{ textAlign: 'center', padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffc107', marginBottom: 4 }}>
            {sentimentData.positive_rate.toFixed(1)}%
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Positive</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Sentiment Distribution */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Sentiment Distribution</h4>
          <div style={{ height: 150 }}>
            <Doughnut
              data={createSentimentDistributionData(sentimentData)}
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
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Theme Analysis</h4>
          <div style={{ height: 150 }}>
            <Bar
              data={createThemeAnalysisData(sentimentData)}
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
          <div style={{ height: 150 }}>
            <Bar
              data={createLanguageDistributionData(sentimentData)}
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

        {/* Reviews by Year */}
        <div>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Reviews by Year</h4>
          <div style={{ height: 150 }}>
            <Bar
              data={createReviewsByYearData(sentimentData)}
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

      {/* Key Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Critical Areas */}
        {sentimentData.critical_areas && sentimentData.critical_areas.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#dc3545' }}>
              Areas for Improvement
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sentimentData.critical_areas.slice(0, 3).map((area, index) => (
                <div key={index} style={{ 
                  padding: 8, 
                  backgroundColor: '#f8d7da', 
                  borderRadius: 6, 
                  border: '1px solid #f5c6cb',
                  fontSize: 12
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 2, color: '#721c24' }}>
                    {area.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div style={{ color: '#721c24' }}>
                    Score: {area.sentiment_score.toFixed(2)} • {area.mention_count} mentions
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Strengths */}
        {sentimentData.key_strengths && sentimentData.key_strengths.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#28a745' }}>
              Key Strengths
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sentimentData.key_strengths.slice(0, 3).map((strength, index) => (
                <div key={index} style={{ 
                  padding: 8, 
                  backgroundColor: '#d4edda', 
                  borderRadius: 6, 
                  border: '1px solid #c3e6cb',
                  fontSize: 12
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 2, color: '#155724' }}>
                    {strength.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div style={{ color: '#155724' }}>
                    Score: {strength.score.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Management Response Insights */}
      {sentimentData.management_response && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#e7f3ff', borderRadius: 8, border: '1px solid #b3d9ff' }}>
          <h4 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#004085' }}>
            Management Response
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, fontSize: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#004085' }}>Response Rate</div>
              <div style={{ color: '#004085' }}>{sentimentData.management_response.response_rate.toFixed(1)}%</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#004085' }}>Total Responses</div>
              <div style={{ color: '#004085' }}>{sentimentData.management_response.total_responses}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#004085' }}>Unanswered Reviews</div>
              <div style={{ color: '#004085' }}>{sentimentData.management_response.gap_opportunity}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SentimentDisplay;
