import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';
import ViewOnceImage from './ViewOnceImage';
import VoiceMessage from './VoiceMessage';
import { formatMessageTime } from '../../utils/dateUtils';

const Message = ({ message, isOwn }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { deleteMessage, editMessage } = useChatContext();
  const { settings } = useSettings();

  const handleDelete = async (forEveryone = false) => {
    try {
      await deleteMessage(message.id, forEveryone);
      setShowMenu(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        await editMessage(message.id, editContent);
        setIsEditing(false);
      } catch (error) {
        console.error('Edit failed:', error);
        setEditContent(message.content);
      }
    } else {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${
          isOwn ? 'bg-gray-200' : 'bg-gray-100'
        }`}>
          <p className="text-sm text-gray-500 italic">
            {message.deleted_for_everyone ? 'This message was deleted' : 'You deleted this message'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatMessageTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
        isOwn ? 'order-2' : 'order-1'
      }`}>
        <div
          className={`relative px-4 py-2 rounded-lg ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          {/* Message Content */}
          {message.message_type === 'text' && (
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                    onBlur={handleEdit}
                    className={`w-full p-2 rounded border ${
                      isOwn ? 'bg-blue-400 text-white placeholder-blue-200' : 'bg-gray-50'
                    }`}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-sm break-words">
                  {message.content}
                  {message.edited_at && (
                    <span className={`text-xs ml-2 ${
                      isOwn ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      (edited)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {message.message_type === 'image' && (
            <ViewOnceImage
              message={message}
              isViewOnce={message.images?.[0]?.is_view_once}
              autoDownload={settings.auto_download_media}
              maxSize={settings.max_auto_download_size}
            />
          )}

          {message.message_type === 'voice' && (
            <VoiceMessage
              message={message}
              autoDownload={settings.auto_download_media}
              maxSize={settings.max_auto_download_size}
            />
          )}

          {/* Timestamp and Read Receipt */}
          <div className={`flex items-center justify-between mt-1 ${
            isOwn ? 'text-blue-200' : 'text-gray-500'
          }`}>
            <p className="text-xs">
              {formatMessageTime(message.created_at)}
            </p>
            
            {/* Read Receipt for own messages */}
            {isOwn && settings.read_receipts_enabled && (
              <div className="flex items-center ml-2">
                {message.is_read ? (
                  <CheckCheck className="w-3 h-3 text-blue-300" />
                ) : (
                  <Check className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
          </div>

          {/* Read timestamp for own messages */}
          {isOwn && message.is_read && message.read_at && settings.read_receipts_enabled && (
            <p className="text-xs text-blue-200 mt-1">
              Read {formatMessageTime(message.read_at)}
            </p>
          )}
        </div>

        {/* Message Menu */}
        {isOwn && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute -right-8 top-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwn ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}

        {showMenu && (
          <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            {message.message_type === 'text' && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={() => handleDelete(false)}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete for me</span>
            </button>
            <button
              onClick={() => handleDelete(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete for everyone</span>
            </button>
          </div>
        )}

        {/* Quick Reactions */}
        <div className={`flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          {reactions.map((reaction, index) => (
            <button
              key={index}
              className="p-1 hover:bg-gray-200 rounded-full text-sm"
              onClick={() => {
                // Handle reaction
                console.log('React with:', reaction);
              }}
            >
              {reaction}
            </button>
          ))}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-5" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
};

export default Message;