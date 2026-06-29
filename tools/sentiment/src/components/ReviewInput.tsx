import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import ThemesPreview from './ThemesPreview';
import Papa from 'papaparse';

interface ReviewInputProps {
  onAnalyze: (review: string) => void;
  onAnalyzeBatch?: (reviews: string[]) => void;
}

export default function ReviewInput({ onAnalyze, onAnalyzeBatch }: ReviewInputProps) {
  const [review, setReview] = useState('');
  const [multipleReviewsMode, setMultipleReviewsMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const findReviewColumn = (headers: string[]): string | null => {
    // Common column names for review text
    const reviewColumnNames = [
      'review_text', 'review', 'text', 'content', 'comment', 
      'reviewText', 'reviewContent', 'description',
      'feedback', 'review_body', 'body', 'message'
    ];
    
    for (const header of headers) {
      const headerLower = header.toLowerCase().trim();
      if (reviewColumnNames.some(name => headerLower === name.toLowerCase())) {
        return header;
      }
    }
    
    // If no match, try to find any column that might contain text
    // Check first row to see which column has the longest text
    return null;
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a CSV file (.csv extension)');
      return;
    }

    setCsvUploading(true);
    setCsvError(null);
    setCsvSuccess(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, any>[];
          
          if (data.length === 0) {
            setCsvError('CSV file is empty or contains no valid data');
            setCsvUploading(false);
            return;
          }

          // Validate review count - set a reasonable upper limit to prevent browser crashes
          // 10,000 reviews should be fine for most use cases
          if (data.length > 10000) {
            setCsvError(`CSV contains ${data.length} reviews. Maximum allowed is 10,000 reviews. Please split your file.`);
            setCsvUploading(false);
            return;
          }

          // Find the review text column
          const headers = Object.keys(data[0]);
          const reviewColumn = findReviewColumn(headers);

          if (!reviewColumn) {
            // Try to auto-detect by finding the column with longest average text
            let maxAvgLength = 0;
            let detectedColumn = headers[0];
            
            for (const header of headers) {
              const avgLength = data
                .slice(0, Math.min(10, data.length))
                .reduce((sum, row) => sum + (String(row[header] || '').length), 0) / Math.min(10, data.length);
              
              if (avgLength > maxAvgLength) {
                maxAvgLength = avgLength;
                detectedColumn = header;
              }
            }

            if (maxAvgLength < 20) {
              setCsvError(`Could not find review text column. Please ensure your CSV has a column named 'review_text', 'review', 'text', or 'content'. Available columns: ${headers.join(', ')}`);
              setCsvUploading(false);
              return;
            }

            // Use detected column
            const reviews = data
              .map(row => String(row[detectedColumn] || '').trim())
              .filter(text => text.length > 0);

            if (reviews.length === 0) {
              setCsvError(`No review text found in column '${detectedColumn}'. Please check your CSV format.`);
              setCsvUploading(false);
              return;
            }

            if (onAnalyzeBatch) {
              onAnalyzeBatch(reviews);
              setCsvSuccess(`Successfully loaded ${reviews.length} reviews from CSV (detected column: ${detectedColumn})`);
            } else {
              // Fallback: analyze first review
              onAnalyze(reviews[0]);
              setCsvSuccess(`Loaded ${reviews.length} reviews. Analyzing first review. Batch processing requires login.`);
            }
          } else {
            // Extract reviews from identified column
            const reviews = data
              .map(row => String(row[reviewColumn] || '').trim())
              .filter(text => text.length > 0);

            if (reviews.length === 0) {
              setCsvError(`No review text found in column '${reviewColumn}'. Please check your CSV format.`);
              setCsvUploading(false);
              return;
            }

            if (onAnalyzeBatch) {
              onAnalyzeBatch(reviews);
              setCsvSuccess(`Successfully loaded ${reviews.length} reviews from CSV`);
            } else {
              // Fallback: analyze first review
              onAnalyze(reviews[0]);
              setCsvSuccess(`Loaded ${reviews.length} reviews. Analyzing first review. Batch processing requires login.`);
            }
          }

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('CSV parsing error:', error);
          setCsvError(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setCsvUploading(false);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setCsvError(`Error reading CSV file: ${error.message}`);
        setCsvUploading(false);
      }
    });
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
            ? 'Upload a CSV file or paste reviews to analyze sentiment and detect themes'
            : 'Enter a single review to analyze sentiment and detect themes'}
        </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700">
              Review Text
            </label>
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={csvUploading}
                className="hidden"
              />
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                📄 Upload CSV
              </span>
            </label>
          </div>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your review here..."
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {review.length} characters
            </p>
            {csvUploading && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing CSV...
              </div>
            )}
          </div>
          {csvError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              ⚠️ {csvError}
            </div>
          )}
          {csvSuccess && (
            <div className="mt-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2">
              ✓ {csvSuccess}
            </div>
          )}
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

