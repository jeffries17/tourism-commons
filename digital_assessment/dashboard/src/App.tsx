import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ParticipantList from './pages/ParticipantList';
import ParticipantDetail from './pages/ParticipantDetail';
import SectorOverview from './pages/SectorOverview';
import SectorDetail from './pages/SectorDetail';
import Methodology from './pages/Methodology';
import TechnicalAudit from './pages/TechnicalAudit';
import RegionalAnalysis from './pages/RegionalAnalysis';
import ITOPerception from './pages/ITOPerception';
import ReviewsSentiment from './pages/ReviewsSentiment';
import BeninSentiment from './pages/BeninSentiment';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DocumentTitle from './components/common/DocumentTitle';
import ParticipantRedirect from './components/ParticipantRedirect';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Use basename only in production (when deployed to Firebase)
  // Remove basename to support multiple standalone routes
  const basename = '/';
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <DocumentTitle />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/benin-sentiment" element={<BeninSentiment />} />
            
            {/* Landing page at root - public */}
            <Route path="/" element={
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="max-w-4xl w-full">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                      Tourism Commons
                    </h1>
                    <p className="text-2xl text-gray-700 mb-2">
                      Digital Assessment & Analysis Platform
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                      Supporting tourism development and digital capacity building across West Africa. 
                      A common good initiative for tourism operators, creative industries, and cultural heritage sites.
                    </p>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                      In partnership with the International Trade Centre (ITC)
                    </p>
                  </div>

                  {/* Action Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <a href="/gambia-itc" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">🇬🇲</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                            Gambia ITC Dashboard
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Access the digital assessment platform for The Gambia. Track capacity, 
                            review performance metrics, and explore opportunities for creative industries and tourism operators.
                          </p>
                        </div>
                        <div className="text-green-600 text-2xl group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </a>

                    <a href="/benin-sentiment" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">🇧🇯</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            Benin Sentiment Analysis
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Explore visitor sentiment analysis for Benin's cultural heritage sites. 
                            Understand visitor experiences, themes, and opportunities for improvement.
                          </p>
                        </div>
                        <div className="text-blue-600 text-2xl group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <a href="/login" className="inline-block px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Login to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            } />
            
            {/* Protected routes - require authentication */}
            <Route element={<DashboardLayout />}>
              {/* Gambia ITC dashboard */}
              <Route 
                path="/gambia-itc" 
                element={
                  <ProtectedRoute>
                    <ParticipantRedirect>
                      <Dashboard />
                    </ParticipantRedirect>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin-only routes */}
              <Route 
                path="/participants" 
                element={
                  <ProtectedRoute adminOnly>
                    <ParticipantList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sectors" 
                element={
                  <ProtectedRoute adminOnly>
                    <SectorOverview />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sectors/:sector" 
                element={
                  <ProtectedRoute adminOnly>
                    <SectorDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/region" 
                element={
                  <ProtectedRoute adminOnly>
                    <RegionalAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ito-perception" 
                element={
                  <ProtectedRoute adminOnly>
                    <ITOPerception />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reviews-sentiment" 
                element={
                  <ProtectedRoute adminOnly>
                    <ReviewsSentiment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/technical-audit" 
                element={
                  <ProtectedRoute adminOnly>
                    <TechnicalAudit />
                  </ProtectedRoute>
                } 
              />
              
              {/* Accessible to all authenticated users */}
              <Route 
                path="/participant/:name" 
                element={
                  <ProtectedRoute>
                    <ParticipantDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/methodology" 
                element={
                  <ProtectedRoute>
                    <Methodology />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
