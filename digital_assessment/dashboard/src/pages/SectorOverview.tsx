import { Link } from 'react-router-dom';
import { useDashboardData, usePlatformAdoptionBySector } from '../services/api';

export default function SectorOverview() {
  const { data, isLoading, error } = useDashboardData();
  const { data: platformData, isLoading: platformLoading } = usePlatformAdoptionBySector();

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

  // Sort sectors by average combined score
  const sortedSectors = [...data.sectors].sort((a, b) => b.avgCombined - a.avgCombined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900">Sector Analysis</h1>
        <p className="text-gray-600 mt-2">
          Compare performance across different sectors and identify strengths and opportunities
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Sectors</p>
          <p className="text-2xl font-bold text-gray-900">{data.sectors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Top Performing Sector</p>
          <p className="text-lg font-bold text-gray-900">{sortedSectors[0]?.sector}</p>
          <p className="text-sm text-gray-600">{sortedSectors[0]?.avgCombined.toFixed(1)}% avg</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Participants</p>
          <p className="text-2xl font-bold text-gray-900">{data.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Avg Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.sectors.reduce((sum, s) => sum + s.completionRate, 0) / data.sectors.length).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Platform Adoption by Sector */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Platform Adoption by Sector</h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare social media and digital platform adoption across sectors. 
          Higher percentages indicate more comprehensive digital presence within that sector.
        </p>
        {platformLoading ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : platformData ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      Sector
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      🌐 Website
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      📘 Facebook
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      📸 Instagram
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ▶️ YouTube
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      🎵 TikTok
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {platformData.sectors.map((sector: any) => (
                    <tr key={sector.sector} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                        {sector.sector}
                        <div className="text-xs text-gray-500">{sector.total} stakeholders</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
                          sector.platforms.website >= 70 ? 'bg-green-100 text-green-900' :
                          sector.platforms.website >= 40 ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          <span className="text-lg font-bold">{sector.platforms.website}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
                          sector.platforms.facebook >= 70 ? 'bg-green-100 text-green-900' :
                          sector.platforms.facebook >= 40 ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          <span className="text-lg font-bold">{sector.platforms.facebook}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
                          sector.platforms.instagram >= 70 ? 'bg-green-100 text-green-900' :
                          sector.platforms.instagram >= 40 ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          <span className="text-lg font-bold">{sector.platforms.instagram}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
                          sector.platforms.youtube >= 70 ? 'bg-green-100 text-green-900' :
                          sector.platforms.youtube >= 40 ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          <span className="text-lg font-bold">{sector.platforms.youtube}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${
                          sector.platforms.tiktok >= 70 ? 'bg-green-100 text-green-900' :
                          sector.platforms.tiktok >= 40 ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          <span className="text-lg font-bold">{sector.platforms.tiktok}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>≥70% adoption</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>40-69% adoption</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>&lt;40% adoption</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSectors.map((sector) => {
          // Get top 3 participants for this sector
          const sectorParticipants = data.participants
            .filter(p => p.sector === sector.sector)
            .sort((a, b) => b.combined - a.combined)
            .slice(0, 3);

          return (
            <Link
              key={sector.sector}
              to={`/sectors/${encodeURIComponent(sector.sector)}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              style={{ borderTop: `4px solid ${sector.sector.includes('Tour') ? '#1565c0' : '#7b1fa2'}` }}
            >
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-heading font-semibold">{sector.sector}</h2>
                  <p className="text-sm text-gray-600 mt-1">Participants: {sector.count}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">External</p>
                    <p className="text-lg font-bold text-gray-900">{sector.avgExternal.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Survey</p>
                    <p className="text-lg font-bold text-gray-900">{sector.avgSurvey.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Combined</p>
                    <p className="text-lg font-bold text-primary">{sector.avgCombined.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Completion</span>
                    <span className="text-gray-900 font-medium">{sector.completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${sector.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {sectorParticipants.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Top 3 Performers:</p>
                    <div className="space-y-1">
                      {sectorParticipants.map((participant, idx) => (
                        <div key={participant.name} className="flex items-center justify-between text-sm">
                          <span className="flex-1 text-gray-700 truncate">
                            {idx + 1}. {participant.name}
                          </span>
                          <span className="text-gray-900 font-medium ml-2">
                            {participant.combined}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with call-to-action */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                <span className="text-sm text-primary font-medium hover:text-blue-700 hover:underline">
                  View detailed analysis →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

