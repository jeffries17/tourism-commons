import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api';

// Create a storage key that includes authority for multi-tenancy
const getAuthStorageKey = (authority: string) => `cbt_auth_user_${authority}`;

interface AuthProviderProps {
  children: ReactNode;
  authority: string; // e.g., 'eswatini'
}

export function AuthProvider({ children, authority }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storageKey = getAuthStorageKey(authority);
    const storedUser = localStorage.getItem(storageKey);
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Verify this user belongs to the current authority
        if (userData.authority === authority) {
          setUser(userData);
        } else {
          // Wrong authority - clear it
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem(storageKey);
      }
    }
    setIsLoading(false);
  }, [authority]);

  const login = async (username: string, authAuthority: string): Promise<void> => {
    if (!username.trim()) {
      throw new Error('Username is required');
    }

    if (authAuthority !== authority) {
      throw new Error('Authority mismatch');
    }

    const usernameLower = username.trim().toLowerCase();
    const isLocalDev = import.meta.env.DEV || window.location.hostname === 'localhost';

    // Local development: Use mock login if API fails or for specific test users
    if (isLocalDev) {
      const mockUsers: Record<string, any> = {
        'ajeffries': {
          fullName: 'Alex Jeffries',
          username: 'ajeffries',
          role: 'admin',
          organizationName: 'Tourism Commons',
          loginCount: 1
        },
        'test': {
          fullName: 'Test User',
          username: 'test',
          role: 'user',
          organizationName: 'ETA',
          loginCount: 1
        },
        'admin': {
          fullName: 'Admin User',
          username: 'admin',
          role: 'admin',
          organizationName: 'ETA',
          loginCount: 1
        }
      };

      // Try API first, fall back to mock if it fails
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: usernameLower,
            authority: authAuthority,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const userData = { ...data.user, authority: authAuthority };
          setUser(userData);
          const storageKey = getAuthStorageKey(authAuthority);
          localStorage.setItem(storageKey, JSON.stringify(userData));
          return;
        }
      } catch (apiError) {
        console.warn('API login failed, using mock login:', apiError);
      }

      // Fall back to mock user if API fails or user is in mock list
      if (mockUsers[usernameLower] || usernameLower === 'ajeffries') {
        const mockUser = mockUsers[usernameLower] || mockUsers['ajeffries'];
        const userData = { ...mockUser, authority: authAuthority };
        setUser(userData);
        const storageKey = getAuthStorageKey(authAuthority);
        localStorage.setItem(storageKey, JSON.stringify(userData));
        return;
      }
    }

    // Production: Use API only
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username: usernameLower,
        authority: authAuthority,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errorData.error || 'Invalid username');
    }

    const data = await response.json();
    const userData = { ...data.user, authority: authAuthority };

    // Store in state and localStorage with authority-specific key
    setUser(userData);
    const storageKey = getAuthStorageKey(authAuthority);
    localStorage.setItem(storageKey, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    const storageKey = getAuthStorageKey(authority);
    localStorage.removeItem(storageKey);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    authority: user?.authority || authority,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

