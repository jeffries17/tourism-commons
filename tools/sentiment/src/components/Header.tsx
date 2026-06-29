import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import SessionDropdown from './SessionDropdown';
import { useState } from 'react';
import { ReviewSession } from '../services/sessionService';

interface HeaderProps {
  onLoadSession?: (session: ReviewSession) => void;
}

export default function Header({ onLoadSession }: HeaderProps = {}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tourism Sentiment Analysis
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {onLoadSession && <SessionDropdown onLoadSession={onLoadSession} />}
                  <div className="text-sm text-gray-600">
                    {user?.displayName || user?.email || 'User'}
                  </div>
                  {user?.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <button
                    onClick={logout}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <Login onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </>
  );
}

