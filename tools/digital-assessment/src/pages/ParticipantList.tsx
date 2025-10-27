import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useParticipants } from '../services/api';

export default function ParticipantList() {
  const [sectorFilter, setSectorFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: participants, isLoading, error } = useParticipants();

  const filteredParticipants = useMemo(() => {
    if (!participants) return [];
    
    return participants.filter(p => {
      const matchesSector = !sectorFilter || p.sector === sectorFilter;
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [participants, sectorFilter, searchTerm]);

  const sectors = useMemo(() => {
    if (!participants) return [];
    return [...new Set(participants.map(p => p.sector))].sort();
  }, [participants]);

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

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading participants: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-gray-900">
        All Participants
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search participants..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredParticipants.length} of {participants?.length || 0} participants
      </div>

      {/* Participant List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Maturity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  Loading participants...
                </td>
              </tr>
            ) : filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No participants found
                </td>
              </tr>
            ) : (
              filteredParticipants.map((participant) => (
                <tr key={participant.name} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/participant/${encodeURIComponent(participant.name)}`}
                        className="text-sm font-medium text-primary hover:text-blue-800 hover:underline"
                      >
                        {participant.name}
                      </Link>
                      {participant.surveyTotal && participant.surveyTotal > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Survey completed">
                          📋
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{participant.sector}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {participant.combinedScore}%
                    </div>
                    {participant.surveyTotal && participant.surveyTotal > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Survey: {participant.surveyTotal}/30
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMaturityColor(participant.maturityLevel)}`}>
                        {participant.maturityLevel}
                      </span>
                      {participant.surveyTier && participant.surveyTier !== participant.maturityLevel && (
                        <span className="text-xs text-gray-500">
                          Survey: {participant.surveyTier}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/participant/${encodeURIComponent(participant.name)}`}
                      className="text-primary hover:text-blue-800 font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

