import React from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ConversationList = () => {
  const { conversations, activeConversation, setActiveConversation, loading, onlineUsers } = useChatContext();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm">Start a new chat to begin messaging</p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => {
        const participant = conversation.participant;
        const lastMessage = conversation.last_message;
        const isOnline = participant?.is_online || onlineUsers.some(u => u.userId === participant?.id);
        const isActive = activeConversation?.id === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => setActiveConversation(conversation)}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              isActive ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {participant?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {participant?.username || 'Unknown User'}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(lastMessage.created_at)}
                    </span>
                  )}
                </div>
                
                {lastMessage && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {lastMessage.sender_id === user?.id ? 'You: ' : ''}
                    {lastMessage.is_deleted ? (
                      <span className="italic">Message deleted</span>
                    ) : (
                      lastMessage.message_type === 'image' ? '📷 Photo' :
                      lastMessage.message_type === 'voice' ? '🎵 Voice message' :
                      lastMessage.content
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;