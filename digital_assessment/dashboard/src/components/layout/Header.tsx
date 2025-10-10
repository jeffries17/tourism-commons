import { Link, useNavigate } from 'react-router-dom';
import { currentCountry } from '../../config/index';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {currentCountry.code}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold text-gray-900">
                  Digital Assessment
                </h1>
                <p className="text-xs text-gray-500">{currentCountry.name}</p>
              </div>
            </Link>

            {/* Show navigation only for admins */}
            {isAdmin && (
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  to="/" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/participants" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Participants
                </Link>
                <Link 
                  to="/sectors" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Sectors
                </Link>
                <Link 
                  to="/region" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Region
                </Link>
                <Link 
                  to="/ito-perception" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  ITO Perception
                </Link>
                <Link 
                  to="/reviews-sentiment" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Reviews & Sentiment
                </Link>
                <Link 
                  to="/methodology" 
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Methodology
                </Link>
              </nav>
            )}
          </div>

          {/* User info and logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrator' : 'Participant'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

