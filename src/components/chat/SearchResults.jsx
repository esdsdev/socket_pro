import React from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const SearchResults = () => {
  const { messages, loading, searchQuery } = useChatContext();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Enter a search term to find messages</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No messages found for "{searchQuery}"</p>
      </div>
    );
  }

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
  };

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
        {messages.length} result{messages.length !== 1 ? 's' : ''} for "{searchQuery}"
      </div>
      
      {messages.map((message) => (
        <div
          key={message.id}
          className="p-4 border-b border-gray-100 hover:bg-gray-50"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {message.sender_id === user?.id ? 'You' : 'U'}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {message.sender_id === user?.id ? 'You' : 'User'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-700">
                {message.is_deleted ? (
                  <span className="italic text-gray-500">Message deleted</span>
                ) : (
                  highlightText(message.content, searchQuery)
                )}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;