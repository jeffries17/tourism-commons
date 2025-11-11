import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import ThemesPreview from './ThemesPreview';

interface ReviewInputProps {
  onAnalyze: (review: string) => void;
}

export default function ReviewInput({ onAnalyze }: ReviewInputProps) {
  const [review, setReview] = useState('');
  const [multipleReviewsMode, setMultipleReviewsMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (review.trim()) {
      onAnalyze(review.trim());
    }
  };

  const handleExample = () => {
    const example = "What a beautiful place, very basic but so beautiful!! Cold water and toilet are fine amenities- in hot weather (and we had hot weather) you can cool off in the river. Very nice. A minus... when the wind dies down you get eaten up by hundreds of midges. So bring anti-midge and main net! There is an honesty box and you pay 7 pounds pp.";
    setReview(example);
  };

  return (
    <div className="space-y-6">
      {/* Multiple Reviews Mode Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Want to analyze multiple reviews?</h3>
            <p className="text-sm text-gray-600">
              Login to save your progress and analyze 50+ reviews at once
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={multipleReviewsMode}
              onChange={(e) => {
                setMultipleReviewsMode(e.target.checked);
                if (e.target.checked && !isAuthenticated) {
                  setShowLogin(true);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {multipleReviewsMode && isAuthenticated && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            ✓ Logged in as {user?.email || user?.displayName || 'User'}. You can now save your analysis progress.
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <Login onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Tourism Sentiment Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          {multipleReviewsMode 
            ? 'Enter reviews to analyze sentiment and detect themes (CSV upload coming soon)'
            : 'Enter a single review to analyze sentiment and detect themes'}
        </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Review Text
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your review here..."
          />
          <p className="mt-2 text-sm text-gray-500">
            {review.length} characters
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!review.trim()}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Analyze Review
          </button>
          <button
            type="button"
            onClick={handleExample}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Load Example
          </button>
        </div>
      </form>
      </div>

      {/* Themes Preview */}
      <ThemesPreview />
    </div>
  );
}

