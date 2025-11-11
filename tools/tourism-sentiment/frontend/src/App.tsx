import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import ReviewInput from './components/ReviewInput';
import ResultsDisplay from './components/ResultsDisplay';
import InlineReviewInput from './components/InlineReviewInput';
import LandingPage from './components/LandingPage';
import { saveSession, updateSession, ReviewSession } from './services/sessionService';

function SentimentAnalysisPage() {
  const { user, isAuthenticated } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number | null>(null);
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single'); // 'single' or 'all'
  const [sessionName, setSessionName] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGetStarted = () => {
    // Mark that user clicked "Get Started" to show input field
    setHasClickedGetStarted(true);
    // Scroll to top smoothly when getting started
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Don't hide landing page - keep it visible below
  };

  const handleAnalyze = (reviewText: string) => {
    setShowLanding(false);
    if (reviews.length === 0) {
      // First review
      setReviews([reviewText]);
      setCurrentReviewIndex(0);
      setViewMode('single');
    } else {
      // Add new review
      setReviews([...reviews, reviewText]);
      setCurrentReviewIndex(reviews.length);
      setShowInlineInput(false);
      setViewMode('single');
    }
  };

  const handleAddReview = (reviewText: string) => {
    setReviews([...reviews, reviewText]);
    setShowInlineInput(false);
    // Keep current view
  };

  const handleRemoveReview = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent tab click
    }
    const newReviews = reviews.filter((_, i) => i !== index);
    setReviews(newReviews);
    if (newReviews.length === 0) {
      setCurrentReviewIndex(null);
      setViewMode('single');
    } else {
      // Adjust current index
      if (currentReviewIndex === null) {
        // If viewing "all", stay in "all" mode
        if (viewMode === 'all') {
          // Keep in all mode
        } else {
          setCurrentReviewIndex(0);
        }
      } else if (currentReviewIndex === index) {
        // Removed current review, switch to previous or first
        setCurrentReviewIndex(Math.max(0, index - 1));
      } else if (currentReviewIndex > index) {
        // Adjust index down
        setCurrentReviewIndex(currentReviewIndex - 1);
      }
    }
  };

  const getDisplayReview = () => {
    if (viewMode === 'all' && reviews.length > 0) {
      // Combine all reviews with separators
      return reviews.join('\n\n--- Review ---\n\n');
    }
    return currentReviewIndex !== null ? reviews[currentReviewIndex] : '';
  };

  const handleLoadSession = (session: ReviewSession) => {
    setReviews(session.reviews);
    setSessionName(session.name);
    setCurrentSessionId(session.id || null);
    setCurrentReviewIndex(session.reviews.length > 0 ? 0 : null);
    setViewMode('single');
    setShowInlineInput(false);
    setShowLanding(false);
    setHasClickedGetStarted(true);
  };

  const handleSaveSession = async () => {
    if (!isAuthenticated || !user || reviews.length === 0) {
      alert('Please login and add at least one review to save.');
      return;
    }

    if (!sessionName.trim()) {
      alert('Please enter a name for this session.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentSessionId) {
        // Update existing session
        await updateSession(currentSessionId, sessionName.trim(), reviews);
      } else {
        // Create new session
        const sessionId = await saveSession(user.uid, sessionName.trim(), reviews);
        setCurrentSessionId(sessionId);
      }
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLoadSession={handleLoadSession} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Show review input at top if user clicked "Get Started" */}
        {hasClickedGetStarted && currentReviewIndex === null && reviews.length === 0 && (
          <div className="mb-8">
            <ReviewInput onAnalyze={handleAnalyze} />
          </div>
        )}

        {/* Show results if we have reviews */}
        {currentReviewIndex !== null || reviews.length > 0 ? (
          <div>
            {/* Session Name and Save */}
            {isAuthenticated && reviews.length > 0 && (
              <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Name
                    </label>
                    <input
                      id="session-name"
                      type="text"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="e.g., Hotel Reviews - January 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSaveSession}
                      disabled={isSaving || !sessionName.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      {isSaving ? 'Saving...' : currentSessionId ? '💾 Update Session' : '💾 Save Session'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setShowInlineInput(!showInlineInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>+</span> Add Another Review
              </button>
              {reviews.length > 1 && (
                <>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">View:</span>
                    <button
                      onClick={() => {
                        setViewMode('single');
                        if (currentReviewIndex === null) setCurrentReviewIndex(0);
                      }}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        viewMode === 'single'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('all');
                        setCurrentReviewIndex(null);
                      }}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        viewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All Reviews ({reviews.length})
                    </button>
                  </div>
                  {viewMode === 'single' && (
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600">Review:</span>
                      {reviews.map((_, idx) => (
                        <div key={idx} className="relative group">
                          <button
                            onClick={() => setCurrentReviewIndex(idx)}
                            className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                              currentReviewIndex === idx
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {idx + 1}
                          </button>
                          <button
                            onClick={(e) => handleRemoveReview(idx, e)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                            aria-label={`Remove review ${idx + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setReviews([]);
                  setCurrentReviewIndex(null);
                  setShowInlineInput(false);
                  setViewMode('single');
                }}
                className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Start Over
              </button>
            </div>

            {/* Inline Review Input */}
            {showInlineInput && (
              <div className="mb-6">
                <InlineReviewInput
                  onAdd={handleAddReview}
                  onCancel={() => setShowInlineInput(false)}
                />
              </div>
            )}

            {/* View Mode Indicator */}
            {reviews.length > 1 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {viewMode === 'all' ? (
                    <>📊 Analyzing all {reviews.length} reviews combined</>
                  ) : (
                    <>📊 Analyzing review {currentReviewIndex! + 1} of {reviews.length}</>
                  )}
                </p>
              </div>
            )}

            <ResultsDisplay review={getDisplayReview()} />
          </div>
        ) : (
          /* Show landing page - either standalone or below review input */
          <LandingPage onGetStarted={handleGetStarted} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/sentiment-analysis">
        <Routes>
          <Route path="/" element={<SentimentAnalysisPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

