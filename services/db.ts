import { ChatSession, User } from '../types';

// Use environment variable for production, fallback to localhost for development
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export const DB = {
  // Auth / User Methods
  login: async (name: string): Promise<User> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Login failed: ${response.status}`);
    }

    const user = await response.json();
    localStorage.setItem('gemini_clone_user_id', user.id); // Keep minimal session state
    return user;
  },

  getCurrentUser: (): User | null => {
    // In a real app, you might validate a token here. 
    // For now, we just rely on local state or re-login if needed.
    // Returning null prompts the login screen which acts as our session restorer.
    return null; 
  },

  logout: async () => {
    localStorage.removeItem('gemini_clone_user_id');
  },

  // Chat Methods
  getChats: async (): Promise<ChatSession[]> => {
    const userId = localStorage.getItem('gemini_clone_user_id');
    if (!userId) return [];
    
    const response = await fetch(`${API_URL}/chats?userId=${userId}`);
    if (!response.ok) return [];
    return response.json();
  },

  getChat: async (id: string): Promise<ChatSession | null> => {
    const response = await fetch(`${API_URL}/chats/${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  saveChat: async (chat: ChatSession): Promise<void> => {
    const userId = localStorage.getItem('gemini_clone_user_id');
    if (!userId) return;

    await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...chat, userId })
    });
  },

  deleteChat: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/chats/${id}`, {
      method: 'DELETE'
    });
  }
};