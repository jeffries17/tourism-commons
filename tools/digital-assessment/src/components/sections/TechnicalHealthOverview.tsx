import { useTechnicalHealthSummary } from '../../services/api';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TechnicalHealthOverview() {
  const { data: summary, isLoading, error } = useTechnicalHealthSummary();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          Technical audit data not available. Run the audit to see website performance metrics.
        </p>
      </div>
    );
  }

  if (!summary) return null;

  const getPerformanceColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceEmoji = (score: number) => {
    if (score >= 70) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Technical Health Overview
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            Last Updated: {new Date(summary.lastAuditDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Websites Audited */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {summary.totalWebsites}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Websites Audited
            </div>
          </div>

          {/* Average Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${getPerformanceColor(summary.averagePerformance)}`}>
              {getPerformanceEmoji(summary.averagePerformance)} {summary.averagePerformance.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Avg Performance
            </div>
          </div>

          {/* Average SEO */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${getPerformanceColor(summary.averageSEO)}`}>
              {getPerformanceEmoji(summary.averageSEO)} {summary.averageSEO.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Avg SEO Score
            </div>
          </div>

          {/* Critical Issues */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${summary.criticalIssuesTotal > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.criticalIssuesTotal}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Critical Issues
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-3">
          {/* Excellent Sites */}
          {summary.excellentSites > 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900">
                  {summary.excellentSites} sites performing excellently
                </p>
                <p className="text-xs text-green-700 mt-1">
                  These stakeholders demonstrate strong technical implementation
                </p>
              </div>
            </div>
          )}

          {/* Poor Sites */}
          {summary.poorSites > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  {summary.poorSites} sites need optimization
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Performance scores below 50 - recommend image optimization and caching
                </p>
              </div>
            </div>
          )}

          {/* Overall Health */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Technical health monitoring active
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {summary.totalWebsites} stakeholder websites are being tracked for performance and SEO metrics
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic mb-4">
            Note: These scores are based on Google's PageSpeed Insights and measure technical performance (site speed, SEO structure, accessibility). 
            Actual content quality and relevance may not be reflected in these metrics.
          </p>
          <Link
            to="/technical-audit"
            className="inline-block w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            View Full Technical Report
          </Link>
        </div>
      </div>
    </div>
  );
}

