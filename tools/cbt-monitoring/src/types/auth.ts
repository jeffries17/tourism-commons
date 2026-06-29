export interface User {
  username: string;
  name?: string;
  role?: 'admin' | 'user';
  authority?: string; // e.g., 'eswatini', 'gambia'
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, authority: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  authority: string | null;
}

export interface LoginResponse {
  user: User;
}

