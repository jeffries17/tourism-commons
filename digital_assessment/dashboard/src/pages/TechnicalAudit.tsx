import { useTechnicalAudits, useTechnicalHealthSummary } from '../services/api';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import Tooltip from '../components/common/Tooltip';

export default function TechnicalAudit() {
  const { data: audits, isLoading: auditsLoading } = useTechnicalAudits();
  const { data: summary, isLoading: summaryLoading } = useTechnicalHealthSummary();

  if (auditsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading technical audit data...</div>
      </div>
    );
  }

  if (!audits || !summary) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No technical audit data available.</p>
        <p className="text-sm text-yellow-600 mt-2">
          Technical audits are only available for stakeholders with active websites.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-600 text-white';
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-yellow-500 text-white';
    return 'bg-red-600 text-white';
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'Excellent') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'Good') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'Needs Improvement') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Sort by overall performance
  const sortedAudits = [...audits].sort((a, b) => {
    const avgA = (a.performanceScore + a.seoScore + a.accessibilityScore + a.bestPracticesScore) / 4;
    const avgB = (b.performanceScore + b.seoScore + b.accessibilityScore + b.bestPracticesScore) / 4;
    return avgB - avgA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          Technical Website Audit
        </h1>
        <p className="text-gray-600">
          Technical performance, SEO, accessibility, and best practices analysis for stakeholder websites.
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
              Executive Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Websites Audited</p>
                <p className="text-3xl font-bold text-blue-600">{summary.totalWebsites}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">
                  Average{' '}
                  <Tooltip content="PageSpeed Insights performance score measuring site speed and optimization">
                    <span className="border-b-2 border-dotted border-gray-400 cursor-help">Performance</span>
                  </Tooltip>
                </p>
                <p className="text-3xl font-bold text-blue-600">{summary.averagePerformance}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">
                  Average{' '}
                  <Tooltip content="Search Engine Optimization - technical factors affecting search ranking">
                    <span className="border-b-2 border-dotted border-gray-400 cursor-help">SEO</span>
                  </Tooltip>
                </p>
                <p className="text-3xl font-bold text-blue-600">{summary.averageSEO}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-600">Excellent Sites</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{summary.excellentSites}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-gray-600">Critical Issues</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{summary.criticalIssuesTotal}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Last audit: {new Date(summary.lastAuditDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Site Results */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-heading font-semibold mb-4">
          Individual Website Results
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Detailed technical audit results for each stakeholder website, ranked by overall performance.
        </p>

        <div className="space-y-4">
          {sortedAudits.map((audit, index) => {
            const avgScore = Math.round(
              (audit.performanceScore + audit.seoScore + audit.accessibilityScore + audit.bestPracticesScore) / 4
            );

            return (
              <div
                key={audit.stakeholderName}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getScoreColor(avgScore)}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                      <Link
                        to={`/participant/${encodeURIComponent(audit.stakeholderName)}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {audit.stakeholderName}
                      </Link>
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusBadgeColor(audit.overallStatus)}`}>
                        {audit.overallStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a
                        href={audit.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate max-w-md"
                      >
                        {audit.website}
                      </a>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreBadgeColor(avgScore)}`}>
                    {avgScore}
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Performance</p>
                    <p className={`text-lg font-bold ${audit.performanceScore >= 70 ? 'text-green-600' : audit.performanceScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {audit.performanceScore}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">SEO</p>
                    <p className={`text-lg font-bold ${audit.seoScore >= 70 ? 'text-green-600' : audit.seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {audit.seoScore}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Accessibility</p>
                    <p className={`text-lg font-bold ${audit.accessibilityScore >= 70 ? 'text-green-600' : audit.accessibilityScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {audit.accessibilityScore}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1">Best Practices</p>
                    <p className={`text-lg font-bold ${audit.bestPracticesScore >= 70 ? 'text-green-600' : audit.bestPracticesScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {audit.bestPracticesScore}
                    </p>
                  </div>
                </div>

                {/* Issues Summary */}
                {audit.totalIssues > 0 && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-gray-600 font-medium">Issues:</span>
                    {audit.criticalIssues > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                        🔴 {audit.criticalIssues} Critical
                      </span>
                    )}
                    {audit.highIssues > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                        🟠 {audit.highIssues} High
                      </span>
                    )}
                    {audit.mediumIssues > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                        🟡 {audit.mediumIssues} Medium
                      </span>
                    )}
                    {audit.lowIssues > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        🔵 {audit.lowIssues} Low
                      </span>
                    )}
                  </div>
                )}

                {/* Top Issues */}
                {(audit.topIssue1 || audit.topIssue2 || audit.topIssue3) && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Top Issues:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {audit.topIssue1 && <li>• {audit.topIssue1}</li>}
                      {audit.topIssue2 && <li>• {audit.topIssue2}</li>}
                      {audit.topIssue3 && <li>• {audit.topIssue3}</li>}
                    </ul>
                  </div>
                )}

                {/* Technical Indicators */}
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${audit.httpsEnabled === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {audit.httpsEnabled === 'Yes' ? '🔒 HTTPS' : '⚠️ No HTTPS'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${audit.mobileResponsive === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {audit.mobileResponsive === 'Yes' ? '📱 Mobile Friendly' : '⚠️ Not Mobile Friendly'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${audit.hasMetaDescription === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {audit.hasMetaDescription === 'Yes' ? '📝 Meta Description' : '⚠️ Missing Meta'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">About This Audit</h3>
        <p className="text-sm text-gray-600 mb-3">
          This technical audit was conducted using Google's PageSpeed Insights API, which analyzes:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><strong>Performance:</strong> Page load speed, optimization, and user experience metrics</li>
          <li><strong>SEO:</strong> Search engine optimization factors like meta tags, mobile-friendliness, and crawlability</li>
          <li><strong>Accessibility:</strong> WCAG compliance and usability for users with disabilities</li>
          <li><strong>Best Practices:</strong> Security, modern web standards, and development best practices</li>
        </ul>
        <p className="text-sm text-gray-600 mt-3">
          Scores range from 0-100, with 90+ being excellent, 70-89 good, 50-69 needing improvement, and below 50 requiring urgent attention.
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> These scores measure technical performance (site speed, SEO structure, accessibility) based on Google's PageSpeed Insights. 
            Actual content quality and relevance may not be reflected in these metrics.
          </p>
        </div>
      </div>
    </div>
  );
}

