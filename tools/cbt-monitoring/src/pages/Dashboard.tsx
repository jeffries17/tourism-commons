import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCommunities } from '../hooks/useCommunities';
import CommunityCard from '../components/CommunityCard';
import type { CbtCommunity, CbtStats } from '../types/index';
import { generatePdf } from '../utils/pdfGenerator';

// Configuration - update this URL (could be authority-specific in the future)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1qYVMz5aUsoQZZXgt7kKI4Gw0C-MHIqBLTt4wTdZ0rCE/edit';

export default function Dashboard() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  const { user, logout } = useAuth();
  const { data: communities = [], isLoading, error } = useCommunities(authority);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate stats
  const stats: CbtStats = useMemo(() => {
    return {
      total: communities.length,
      green: communities.filter((c) => c.status === 'green').length,
      yellow: communities.filter((c) => c.status === 'yellow').length,
      red: communities.filter((c) => c.status === 'red').length,
    };
  }, [communities]);

  // Get unique regions
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(communities.map((c) => c.region))].filter(Boolean).sort();
    return uniqueRegions;
  }, [communities]);

  // Filter communities
  const filteredCommunities = useMemo(() => {
    return communities.filter((c) => {
      // Region filter
      if (filterRegion !== 'all' && c.region !== filterRegion) return false;

      // Status filter
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCommunity = c.community.toLowerCase().includes(query);
        const matchesRegion = c.region?.toLowerCase().includes(query);
        const matchesStaff = c.responsibleStaff?.toLowerCase().includes(query);
        const matchesContact = c.contactPerson?.toLowerCase().includes(query);
        if (!matchesCommunity && !matchesRegion && !matchesStaff && !matchesContact) {
          return false;
        }
      }

      return true;
    });
  }, [communities, filterRegion, filterStatus, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Communities</h2>
            <p className="text-red-700">{(error as Error).message}</p>
            <p className="text-sm text-red-600 mt-2">
              Please check that the backend API is running and the /api/cbt/communities endpoint is available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CBT Monitoring Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track community engagement activities and ensure regular contact with CBT partners.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
          <Link
            to={`/${authority}/update`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Update</span>
          </Link>
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>📊</span>
            <span>View Sheet</span>
          </a>
          <button
            onClick={() => generatePdf({
              communities,
              stats,
              title: 'CBT Monitoring Dashboard Report'
            })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>📄</span>
            <span>Download PDF</span>
          </button>
            {user?.role === 'admin' && (
              <Link
                to={`/${authority}/admin/communities`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Admin: Manage Communities
              </Link>
            )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="text-sm text-blue-800">
            Logged in as: <strong>{user.name || user.username}</strong>
            {user.role === 'admin' && <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">Admin</span>}
          </div>
        </div>
      )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Communities</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-700 mb-1">🟢 Active</div>
            <div className="text-3xl font-bold text-green-900">{stats.green}</div>
            {stats.total > 0 && (
              <div className="text-xs text-green-600 mt-1">
                {Math.round((stats.green / stats.total) * 100)}%
              </div>
            )}
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-sm text-yellow-700 mb-1">🟡 Needs Attention</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.yellow}</div>
            {stats.total > 0 && (
              <div className="text-xs text-yellow-600 mt-1">
                {Math.round((stats.yellow / stats.total) * 100)}%
              </div>
            )}
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-sm text-red-700 mb-1">🔴 Inactive</div>
            <div className="text-3xl font-bold text-red-900">{stats.red}</div>
            {stats.total > 0 && (
              <div className="text-xs text-red-600 mt-1">
                {Math.round((stats.red / stats.total) * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search by community, region, staff, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="region-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Region:
              </label>
              <select
                id="region-filter"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Status:
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="green">🟢 Active</option>
                <option value="yellow">🟡 Needs Attention</option>
                <option value="red">🔴 Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(filterRegion !== 'all' || filterStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterRegion('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCommunities.length}</span> of{' '}
            <span className="font-semibold">{communities.length}</span> communities
          </div>
        </div>

        {/* Community Cards */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading communities...</p>
            </div>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">
                {communities.length === 0
                  ? 'No communities found. Check your data source or API endpoint.'
                  : 'No communities match your filters.'}
              </p>
              {communities.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  In development mode, mock data may be shown. Configure the API endpoint or Firebase connection to load real data.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}

        {/* Info Note */}
        {!isLoading && communities.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Quick Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>🟢 Green:</strong> Updated within last 14 days
              </li>
              <li>
                <strong>🟡 Yellow:</strong> Updated 15-28 days ago
              </li>
              <li>
                <strong>🔴 Red:</strong> No update in 29+ days (inactive)
              </li>
              <li>Engagement bars show activity in the last 30 days (target: 4 engagements/month)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

