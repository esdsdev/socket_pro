import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useChatContext } from '../../contexts/ChatContext';

const ChatWindow = () => {
  const { activeConversation } = useChatContext();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <MessageList />
          <TypingIndicator />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput onMessageSent={scrollToBottom} />
      </div>
    </div>
  );
};

export default ChatWindow;