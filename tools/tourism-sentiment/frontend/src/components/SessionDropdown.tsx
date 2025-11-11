import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getUserSessions, deleteSession, ReviewSession } from '../services/sessionService';

interface SessionDropdownProps {
  onLoadSession: (session: ReviewSession) => void;
}

export default function SessionDropdown({ onLoadSession }: SessionDropdownProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<ReviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSessions();
    }
  }, [isAuthenticated, user]);

  const loadSessions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userSessions = await getUserSessions(user.uid);
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }
    try {
      await deleteSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const formatDate = (date: Timestamp | Date) => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadSessions();
          }
        }}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <span>📁 Saved Sessions</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm">My Sessions</h3>
            </div>
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No saved sessions yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => {
                      onLoadSession(session);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {session.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {session.reviews.length} review{session.reviews.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Updated {formatDate(session.updatedAt)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(session.id!, e)}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm transition-opacity"
                        aria-label="Delete session"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

