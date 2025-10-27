import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PositioningData {
  stakeholder_name: string;
  sector: string;
  individual_readiness: number;
  market_impact: number;
  quadrant: string;
  priority_score: number;
  has_survey_data: boolean;
  has_sentiment_data: boolean;
  external_score: number;
  survey_score: number;
  sentiment_score: number;
  sector_gap: number;
  ito_gap: number;
  individual_recommendations: string;
  external_recommendations: string;
}

interface QuadrantData {
  name: string;
  color: string;
  description: string;
  stakeholders: PositioningData[];
}

const PositioningOpportunities: React.FC = () => {
  const [data, setData] = useState<PositioningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [hoveredStakeholder, setHoveredStakeholder] = useState<PositioningData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPositioningData();
  }, []);

  const fetchPositioningData = async () => {
    try {
      // Fetch from the generated JSON file
      const response = await fetch('/positioning_opportunities.json');
      if (response.ok) {
        const result = await response.json();
        setData(result.stakeholders || []);
      } else {
        console.error('Failed to fetch positioning data');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching positioning data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const quadrants: QuadrantData[] = [
    {
      name: 'Scale & Optimize',
      color: 'bg-green-500',
      description: 'High digital readiness + High market impact. Focus on optimization and scaling.',
      stakeholders: data.filter(d => d.quadrant === 'Scale & Optimize')
    },
    {
      name: 'Foundation Builders',
      color: 'bg-blue-500',
      description: 'Low digital readiness + High market impact. Invest in foundational digital development.',
      stakeholders: data.filter(d => d.quadrant === 'Foundation Builders')
    },
    {
      name: 'Niche Specialists',
      color: 'bg-yellow-500',
      description: 'High digital readiness + Low market impact. Focus on differentiation and niche markets.',
      stakeholders: data.filter(d => d.quadrant === 'Niche Specialists')
    },
    {
      name: 'Long-term Development',
      color: 'bg-gray-500',
      description: 'Low digital readiness + Low market impact. Long-term development and market education.',
      stakeholders: data.filter(d => d.quadrant === 'Long-term Development')
    }
  ];

  const sectors = ['all', ...Array.from(new Set(data.map(d => d.sector)))];

  const filteredData = selectedSector === 'all' 
    ? data 
    : data.filter(d => d.sector === selectedSector);

  const handleStakeholderClick = (stakeholder: PositioningData) => {
    const encodedName = encodeURIComponent(stakeholder.stakeholder_name);
    navigate(`/participant/${encodedName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Digital Positioning Opportunities Matrix
        </h1>
        <p className="text-gray-600">
          Strategic analysis of stakeholder digital readiness and market impact potential
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>
                  {sector === 'all' ? 'All Sectors' : sector}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} stakeholders
          </div>
        </div>
      </div>

      {/* Matrix Visualization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Positioning Matrix</h2>
          <div className="text-sm text-gray-600">
            X-axis: Individual Digital Readiness (0-10) | Y-axis: Market Impact Potential (0-10)
          </div>
        </div>

        {/* Scatter Plot Container */}
        <div className="relative">
          <div className="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {/* Vertical lines */}
              {[2, 4, 6, 8].map(x => (
                <div
                  key={x}
                  className="absolute top-0 bottom-0 w-px bg-gray-300"
                  style={{ left: `${(x / 10) * 100}%` }}
                />
              ))}
              {/* Horizontal lines */}
              {[2, 4, 6, 8].map(y => (
                <div
                  key={y}
                  className="absolute left-0 right-0 h-px bg-gray-300"
                  style={{ top: `${(y / 10) * 100}%` }}
                />
              ))}
              
              {/* Quadrant divider lines at 5 */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gray-800 border-l-2 border-dashed"
                style={{ left: '50%' }}
              />
              <div
                className="absolute left-0 right-0 h-0.5 bg-gray-800 border-t-2 border-dashed"
                style={{ top: '50%' }}
              />
            </div>

            {/* Quadrant labels */}
            <div className="absolute top-4 right-4 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              Scale & Optimize
            </div>
            <div className="absolute top-4 left-4 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Foundation Builders
            </div>
            <div className="absolute bottom-4 right-4 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              Niche Specialists
            </div>
            <div className="absolute bottom-4 left-4 text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">
              Long-term Development
            </div>

            {/* Stakeholder dots */}
            {filteredData.map((stakeholder, index) => {
              const x = (stakeholder.individual_readiness / 10) * 100;
              const y = 100 - (stakeholder.market_impact / 10) * 100; // Invert Y for proper positioning
              
              const quadrantColors = {
                'Scale & Optimize': 'bg-green-500',
                'Foundation Builders': 'bg-blue-500',
                'Niche Specialists': 'bg-yellow-500',
                'Long-term Development': 'bg-gray-500'
              };

              return (
                <div
                  key={index}
                  className={`absolute w-4 h-4 rounded-full ${quadrantColors[stakeholder.quadrant as keyof typeof quadrantColors]} cursor-pointer transform -translate-x-2 -translate-y-2 hover:scale-125 transition-transform`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onMouseEnter={() => setHoveredStakeholder(stakeholder)}
                  onMouseLeave={() => setHoveredStakeholder(null)}
                  onClick={() => handleStakeholderClick(stakeholder)}
                  title={stakeholder.stakeholder_name}
                />
              );
            })}
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredStakeholder && (
          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {hoveredStakeholder.stakeholder_name}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Sector:</strong> {hoveredStakeholder.sector}</div>
              <div><strong>Quadrant:</strong> {hoveredStakeholder.quadrant}</div>
              <div><strong>Digital Readiness:</strong> {hoveredStakeholder.individual_readiness ? hoveredStakeholder.individual_readiness.toFixed(1) : '0.0'}</div>
              <div><strong>Market Impact:</strong> {hoveredStakeholder.market_impact ? hoveredStakeholder.market_impact.toFixed(1) : '0.0'}</div>
              <div><strong>Priority Score:</strong> {hoveredStakeholder.priority_score ? hoveredStakeholder.priority_score.toFixed(1) : '0.0'}</div>
              <div><strong>External Score:</strong> {hoveredStakeholder.external_score ? hoveredStakeholder.external_score.toFixed(1) : '0.0'}</div>
              {hoveredStakeholder.has_survey_data && (
                <div><strong>Survey Score:</strong> {hoveredStakeholder.survey_score ? hoveredStakeholder.survey_score.toFixed(1) : '0.0'}</div>
              )}
              {hoveredStakeholder.has_sentiment_data && (
                <div><strong>Sentiment Score:</strong> {hoveredStakeholder.sentiment_score ? hoveredStakeholder.sentiment_score.toFixed(1) : '0.0'}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quadrant Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quadrants.map((quadrant) => (
          <div key={quadrant.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${quadrant.color}`}></div>
              <h3 className="font-semibold text-gray-900">{quadrant.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{quadrant.description}</p>
            <div className="text-2xl font-bold text-gray-900">
              {quadrant.stakeholders.length}
            </div>
            <div className="text-sm text-gray-500">stakeholders</div>
          </div>
        ))}
      </div>

      {/* Top Priorities Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Priorities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stakeholder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quadrant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Digital Readiness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Impact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData
                .sort((a, b) => b.priority_score - a.priority_score)
                .slice(0, 10)
                .map((stakeholder, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleStakeholderClick(stakeholder)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stakeholder.stakeholder_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stakeholder.sector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stakeholder.quadrant === 'Quick Wins' ? 'bg-green-100 text-green-800' :
                        stakeholder.quadrant === 'Strategic Investment' ? 'bg-blue-100 text-blue-800' :
                        stakeholder.quadrant === 'Individual Focus' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stakeholder.quadrant}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.priority_score ? stakeholder.priority_score.toFixed(1) : '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.individual_readiness ? stakeholder.individual_readiness.toFixed(1) : '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stakeholder.market_impact ? stakeholder.market_impact.toFixed(1) : '0.0'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositioningOpportunities;
