import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DocumentTitle from '../components/common/DocumentTitle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username);
      
      // Redirect based on role
      // Admins go to dashboard, participants go to their detail page
      // We'll handle this in App.tsx with the ProtectedRoute logic
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DocumentTitle title="Login" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Digital Assessment Dashboard
            </h1>
            <p className="text-lg text-gray-700 mb-2">
              The Gambia
            </p>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Assessing digital capacity and opportunities for creative industries and tourism operators in partnership with the International Trade Centre (ITC)
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  autoFocus
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                <strong>Privacy Notice:</strong> This is a privacy-gated system. 
                Your login activity is tracked for analytics purposes only.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have access? Contact{' '}
              <a href="mailto:alex.jeffries@gmail.com" className="text-blue-600 hover:underline">
                alex.jeffries@gmail.com
              </a>
              {' '}for access questions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

