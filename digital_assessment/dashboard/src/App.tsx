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
  const basename = import.meta.env.PROD ? '/gambia-itc' : '/';
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <DocumentTitle />
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<DashboardLayout />}>
              {/* Home - redirects based on role */}
              <Route 
                path="/" 
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
