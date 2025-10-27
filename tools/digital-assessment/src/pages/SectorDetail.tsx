import { useParams, Link } from 'react-router-dom';
import { useDashboardData } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SectorBaseline from '../components/sections/SectorBaseline';

export default function SectorDetail() {
  const { sector } = useParams<{ sector: string }>();
  const decodedSector = decodeURIComponent(sector || '');
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading sector data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading sector data. Please try again.</p>
      </div>
    );
  }

  if (!data) return null;

  const sectorData = data.sectors.find(s => s.sector === decodedSector);
  if (!sectorData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Sector not found.</p>
      </div>
    );
  }

  // Get participants in this sector
  const sectorParticipants = data.participants
    .filter(p => p.sector === decodedSector)
    .sort((a, b) => b.combined - a.combined);

  // Calculate category averages for this sector
  const sectorCategoryAverages = {
    socialMedia: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.16), 0) / sectorParticipants.length,
    website: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.16), 0) / sectorParticipants.length,
    visualContent: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.16), 0) / sectorParticipants.length,
    discoverability: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.17), 0) / sectorParticipants.length,
    digitalSales: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.17), 0) / sectorParticipants.length,
    platformIntegration: sectorParticipants.reduce((sum, p) => sum + (p.external * 0.18), 0) / sectorParticipants.length,
  };

  // Prepare comparison chart data
  const comparisonData = [
    {
      category: 'Social Media',
      'Sector Avg': sectorCategoryAverages.socialMedia,
      'Overall Avg': data.categoryAverages.socialMedia,
    },
    {
      category: 'Website',
      'Sector Avg': sectorCategoryAverages.website,
      'Overall Avg': data.categoryAverages.website,
    },
    {
      category: 'Visual Content',
      'Sector Avg': sectorCategoryAverages.visualContent,
      'Overall Avg': data.categoryAverages.visualContent,
    },
    {
      category: 'Discoverability',
      'Sector Avg': sectorCategoryAverages.discoverability,
      'Overall Avg': data.categoryAverages.discoverability,
    },
    {
      category: 'Digital Sales',
      'Sector Avg': sectorCategoryAverages.digitalSales,
      'Overall Avg': data.categoryAverages.digitalSales,
    },
    {
      category: 'Platform Integration',
      'Sector Avg': sectorCategoryAverages.platformIntegration,
      'Overall Avg': data.categoryAverages.platformIntegration,
    },
  ];

  // Find strengths and weaknesses
  const strengths = comparisonData
    .filter(cat => cat['Sector Avg'] > cat['Overall Avg'])
    .sort((a, b) => (b['Sector Avg'] - b['Overall Avg']) - (a['Sector Avg'] - a['Overall Avg']))
    .slice(0, 3);

  const weaknesses = comparisonData
    .filter(cat => cat['Sector Avg'] < cat['Overall Avg'])
    .sort((a, b) => (a['Sector Avg'] - a['Overall Avg']) - (b['Sector Avg'] - b['Overall Avg']))
    .slice(0, 3);

  // Maturity distribution for this sector
  const maturityDist = sectorParticipants.reduce((acc: Record<string, number>, p) => {
    acc[p.maturity] = (acc[p.maturity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/sectors" className="inline-flex items-center text-primary hover:text-blue-700 hover:underline">
        ← Back to all sectors
      </Link>

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-heading font-bold text-gray-900">{decodedSector}</h1>
        <p className="text-gray-600 mt-2">
          {sectorData.count} participants · {sectorData.avgCombined.toFixed(1)}% average score
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">External Assessment</p>
          <p className="text-3xl font-bold text-gray-900">{sectorData.avgExternal.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">vs {data.overall.avgExternal.toFixed(1)}% overall</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Survey Score</p>
          <p className="text-3xl font-bold text-gray-900">{sectorData.avgSurvey.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">vs {data.overall.avgSurvey.toFixed(1)}% overall</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Combined Score</p>
          <p className="text-3xl font-bold text-primary">{sectorData.avgCombined.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">vs {data.overall.avgCombined.toFixed(1)}% overall</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-green-600">{sectorData.completionRate.toFixed(0)}%</p>
          <p className="text-xs text-gray-500 mt-1">{Math.round(sectorData.count * sectorData.completionRate / 100)} completed</p>
        </div>
      </div>

      {/* Sector vs Overall Comparison Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          {decodedSector} vs Overall Performance
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Compare how this sector performs against overall averages across all categories
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                label={{ value: 'Score (0-10)', angle: -90, position: 'insideLeft' }}
                domain={[0, 10]}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sector Avg" fill="#1565c0" radius={[8, 8, 0, 0]} barSize={40} />
              <Bar dataKey="Overall Avg" fill="#94a3b8" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            Sector Strengths
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm text-green-600 font-semibold">
                    +{(cat['Sector Avg'] - cat['Overall Avg']).toFixed(1)} vs avg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">This sector performs below average in all categories</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Growth Opportunities
          </h3>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm text-orange-600 font-semibold">
                    {(cat['Sector Avg'] - cat['Overall Avg']).toFixed(1)} vs avg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">This sector performs above average in all categories</p>
          )}
        </div>
      </div>

      {/* Sector Baseline */}
      <SectorBaseline sectorName={decodedSector} />

      {/* Maturity Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-heading font-semibold mb-4">Digital Maturity Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(maturityDist).map(([level, count]) => (
            <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{level}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((count / sectorParticipants.length) * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All Participants in Sector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-heading font-semibold mb-4">
          All Participants ({sectorParticipants.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Combined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maturity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sectorParticipants.map((participant, idx) => (
                <tr key={participant.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/participant/${encodeURIComponent(participant.name)}`}
                      className="text-sm font-medium text-primary hover:text-blue-800 hover:underline"
                    >
                      {participant.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.external}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {participant.survey}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary">
                    {participant.combined}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {participant.maturity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

