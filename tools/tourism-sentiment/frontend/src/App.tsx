import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import ReviewInput from './components/ReviewInput';
import ResultsDisplay from './components/ResultsDisplay';
import InlineReviewInput from './components/InlineReviewInput';
import LandingPage from './components/LandingPage';
import BatchInsights from './components/BatchInsights';
import ComparisonView from './components/ComparisonView';
import { saveSession, updateSession, ReviewSession } from './services/sessionService';
import Papa from 'papaparse';

function SentimentAnalysisPage() {
  const { user, isAuthenticated } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number | null>(null);
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'all' | 'insights'>('single'); // 'single', 'all', or 'insights'
  const [comparisonMode, setComparisonMode] = useState(false);
  const [batch2, setBatch2] = useState<{ reviews: string[]; name: string } | null>(null);
  const [batch1Name, setBatch1Name] = useState('Batch 1');
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

  const handleAnalyzeBatch = (reviewTexts: string[]) => {
    setShowLanding(false);
    // Filter out empty reviews
    const validReviews = reviewTexts.filter(text => text.trim().length > 0);
    
    if (validReviews.length === 0) {
      alert('No valid reviews found in CSV file');
      return;
    }

    // Set all reviews at once
    setReviews(validReviews);
    // For batch uploads with many reviews, default to insights view
    // For smaller batches, use 'all' view
    if (validReviews.length > 10) {
      setViewMode('insights');
    } else {
      setViewMode('all');
    }
    setCurrentReviewIndex(null);
    setShowInlineInput(false);
    
    // Show success message
    alert(`Successfully loaded ${validReviews.length} reviews from CSV!`);
  };

  const handleLoadBatch2 = (reviewTexts: string[]) => {
    const validReviews = reviewTexts.filter(text => text.trim().length > 0);
    if (validReviews.length === 0) {
      alert('No valid reviews found in CSV file');
      return;
    }
    setBatch2({ reviews: validReviews, name: 'Batch 2' });
    setComparisonMode(true);
    setViewMode('insights');
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
            <ReviewInput onAnalyze={handleAnalyze} onAnalyzeBatch={handleAnalyzeBatch} />
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
                    {reviews.length > 5 && (
                      <button
                        onClick={() => {
                          setViewMode('insights');
                          setCurrentReviewIndex(null);
                        }}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          viewMode === 'insights'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📊 Insights
                      </button>
                    )}
                  </div>
                  {!comparisonMode && (
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            Papa.parse(file, {
                              header: true,
                              skipEmptyLines: true,
                              complete: (results: any) => {
                                const data = results.data as Record<string, any>[];
                                if (data.length === 0) {
                                  alert('CSV file is empty or contains no valid data');
                                  return;
                                }
                                const headers = Object.keys(data[0] || {});
                                const reviewColumn = headers.find(h => 
                                  ['review_text', 'review', 'text', 'content', 'comment'].includes(h.toLowerCase())
                                ) || headers[0];
                                const reviews = data
                                  .map(row => String(row[reviewColumn] || '').trim())
                                  .filter(text => text.length > 0);
                                if (reviews.length === 0) {
                                  alert('No review text found in CSV file');
                                  return;
                                }
                                handleLoadBatch2(reviews);
                              },
                              error: (error: any) => {
                                alert(`Error reading CSV file: ${error.message}`);
                              }
                            });
                          }
                        };
                        input.click();
                      }}
                      className="px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      🔀 Compare with File
                    </button>
                  )}
                  {viewMode === 'single' && (
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-sm text-gray-600">Review:</span>
                      <div className="flex gap-1 items-center">
                        <button
                          onClick={() => setCurrentReviewIndex(Math.max(0, (currentReviewIndex || 0) - 1))}
                          disabled={currentReviewIndex === 0}
                          className="px-3 py-1 text-sm rounded transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          aria-label="Previous review"
                        >
                          ←
                        </button>
                        <div className="flex items-center gap-1 px-2">
                          <input
                            type="number"
                            min="1"
                            max={reviews.length}
                            value={(currentReviewIndex || 0) + 1}
                            onChange={(e) => {
                              const num = parseInt(e.target.value);
                              if (num >= 1 && num <= reviews.length) {
                                setCurrentReviewIndex(num - 1);
                              }
                            }}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm text-gray-600">of {reviews.length}</span>
                        </div>
                        <button
                          onClick={() => setCurrentReviewIndex(Math.min(reviews.length - 1, (currentReviewIndex || 0) + 1))}
                          disabled={currentReviewIndex === reviews.length - 1}
                          className="px-3 py-1 text-sm rounded transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          aria-label="Next review"
                        >
                          →
                        </button>
                      </div>
                      {reviews.length <= 20 && (
                        <div className="flex gap-1 flex-wrap">
                          {reviews.map((_, idx) => (
                            <div key={idx} className="relative group">
                              <button
                                onClick={() => setCurrentReviewIndex(idx)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
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
            {reviews.length > 1 && !comparisonMode && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {viewMode === 'insights' ? (
                    <>📊 Showing insights for {reviews.length} reviews</>
                  ) : viewMode === 'all' ? (
                    <>📊 Analyzing all {reviews.length} reviews combined</>
                  ) : (
                    <>📊 Analyzing review {currentReviewIndex! + 1} of {reviews.length}</>
                  )}
                </p>
              </div>
            )}

            {/* Comparison Mode */}
            {comparisonMode && batch2 ? (
              <div className="mb-4">
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-purple-800">
                      🔀 Comparing {reviews.length} reviews vs {batch2.reviews.length} reviews
                    </p>
                    <button
                      onClick={() => {
                        setComparisonMode(false);
                        setBatch2(null);
                        setViewMode('insights');
                      }}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Exit Comparison
                    </button>
                  </div>
                </div>
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={batch1Name}
                    onChange={(e) => setBatch1Name(e.target.value)}
                    placeholder="Batch 1 name"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={batch2.name}
                    onChange={(e) => setBatch2({ ...batch2, name: e.target.value })}
                    placeholder="Batch 2 name"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <ComparisonView 
                  batch1={{ reviews, name: batch1Name }}
                  batch2={batch2}
                />
              </div>
            ) : viewMode === 'insights' ? (
              <BatchInsights 
                reviews={reviews} 
                onReviewClick={(index) => {
                  setCurrentReviewIndex(index);
                  setViewMode('single');
                }}
              />
            ) : (
              <ResultsDisplay review={getDisplayReview()} />
            )}
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

