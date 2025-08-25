import React, { useState } from 'react';
import { MoreVertical, Search, Phone, Video, Archive, Trash2, UserX } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

const ChatHeader = () => {
  const { activeConversation, onlineUsers, exportChat, blockUser } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);

  if (!activeConversation) return null;

  const participant = activeConversation.participant;
  const isOnline = participant?.is_online || onlineUsers.some(u => u.userId === participant?.id);

  const handleExportChat = async (format) => {
    try {
      await exportChat(activeConversation.id, format);
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser(participant?.id);
      setShowMenu(false);
    } catch (error) {
      console.error('Block failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {participant?.username?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{participant?.username || 'Unknown User'}</h3>
          <p className="text-sm text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => handleExportChat('json')}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Archive className="w-4 h-4" />
                <span>Export as JSON</span>
              </button>
              <button
                onClick={() => handleExportChat('txt')}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Archive className="w-4 h-4" />
                <span>Export as Text</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={handleBlockUser}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <UserX className="w-4 h-4" />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-5" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
};

export default ChatHeader;