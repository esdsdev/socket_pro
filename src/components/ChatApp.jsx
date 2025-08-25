import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from './auth/AuthScreen';
import ChatInterface from './chat/ChatInterface';
import LoadingSpinner from './common/LoadingSpinner';

const ChatApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return user ? <ChatInterface /> : <AuthScreen />;
};

export default ChatApp;