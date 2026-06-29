import { SentimentResult } from '../utils/sentimentAnalysis';

interface HighlightedReviewProps {
  review: string;
  sentimentResult: SentimentResult;
}

export default function HighlightedReview({ review, sentimentResult }: HighlightedReviewProps) {
  // Create sets of positive and negative words for quick lookup
  const positiveWordsSet = new Set(sentimentResult.positive.map(w => w.toLowerCase()));
  const negativeWordsSet = new Set(sentimentResult.negative.map(w => w.toLowerCase()));

  // Split review into words while preserving punctuation and whitespace
  const renderHighlightedText = () => {
    // Use a regex that captures words and separators
    const parts = review.split(/(\b|\s+|[.,!?;:()\[\]{}'"-])/);
    
    return parts.map((part, index) => {
      // Skip empty strings and whitespace-only parts
      if (!part || /^\s+$/.test(part)) {
        return <span key={index}>{part}</span>;
      }
      
      // Skip punctuation-only parts
      if (/^[.,!?;:()\[\]{}'"-]+$/.test(part)) {
        return <span key={index}>{part}</span>;
      }
      
      // Clean word for lookup (remove punctuation, lowercase)
      const cleanWord = part.replace(/[^\w]/g, '').toLowerCase();
      
      // Skip if empty after cleaning
      if (!cleanWord) {
        return <span key={index}>{part}</span>;
      }
      
      // Check if word is positive or negative
      const isPositive = positiveWordsSet.has(cleanWord);
      const isNegative = negativeWordsSet.has(cleanWord);
      
      if (isPositive) {
        return (
          <span
            key={index}
            className="font-medium px-0.5 rounded"
            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
          >
            {part}
          </span>
        );
      } else if (isNegative) {
        return (
          <span
            key={index}
            className="font-medium px-0.5 rounded"
            style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
          >
            {part}
          </span>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Review Text Analysis</h3>
      <div className="prose max-w-none">
        <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
          {renderHighlightedText()}
        </p>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
          <span className="text-gray-600">Positive words</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
          <span className="text-gray-600">Negative words</span>
        </div>
      </div>
    </div>
  );
}

