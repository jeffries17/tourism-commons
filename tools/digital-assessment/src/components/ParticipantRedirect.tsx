import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ParticipantRedirectProps {
  children: ReactNode;
}

/**
 * Component that redirects participants to their detail page
 * Admins see the children (Dashboard)
 */
export default function ParticipantRedirect({ children }: ParticipantRedirectProps) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is a participant, redirect to their detail page
    if (user && !isAdmin && user.organizationName) {
      const encodedName = encodeURIComponent(user.organizationName);
      navigate(`/participant/${encodedName}`, { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Admins see the dashboard
  if (isAdmin) {
    return <>{children}</>;
  }

  // Participants will be redirected, show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}

