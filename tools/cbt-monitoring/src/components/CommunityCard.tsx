import type { CbtCommunity } from '../types/index';

interface CommunityCardProps {
  community: CbtCommunity;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const statusEmoji = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴'
  };
  
  const engagementEmoji = community.engagementCount > 0 ? '✅' : '⏸️';
  const contentEmoji = community.contentCount > 0 ? '📸' : '📝';
  
  // Target: 4 engagements per month (bi-weekly = 2 per month minimum, but we track 30 days)
  const engagementPercentage = Math.min(100, (community.engagementCount / 4) * 100);
  
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColorClasses = () => {
    switch (community.status) {
      case 'green':
        return 'border-green-300 bg-green-50 hover:bg-green-100';
      case 'yellow':
        return 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100';
      case 'red':
        return 'border-red-300 bg-red-50 hover:bg-red-100';
      default:
        return 'border-gray-300 bg-white hover:bg-gray-50';
    }
  };

  const getProgressBarColor = () => {
    if (engagementPercentage >= 75) return 'bg-green-500';
    if (engagementPercentage >= 50) return 'bg-yellow-500';
    if (engagementPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`border-2 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 ${getStatusColorClasses()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {community.community}
          </h3>
          <p className="text-sm text-gray-600">{community.region}</p>
        </div>
        <div className="text-2xl ml-2 flex-shrink-0" title={`Status: ${community.status}`}>
          {statusEmoji[community.status]}
        </div>
      </div>
      
      {/* Status Info */}
      <div className="space-y-2 mb-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Last contact:</span>
          <span className="font-medium text-gray-900">
            {formatDate(community.lastUpdate)}
          </span>
          {community.daysSinceUpdate > 0 && (
            <span className="text-gray-500">
              ({community.daysSinceUpdate} {community.daysSinceUpdate === 1 ? 'day' : 'days'} ago)
            </span>
          )}
        </div>
        
        {community.nextVisit && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Next visit:</span>
            <span className="font-medium text-gray-900">
              {formatDate(community.nextVisit)}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Staff:</span>
          <span className="font-medium text-gray-900">{community.responsibleStaff}</span>
        </div>
        
        {community.contactPerson && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Contact:</span>
            <span className="font-medium text-gray-900 truncate">{community.contactPerson}</span>
          </div>
        )}
      </div>
      
      {/* Engagement Metrics */}
      <div className="space-y-2 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span>{engagementEmoji}</span>
            <span className="text-gray-700">Engagements (30d)</span>
          </span>
          <span className="font-semibold text-gray-900">{community.engagementCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${engagementPercentage}%` }}
            role="progressbar"
            aria-valuenow={engagementPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`${engagementPercentage.toFixed(0)}% of monthly target`}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="flex items-center gap-2">
            <span>{contentEmoji}</span>
            <span className="text-gray-700">Content produced</span>
          </span>
          <span className="font-semibold text-gray-900">{community.contentCount}</span>
        </div>
      </div>
    </div>
  );
}

