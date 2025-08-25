import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SocketProvider } from './contexts/SocketContext';
import ChatApp from './components/ChatApp';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <div className="min-h-screen bg-gray-50">
            <ChatApp />
          </div>
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;