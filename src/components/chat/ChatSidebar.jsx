import React, { useState } from 'react';
import { Search, Settings, Plus, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import ConversationList from './ConversationList';
import SearchResults from './SearchResults';

const ChatSidebar = ({ onShowProfile, onShowCallHistory }) => {
  const { user, logout } = useAuth();
  const { searchQuery, searchMessages } = useChatContext();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    if (query.trim()) {
      setIsSearching(true);
      await searchMessages(query);
    } else {
      setIsSearching(false);
      await searchMessages('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{user?.username || 'User'}</h2>
              <span className="text-xs text-green-500">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowCallHistory}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Call History"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              onClick={onShowProfile}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Profile Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchQuery}
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations / Search Results */}
      <div className="flex-1 overflow-hidden">
        {isSearching ? <SearchResults /> : <ConversationList />}
      </div>
    </div>
  );
};

export default ChatSidebar;