import { useStakeholderTechnicalAudit } from '../../services/api';
import { Activity, ExternalLink } from 'lucide-react';

interface TechnicalHealthBadgeProps {
  stakeholderName: string;
  compact?: boolean;
}

export default function TechnicalHealthBadge({ stakeholderName, compact = false }: TechnicalHealthBadgeProps) {
  const { data: audit, isLoading } = useStakeholderTechnicalAudit(stakeholderName);

  // Don't show anything if loading or no audit data
  if (isLoading || !audit) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  };

  const getOverallColor = (status: string) => {
    if (status === 'Excellent' || status === 'Good') return 'text-green-700 bg-green-50 border-green-200';
    if (status === 'Fair') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (status === 'Inaccessible') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  // Compact version for cards/lists
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Activity className="h-4 w-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Website:</span>
          <span className={`font-medium ${getScoreColor(audit.performanceScore).split(' ')[0]}`}>
            {getScoreEmoji(audit.performanceScore)} {audit.performanceScore}/100
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">SEO:</span>
          <span className={`font-medium ${getScoreColor(audit.seoScore).split(' ')[0]}`}>
            {getScoreEmoji(audit.seoScore)} {audit.seoScore}/100
          </span>
        </div>
      </div>
    );
  }

  // Full version for detail pages
  return (
    <div className={`border rounded-lg p-4 ${getOverallColor(audit.overallStatus)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h4 className="font-semibold">Technical Performance</h4>
          </div>
          <p className="text-xs mt-1 opacity-80">
            Last audited: {new Date(audit.auditDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getOverallColor(audit.overallStatus)}`}>
          {audit.overallStatus}
        </span>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`rounded-lg p-3 ${getScoreColor(audit.performanceScore)}`}>
          <div className="text-xs opacity-80 mb-1">Performance</div>
          <div className="text-lg font-bold">
            {getScoreEmoji(audit.performanceScore)} {audit.performanceScore}
          </div>
          <div className="text-xs mt-1">{audit.performanceStatus}</div>
        </div>

        <div className={`rounded-lg p-3 ${getScoreColor(audit.seoScore)}`}>
          <div className="text-xs opacity-80 mb-1">SEO</div>
          <div className="text-lg font-bold">
            {getScoreEmoji(audit.seoScore)} {audit.seoScore}
          </div>
          <div className="text-xs mt-1">{audit.seoStatus}</div>
        </div>

        <div className={`rounded-lg p-3 ${getScoreColor(audit.accessibilityScore)}`}>
          <div className="text-xs opacity-80 mb-1">Accessibility</div>
          <div className="text-lg font-bold">
            {getScoreEmoji(audit.accessibilityScore)} {audit.accessibilityScore}
          </div>
        </div>

        <div className={`rounded-lg p-3 ${getScoreColor(audit.bestPracticesScore)}`}>
          <div className="text-xs opacity-80 mb-1">Best Practices</div>
          <div className="text-lg font-bold">
            {getScoreEmoji(audit.bestPracticesScore)} {audit.bestPracticesScore}
          </div>
        </div>
      </div>

      {/* Quick Checks */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">HTTPS</span>
          <span className={`font-medium ${audit.httpsEnabled === 'Yes' ? 'text-green-700' : 'text-red-700'}`}>
            {audit.httpsEnabled === 'Yes' ? '✓ Enabled' : '✗ Missing'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Mobile Responsive</span>
          <span className={`font-medium ${audit.mobileResponsive === 'Yes' ? 'text-green-700' : 'text-red-700'}`}>
            {audit.mobileResponsive === 'Yes' ? '✓ Yes' : '✗ No'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Meta Description</span>
          <span className={`font-medium ${audit.hasMetaDescription === 'Yes' ? 'text-green-700' : 'text-red-700'}`}>
            {audit.hasMetaDescription === 'Yes' ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
      </div>

      {/* Issues Summary */}
      {audit.totalIssues > 0 && (
        <div className="pt-3 border-t border-current border-opacity-20">
          <div className="text-xs opacity-80 mb-2">Issues Found:</div>
          <div className="flex gap-3 text-xs">
            {audit.criticalIssues > 0 && (
              <span className="font-medium text-red-700">
                {audit.criticalIssues} Critical
              </span>
            )}
            {audit.highIssues > 0 && (
              <span className="font-medium text-orange-700">
                {audit.highIssues} High
              </span>
            )}
            {audit.mediumIssues > 0 && (
              <span className="font-medium text-yellow-700">
                {audit.mediumIssues} Medium
              </span>
            )}
          </div>
          
          {/* Top Issue */}
          {audit.topIssue1 && (
            <div className="mt-2 text-xs">
              <span className="opacity-80">Top issue:</span>{' '}
              <span className="font-medium">{audit.topIssue1}</span>
            </div>
          )}
        </div>
      )}

      {/* Website Link */}
      {audit.website && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <a
            href={audit.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View Website
          </a>
        </div>
      )}
    </div>
  );
}

