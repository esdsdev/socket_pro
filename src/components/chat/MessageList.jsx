import React from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageList = () => {
  const { messages, loading } = useChatContext();
  const { user } = useAuth();

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <p>No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isOwn={message.sender_id === user?.id}
        />
      ))}
    </div>
  );
};

export default MessageList;