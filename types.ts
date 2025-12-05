export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}