import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UpdateForm from './pages/UpdateForm';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCommunities from './pages/admin/Communities';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Components that extract authority from route params
function LoginRoute() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  return (
    <AuthProvider authority={authority}>
      <Login />
    </AuthProvider>
  );
}

function ProtectedDashboardRoute() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  return (
    <AuthProvider authority={authority}>
      <ProtectedRoute authority={authority}>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

function ProtectedUpdateRoute() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  return (
    <AuthProvider authority={authority}>
      <ProtectedRoute authority={authority}>
        <UpdateForm />
      </ProtectedRoute>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/cbt-monitoring">
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />

          {/* Authority-specific routes */}
          <Route path="/:authority/login" element={<LoginRoute />} />
          <Route path="/:authority" element={<ProtectedDashboardRoute />} />
          <Route path="/:authority/update" element={<ProtectedUpdateRoute />} />
          <Route
            path="/:authority/admin/communities"
            element={
              <ProtectedAdminCommunitiesRoute />
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

// Admin route wrapper
function ProtectedAdminCommunitiesRoute() {
  const params = useParams<{ authority: string }>();
  const authority = params.authority || '';
  return (
    <AuthProvider authority={authority}>
      <ProtectedRoute authority={authority} adminOnly>
        <AdminCommunities />
      </ProtectedRoute>
    </AuthProvider>
  );
}
