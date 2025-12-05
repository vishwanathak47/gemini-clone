import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, Sparkles, Image as ImageIcon, Mic } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { DB } from './services/db';
import { sendMessageStream } from './services/geminiService';
import { User, ChatSession, Message } from './types';

// Simple Login Component
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onLogin(name);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
             <Sparkles className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to Gemini Clone</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your name to start chatting with AI</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!name.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entering...' : 'Start Chatting'}
          </button>
        </form>
        
        <div className="mt-8 text-xs text-gray-400">
           Built with React, Tailwind & Google Gemini API
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize
  useEffect(() => {
    // In a real app with auth tokens, we would validate here.
    // For this demo, we check if we have a user ID in local storage but trigger login to fetch details.
    const storedId = localStorage.getItem('gemini_clone_user_id');
    if (!storedId) {
      setIsAuthenticated(false);
    }
  }, []);

  // Load chats
  const loadChats = async () => {
    const loadedChats = await DB.getChats();
    setChats(loadedChats);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Login Handler
  const handleLogin = async (name: string) => {
    try {
      const user = await DB.login(name);
      setUser(user);
      setIsAuthenticated(true);
      await loadChats();
    } catch (e: any) {
      console.error("Login failed", e);
      // Show the actual error from the backend/DB
      alert(e.message || "Could not connect to server. Ensure backend is running.");
    }
  };

  const handleLogout = async () => {
    await DB.logout();
    setUser(null);
    setIsAuthenticated(false);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
  };

  // Chat Actions
  const createNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const selectChat = async (id: string) => {
    const chat = await DB.getChat(id);
    if (chat) {
      setActiveChatId(chat.id);
      setMessages(chat.messages);
      setSidebarOpen(false);
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await DB.deleteChat(id);
    if (activeChatId === id) {
      createNewChat();
    }
    await loadChats();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsgContent = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 1. Create User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgContent,
      timestamp: Date.now()
    };

    // 2. Optimistic Update
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    // 3. Prepare Bot Message Placeholder
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, botMsg]);

    try {
      // 4. Stream Response from Backend
      // We pass the history (previous messages) and the new user content separately if needed,
      // but here we pass the history up to this point. 
      // Note: 'messages' variable contains OLD messages. 'newMessages' contains OLD + NEW User Message.
      
      let accumulatedText = "";
      
      await sendMessageStream(messages, userMsgContent, (chunkText) => {
        accumulatedText = chunkText;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, content: chunkText, isLoading: false } 
            : msg
        ));
      });

      // 5. Finalize & Save
      const finalBotMsg: Message = { ...botMsg, content: accumulatedText, isLoading: false };
      const updatedMessages = [...newMessages, finalBotMsg];
      
      // Update or Create Chat Session
      let chatId = activeChatId;
      if (!chatId) {
        chatId = Date.now().toString();
        setActiveChatId(chatId);
        
        // Generate a title based on first message
        const title = userMsgContent.slice(0, 30) + (userMsgContent.length > 30 ? '...' : '');
        
        const newChat: ChatSession = {
          id: chatId,
          title,
          messages: updatedMessages,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await DB.saveChat(newChat);
      } else {
        const chat = await DB.getChat(chatId);
        if (chat) {
          await DB.saveChat({
            ...chat,
            messages: updatedMessages,
            updatedAt: Date.now()
          });
        }
      }
      
      await loadChats(); // Refresh sidebar

    } catch (error) {
      console.error("Failed to generate response", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, content: "Sorry, I encountered an error. Please check your API key or try again.", isLoading: false } 
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- RENDER ---

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        user={user!}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Top Navigation (Mobile/Tablet) */}
        <header className="flex items-center justify-between p-4 md:hidden absolute top-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-medium">Gemini</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Advanced</span>
          </div>
          <div className="w-8"></div> {/* Spacer for balance */}
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 bg-transparent absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-2 cursor-pointer group">
               <span className="text-xl font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">Gemini</span>
               <span className="text-sm px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500">2.5 Flash</span>
            </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-16 pb-36 px-4 md:px-0">
          <div className="max-w-3xl mx-auto w-full">
            
            {messages.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-start justify-center min-h-[60vh] px-4 animate-fade-in-up">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 bg-clip-text text-transparent mb-2">
                    Hello, {user?.name.split(' ')[0]}
                  </h1>
                  <h2 className="text-4xl md:text-5xl font-medium text-gray-300 dark:text-gray-700">
                    How can I help today?
                  </h2>
                </div>
                
                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-4 w-full">
                   {[
                     { text: "Suggest a road trip itinerary", icon: "🚗" },
                     { text: "Debug this Python code", icon: "🐍" },
                     { text: "Explain quantum computing", icon: "⚛️" },
                     { text: "Write an email to my boss", icon: "✉️" }
                   ].map((chip, idx) => (
                     <button 
                       key={idx}
                       onClick={() => {
                         setInput(chip.text);
                         if (textareaRef.current) textareaRef.current.focus();
                       }}
                       className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-left flex-1 min-w-[200px]"
                     >
                       <span className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">{chip.icon}</span>
                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{chip.text}</span>
                     </button>
                   ))}
                </div>
              </div>
            ) : (
              // Message List
              <div className="px-2 md:px-0">
                {messages.map((msg, index) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isLast={index === messages.length - 1} 
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 pb-6 pt-2 px-4 md:px-0 z-20">
          <div className="max-w-3xl mx-auto w-full">
            <div className="relative bg-[#f0f4f9] dark:bg-[#1e1f20] rounded-[24px] transition-all hover:bg-gray-200 dark:hover:bg-[#2c2d2e] border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:bg-white dark:focus-within:bg-[#1e1f20] focus-within:shadow-lg">
              
              <div className="px-4 py-4 flex items-end gap-3">
                <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                   <ImageIcon size={20} />
                </button>
                
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a prompt here"
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-48 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={1}
                />

                {input.trim() ? (
                  <button 
                    onClick={handleSendMessage}
                    disabled={isTyping}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                  >
                    <Send size={18} />
                  </button>
                ) : (
                  <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Mic size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-center mt-2">
               <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gemini may display inaccurate info, including about people, so double-check its responses.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}