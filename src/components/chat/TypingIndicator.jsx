import React from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const TypingIndicator = () => {
  const { typingUsers } = useChatContext();
  const { user } = useAuth();

  // Filter out current user and get typing users
  const otherTypingUsers = typingUsers.filter(userId => userId !== user?.id);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg max-w-xs">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-gray-600">
          {otherTypingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;