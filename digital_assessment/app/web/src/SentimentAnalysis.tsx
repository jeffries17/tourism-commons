import React, { useEffect, useState } from 'react';
import { fetchSentimentSummary, fetchAllSentimentData, fetchStakeholderSentiment, type SentimentData, type SentimentSummary } from './api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
    labels: themes.map(theme => theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
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

// Helper function to create review frequency data
const createReviewFrequencyData = (data: SentimentData) => {
  const years = Object.keys(data.year_distribution).sort();
  const counts = years.map(year => data.year_distribution[year]);
  
  // If no year data, show a message
  if (years.length === 0) {
    return {
      labels: ['No year data available'],
      datasets: [
        {
          label: 'Number of Reviews',
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
        label: 'Number of Reviews',
        data: counts,
        backgroundColor: '#007bff',
        borderWidth: 1,
        borderColor: '#0056b3',
      },
    ],
  };
};

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

const SentimentAnalysis: React.FC = () => {
  const [summary, setSummary] = useState<SentimentSummary | null>(null);
  const [allData, setAllData] = useState<SentimentData[]>([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>('');
  const [stakeholderData, setStakeholderData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, allDataResult] = await Promise.all([
          fetchSentimentSummary(),
          fetchAllSentimentData()
        ]);
        setSummary(summaryData);
        setAllData(allDataResult);
      } catch (error) {
        console.error('Error loading sentiment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedStakeholder) {
      fetchStakeholderSentiment(selectedStakeholder)
        .then(setStakeholderData)
        .catch(error => console.error('Error loading stakeholder data:', error));
    }
  }, [selectedStakeholder]);

  if (loading) {
    return <div className="card">Loading sentiment analysis data...</div>;
  }

  if (!summary) {
    return <div className="card">No sentiment analysis data available</div>;
  }

  return (
    <div>
      <div className="banner">
        <div style={{ fontSize: 20, fontWeight: 700 }}>Sentiment Analysis Dashboard</div>
        <div className="muted">Visitor feedback analysis and insights for tourism stakeholders</div>
      </div>

      {/* Performance Overview */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Performance Overview</h3>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>
              {summary.total_stakeholders}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Total Stakeholders</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#28a745', marginBottom: 4 }}>
              {summary.total_reviews.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Total Reviews</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#17a2b8', marginBottom: 4 }}>
              {summary.average_sentiment.toFixed(3)}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Sentiment Score</div>
            <div style={{ fontSize: 12, color: '#999' }}>Scale: -1 to +1</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ffc107', marginBottom: 4 }}>
              {summary.average_rating.toFixed(1)}/5
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Average Rating</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Sentiment Distribution */}
          <div>
            <h4 style={{ marginBottom: 8 }}>Sentiment Distribution</h4>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              Shows overall visitor sentiment distribution across all reviews analyzed
            </p>
            <div style={{ height: 200 }}>
              <Doughnut
                data={{
                  labels: ['Positive', 'Neutral', 'Negative'],
                  datasets: [{
                    data: [
                      summary.average_sentiment > 0 ? (summary.average_sentiment + 1) * 50 : 0,
                      summary.average_sentiment > 0 ? (1 - summary.average_sentiment) * 50 : 50,
                      summary.average_sentiment < 0 ? Math.abs(summary.average_sentiment) * 50 : 0
                    ],
                    backgroundColor: ['#28a745', '#6c757d', '#dc3545'],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Theme Performance */}
          <div>
            <h4 style={{ marginBottom: 8 }}>Theme Performance Analysis</h4>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
              Average sentiment scores across all stakeholders for each theme
            </p>
            <div style={{ height: 200 }}>
              <Bar
                data={{
                  labels: Object.keys(summary.theme_averages).map(theme => 
                    theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  ),
                  datasets: [{
                    label: 'Sentiment Score',
                    data: Object.values(summary.theme_averages).map(data => data.average_score),
                    backgroundColor: Object.values(summary.theme_averages).map(data => 
                      data.average_score > 0.5 ? '#28a745' : data.average_score > 0 ? '#ffc107' : '#dc3545'
                    ),
                    borderWidth: 1,
                    borderColor: '#fff',
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      min: -1,
                      max: 1,
                      title: {
                        display: true,
                        text: 'Sentiment Score'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Tourism Themes'
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
      </div>

      {/* Language Distribution and Review Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Language Distribution */}
        <div className="card">
          <h4 style={{ marginBottom: 8 }}>Visitor Language Distribution</h4>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            Language distribution of reviews - indicates international visitor diversity
          </p>
          <div style={{ height: 200 }}>
            <Bar
              data={{
                labels: Object.keys(summary.language_distribution).map(lang => lang.toUpperCase()),
                datasets: [{
                  label: 'Percentage (%)',
                  data: Object.values(summary.language_distribution).map(count => 
                    ((count / summary.total_reviews) * 100).toFixed(1)
                  ),
                  backgroundColor: ['#007bff', '#6f42c1', '#fd7e14', '#dc3545', '#20c997', '#6c757d'],
                  borderWidth: 1,
                  borderColor: '#fff',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Percentage (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Language'
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
        <div className="card">
          <h4 style={{ marginBottom: 8 }}>Review Frequency by Year</h4>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            Number of reviews received per year - shows engagement trends over time
          </p>
          <div style={{ height: 200 }}>
            <Bar
              data={{
                labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                datasets: [{
                  label: 'Number of Reviews',
                  data: [0, 0, 0, 0, 0, 0, 0], // Placeholder - would need year data
                  backgroundColor: '#007bff',
                  borderWidth: 1,
                  borderColor: '#0056b3',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Reviews'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Year'
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

      {/* Critical Areas */}
      {summary.critical_areas_sector.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: '#dc3545' }}>Critical Areas for Improvement</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {summary.critical_areas_sector.map((area, index) => (
              <div key={index} style={{ padding: 12, backgroundColor: '#f8d7da', borderRadius: 8, border: '1px solid #f5c6cb' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#721c24' }}>
                  {area.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontSize: 14, color: '#721c24' }}>
                  Score: {(area.average_score * 100).toFixed(1)}% • {area.total_mentions} mentions • {area.affected_stakeholders} stakeholders affected
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stakeholder Selection */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Select Stakeholder for Detailed Analysis</div>
        <select
          value={selectedStakeholder}
          onChange={(e) => setSelectedStakeholder(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #e7e7e9', minWidth: 300 }}
        >
          <option value="">Select a stakeholder...</option>
          {allData.map(stakeholder => (
            <option key={stakeholder.stakeholder_name} value={stakeholder.stakeholder_name}>
              {stakeholder.stakeholder_name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Detailed Stakeholder Analysis */}
      {stakeholderData && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>
            {stakeholderData.stakeholder_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Detailed Analysis
          </h3>
          
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>
                {stakeholderData.total_reviews}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Total Reviews</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#28a745', marginBottom: 4 }}>
                {stakeholderData.average_rating.toFixed(1)}/5
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Average Rating</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#17a2b8', marginBottom: 4 }}>
                {stakeholderData.overall_sentiment.toFixed(3)}
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Sentiment Score</div>
              <div style={{ fontSize: 12, color: '#999' }}>Scale: -1 to +1</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#ffc107', marginBottom: 4 }}>
                {stakeholderData.positive_rate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>Positive Rate</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Sentiment Distribution */}
            <div>
              <h4 style={{ marginBottom: 8 }}>Sentiment Distribution</h4>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                Shows overall visitor sentiment distribution across all reviews analyzed
              </p>
              <div style={{ height: 200 }}>
                <Doughnut
                  data={createSentimentDistributionData(stakeholderData)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Theme Analysis */}
            <div>
              <h4 style={{ marginBottom: 8 }}>Detailed Sentiment Analysis by Theme</h4>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                Sentiment scores for each theme based on review content analysis
              </p>
              <div style={{ height: 200 }}>
                <Bar
                  data={createThemeAnalysisData(stakeholderData)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        min: -1,
                        max: 1,
                        title: {
                          display: true,
                          text: 'Sentiment Score'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Tourism Themes'
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

          {/* Bottom Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Review Frequency */}
            <div>
              <h4 style={{ marginBottom: 8 }}>Review Frequency by Year</h4>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                Number of reviews received per year - shows engagement trends over time
              </p>
              <div style={{ height: 200 }}>
                <Bar
                  data={createReviewFrequencyData(stakeholderData)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Reviews'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Year'
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

            {/* Language Distribution */}
            <div>
              <h4 style={{ marginBottom: 8 }}>Visitor Language Distribution</h4>
              <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                Language distribution of reviews - indicates international visitor diversity
              </p>
              <div style={{ height: 200 }}>
                <Bar
                  data={createLanguageDistributionData(stakeholderData)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Percentage (%)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Language'
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

          {/* Critical Areas */}
          {stakeholderData.critical_areas && stakeholderData.critical_areas.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 8, color: '#dc3545' }}>Critical Areas for Improvement</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stakeholderData.critical_areas.map((area, index) => (
                  <div key={index} style={{ padding: 12, backgroundColor: '#f8d7da', borderRadius: 8, border: '1px solid #f5c6cb' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: '#721c24' }}>
                      {area.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({area.priority.toUpperCase()})
                    </div>
                    <div style={{ fontSize: 14, color: '#721c24', marginBottom: 8 }}>
                      Score: {area.sentiment_score.toFixed(2)} • {area.mention_count} mentions
                    </div>
                    {area.quotes && area.quotes.length > 0 && (
                      <div style={{ fontSize: 12, color: '#721c24', fontStyle: 'italic' }}>
                        "{area.quotes[0]}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Management Response */}
          <div style={{ padding: 12, backgroundColor: '#e7f3ff', borderRadius: 8, border: '1px solid #b3d9ff' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#004085' }}>Management Response</div>
            <div style={{ fontSize: 14, color: '#004085' }}>
              Response Rate: {stakeholderData.management_response.response_rate.toFixed(1)}% 
              ({stakeholderData.management_response.total_responses} responses)
            </div>
            <div style={{ fontSize: 12, color: '#004085' }}>
              Gap Opportunity: {stakeholderData.management_response.gap_opportunity} reviews without response
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;
