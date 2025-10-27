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
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">Tourism Commons</h1>
                  <p className="text-xl text-gray-600 mb-8">Digital Assessment & Analysis Platform</p>
                  <div className="space-y-4">
                    <a href="/gambia-itc" className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      → Gambia ITC Dashboard
                    </a>
                    <a href="/benin-sentiment" className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      → Benin Sentiment Analysis
                    </a>
                    <a href="/login" className="block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      Login
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
