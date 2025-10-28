import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { currentCountry } from '../../config/index';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/gambia-itc/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isMobileMenuOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isUserDropdownOpen]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-16">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm sm:text-xl font-bold">
                  {currentCountry.code}
                </span>
              </div>
              <div className="min-w-0 flex-shrink">
                <h1 className="text-sm sm:text-lg font-heading font-bold text-gray-900 truncate">
                  Digital Assessment
                </h1>
                <p className="text-xs text-gray-500 truncate hidden sm:block">{currentCountry.name}</p>
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

          {/* User avatar dropdown and mobile menu */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* User avatar dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* User dropdown menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {isAdmin ? 'Administrator' : 'Participant'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && isAdmin && (
          <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/participants" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Participants
              </Link>
              <Link 
                to="/sectors" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sectors
              </Link>
              <Link 
                to="/region" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Region
              </Link>
              <Link 
                to="/ito-perception" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ITO Perception
              </Link>
              <Link 
                to="/reviews-sentiment" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews & Sentiment
              </Link>
              <Link 
                to="/methodology" 
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Methodology
              </Link>
              
              {/* Mobile user info and logout */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Administrator' : 'Participant'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

