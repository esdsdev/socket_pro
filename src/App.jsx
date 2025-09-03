import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CallProvider } from './contexts/CallContext';
import ChatApp from './components/ChatApp';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SocketProvider>
          <CallProvider>
            <ChatProvider>
              <div className="min-h-screen bg-gray-50">
                <ChatApp />
              </div>
            </ChatProvider>
          </CallProvider>
        </SocketProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;