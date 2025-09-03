import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import UserProfile from './UserProfile';
import CallInterface from '../calling/CallInterface';
import CallHistory from '../calling/CallHistory';
import { useChatContext } from '../../contexts/ChatContext';
import { useCall } from '../../contexts/CallContext';
import { useSettings } from '../../contexts/SettingsContext';

const ChatInterface = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const { activeConversation } = useChatContext();
  const { currentCall, incomingCall } = useCall();
  const { settings } = useSettings();

  // Apply theme class to body
  React.useEffect(() => {
    const theme = settings.theme === 'system' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      settings.theme;
    
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [settings.theme]);

  return (
    <div 
      className="flex h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        backgroundImage: settings.chat_background ? `url(${settings.chat_background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
        <ChatSidebar 
          onShowProfile={() => setShowProfile(true)}
          onShowCallHistory={() => setShowCallHistory(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Start a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Interface */}
      {(currentCall || incomingCall) && <CallInterface />}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <CallHistory onClose={() => setShowCallHistory(false)} />
      )}
    </div>
  );
};

export default ChatInterface;