import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut, Menu, X, Settings, Sparkles } from 'lucide-react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  user,
  onLogout
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-[#f0f4f9] dark:bg-[#1e1f20] 
          transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          flex flex-col h-full border-r border-gray-200 dark:border-gray-800
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header / New Chat */}
        <div className="p-4">
          <button 
            onClick={onClose} 
            className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-2 mb-6 md:hidden">
             <Sparkles className="text-brand-gradientStart" size={24} />
             <span className="font-semibold text-xl text-gray-700 dark:text-gray-200">Gemini Clone</span>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#dde3ea] dark:bg-[#282a2c] hover:bg-[#d1d9e2] dark:hover:bg-[#333537] text-gray-700 dark:text-gray-200 rounded-full transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            <span className="truncate">New chat</span>
          </button>
        </div>

        {/* Recent Chats List */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-4 mb-2">Recent</div>
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group relative flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer text-sm
                  transition-colors duration-200
                  ${activeChatId === chat.id 
                    ? 'bg-[#d3e3fd] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff]' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-[#e6e9ef] dark:hover:bg-[#28292c]'
                  }
                `}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate flex-1 pr-6">
                  {chat.title}
                </span>
                
                {/* Delete Action - Visible on Hover or Active */}
                <button
                  onClick={(e) => onDeleteChat(chat.id, e)}
                  className={`
                    absolute right-2 p-1.5 rounded-full 
                    hover:bg-gray-200 dark:hover:bg-gray-600 
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${activeChatId === chat.id ? 'opacity-100' : ''}
                  `}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No recent chats
              </div>
            )}
          </div>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#e6e9ef] dark:hover:bg-[#28292c] cursor-pointer transition-colors group">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Standard Plan</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-4 px-2 text-xs text-gray-500 dark:text-gray-400">
             <Settings size={14} />
             <span>Settings</span>
             <span className="mx-1">•</span>
             <span>Help</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;