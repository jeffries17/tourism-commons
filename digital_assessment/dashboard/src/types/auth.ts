export interface User {
  fullName: string;
  username: string;
  role: 'admin' | 'participant';
  organizationName: string;
  loginCount: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
}

