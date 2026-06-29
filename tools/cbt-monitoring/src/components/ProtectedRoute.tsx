import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  authority: string; // e.g., 'eswatini'
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  authority,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, authority: userAuthority, isAdmin } = useAuth();
  const location = useLocation();
  
  const loginPath = `/${authority}/login`;

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong authority - redirect to login
  if (!isAuthenticated || userAuthority !== authority) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Admin-only route guard
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible to administrators.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}

