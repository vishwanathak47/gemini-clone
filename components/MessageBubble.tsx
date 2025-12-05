import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCw } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full gap-4 mb-8 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}
      `}>
        {isUser ? (
           <User size={20} className="text-gray-600 dark:text-gray-300" />
        ) : (
           <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-sm opacity-20 rounded-full animate-pulse"></div>
              <Bot size={24} className="text-[#4285f4] relative z-10" />
           </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed
          ${isUser 
            ? 'bg-[#f0f4f9] dark:bg-[#1e1f20] px-5 py-3 rounded-[20px] rounded-tr-sm text-gray-800 dark:text-gray-200' 
            : 'text-gray-800 dark:text-gray-100'
          }
        `}>
          {message.isLoading ? (
            <div className="flex items-center gap-1 h-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
            </div>
          ) : (
            <ReactMarkdown
               components={{
                 code({node, inline, className, children, ...props}: any) {
                   const match = /language-(\w+)/.exec(className || '')
                   return !inline ? (
                     <div className="relative group my-4">
                       <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-1 bg-gray-700 rounded text-xs text-white">Copy</button>
                       </div>
                       <code className={`${className} block bg-[#1e1e1e] text-gray-200 p-4 rounded-lg overflow-x-auto`} {...props}>
                         {children}
                       </code>
                     </div>
                   ) : (
                     <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                       {children}
                     </code>
                   )
                 }
               }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action Buttons (Only for Model) */}
        {!isUser && !message.isLoading && (
          <div className="flex items-center gap-2 mt-2 ml-1 text-gray-400">
            <button className="p-1.5 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Copy size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ThumbsUp size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ThumbsDown size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RotateCw size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;