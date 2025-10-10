import { useSectorBaseline } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SectorBaselineProps {
  sectorName: string;
}

export default function SectorBaseline({ sectorName }: SectorBaselineProps) {
  const { data: baseline, isLoading, error } = useSectorBaseline(sectorName);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !baseline) {
    return null; // Gracefully hide if baseline data unavailable
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Sector Baseline
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Common patterns and benchmarks across {baseline.totalStakeholders} stakeholders in this sector
        </p>
      </div>

      {/* Digital Presence */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Digital Presence</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">🌐</span>
              <span className="text-lg font-bold text-blue-900">
                {baseline.digitalPresence.percentWithWebsite}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">Website</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withWebsite} of {baseline.totalStakeholders}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">📘</span>
              <span className="text-lg font-bold text-blue-900">
                {baseline.digitalPresence.percentWithFacebook}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">Facebook</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withFacebook} of {baseline.totalStakeholders}
            </p>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">📸</span>
              <span className="text-lg font-bold text-pink-900">
                {baseline.digitalPresence.percentWithInstagram}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">Instagram</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withInstagram} of {baseline.totalStakeholders}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">✈️</span>
              <span className="text-lg font-bold text-green-900">
                {baseline.digitalPresence.percentWithTripAdvisor}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">TripAdvisor</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withTripAdvisor} of {baseline.totalStakeholders}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">▶️</span>
              <span className="text-lg font-bold text-red-900">
                {baseline.digitalPresence.percentWithYoutube}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">YouTube</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withYoutube} of {baseline.totalStakeholders}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">🎵</span>
              <span className="text-lg font-bold text-purple-900">
                {baseline.digitalPresence.percentWithTiktok}%
              </span>
            </div>
            <p className="text-xs text-gray-700 font-medium">TikTok</p>
            <p className="text-xs text-gray-600">
              {baseline.digitalPresence.withTiktok} of {baseline.totalStakeholders}
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Reach - Consolidated */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Social Media Reach</h4>
        
        {(baseline.socialMediaReach.avgFacebookFollowers > 0 || 
          baseline.socialMediaReach.avgInstagramFollowers > 0 || 
          baseline.socialMediaReach.avgTripAdvisorReviews > 0 ||
          baseline.socialMediaReach.avgYoutubeSubscribers > 0 ||
          baseline.socialMediaReach.avgTiktokFollowers > 0) ? (
          <>
            {/* Summary Grid - Compact View */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {baseline.socialMediaReach.totalFacebookFollowers > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-center">
                  <span className="text-2xl block mb-1">📘</span>
                  <p className="text-lg font-bold text-blue-900">
                    {baseline.socialMediaReach.totalFacebookFollowers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">Facebook</p>
                  <p className="text-xs text-gray-600">
                    ~{Math.round(baseline.socialMediaReach.avgFacebookFollowers).toLocaleString()} avg
                  </p>
                </div>
              )}
              
              {baseline.socialMediaReach.totalInstagramFollowers > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg border border-pink-200 text-center">
                  <span className="text-2xl block mb-1">📸</span>
                  <p className="text-lg font-bold text-pink-900">
                    {baseline.socialMediaReach.totalInstagramFollowers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">Instagram</p>
                  <p className="text-xs text-gray-600">
                    ~{Math.round(baseline.socialMediaReach.avgInstagramFollowers).toLocaleString()} avg
                  </p>
                </div>
              )}
              
              {baseline.socialMediaReach.totalTripAdvisorReviews > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 text-center">
                  <span className="text-2xl block mb-1">✈️</span>
                  <p className="text-lg font-bold text-green-900">
                    {baseline.socialMediaReach.totalTripAdvisorReviews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">TripAdvisor</p>
                  <p className="text-xs text-gray-600">
                    ~{Math.round(baseline.socialMediaReach.avgTripAdvisorReviews).toLocaleString()} avg
                  </p>
                </div>
              )}
              
              {baseline.socialMediaReach.totalYoutubeSubscribers > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200 text-center">
                  <span className="text-2xl block mb-1">▶️</span>
                  <p className="text-lg font-bold text-red-900">
                    {baseline.socialMediaReach.totalYoutubeSubscribers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">YouTube</p>
                  <p className="text-xs text-gray-600">
                    ~{Math.round(baseline.socialMediaReach.avgYoutubeSubscribers).toLocaleString()} avg
                  </p>
                </div>
              )}
              
              {baseline.socialMediaReach.totalTiktokFollowers > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 text-center">
                  <span className="text-2xl block mb-1">🎵</span>
                  <p className="text-lg font-bold text-purple-900">
                    {baseline.socialMediaReach.totalTiktokFollowers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700">TikTok</p>
                  <p className="text-xs text-gray-600">
                    ~{Math.round(baseline.socialMediaReach.avgTiktokFollowers).toLocaleString()} avg
                  </p>
                </div>
              )}
            </div>

            {/* Stacked Bar Chart - Comparative View */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Total Reach by Platform</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Total Reach',
                        Facebook: baseline.socialMediaReach.totalFacebookFollowers,
                        Instagram: baseline.socialMediaReach.totalInstagramFollowers,
                        TripAdvisor: baseline.socialMediaReach.totalTripAdvisorReviews,
                        YouTube: baseline.socialMediaReach.totalYoutubeSubscribers,
                        TikTok: baseline.socialMediaReach.totalTiktokFollowers,
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(value: number) => value.toLocaleString()}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Facebook" stackId="a" fill="#1877f2" />
                    <Bar dataKey="Instagram" stackId="a" fill="#E4405F" />
                    <Bar dataKey="TripAdvisor" stackId="a" fill="#00AF87" />
                    <Bar dataKey="YouTube" stackId="a" fill="#FF0000" />
                    <Bar dataKey="TikTok" stackId="a" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Combined sector reach: {(
                  baseline.socialMediaReach.totalFacebookFollowers +
                  baseline.socialMediaReach.totalInstagramFollowers +
                  baseline.socialMediaReach.totalTripAdvisorReviews +
                  baseline.socialMediaReach.totalYoutubeSubscribers +
                  baseline.socialMediaReach.totalTiktokFollowers
                ).toLocaleString()} total followers/reviews/subscribers
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No social media reach data available for this sector</p>
            <p className="text-sm text-gray-500 mt-1">
              Stakeholders in this sector haven't provided follower/subscriber counts yet
            </p>
          </div>
        )}
      </div>

      {/* Common Patterns */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Common Patterns</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700 mb-1">Avg Platforms Used</p>
            <p className="text-3xl font-bold text-purple-900">
              {baseline.commonPatterns.avgPlatformsPerStakeholder}
            </p>
            <p className="text-xs text-gray-600 mt-1">platforms per stakeholder</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <p className="text-sm text-gray-700 mb-1">Most Popular Platform</p>
            <p className="text-2xl font-bold text-indigo-900">
              {baseline.commonPatterns.mostPopularPlatform}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {baseline.commonPatterns.platformPopularity[0]?.count} stakeholders
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <p className="text-sm text-gray-700 mb-2">Platform Adoption</p>
            <div className="space-y-1">
              {baseline.commonPatterns.platformPopularity.slice(0, 3).map((platform, idx) => (
                <div key={platform.name} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700">
                    {idx + 1}. {platform.name}
                  </span>
                  <span className="font-semibold text-teal-900">
                    {Math.round((platform.count / baseline.totalStakeholders) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Box */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          Baseline Insights
        </h5>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>{baseline.commonPatterns.avgPlatformsPerStakeholder} platforms</strong> per stakeholder on average
              {baseline.commonPatterns.avgPlatformsPerStakeholder < 2 && 
                ' - consider expanding to more channels for wider reach'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>{baseline.commonPatterns.mostPopularPlatform}</strong> is the most widely adopted platform
            </span>
          </li>
          {baseline.socialMediaReach.avgFacebookFollowers > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Facebook pages average <strong>{baseline.socialMediaReach.avgFacebookFollowers.toLocaleString()} followers</strong>
              </span>
            </li>
          )}
          {baseline.socialMediaReach.avgInstagramFollowers > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                Instagram accounts average <strong>{baseline.socialMediaReach.avgInstagramFollowers.toLocaleString()} followers</strong>
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

