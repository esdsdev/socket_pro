import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { chatAPI } from '../services/api';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      updateConversationLastMessage(message);
    };

    const handleMessageDeleted = (messageId, deletedForEveryone) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_for_everyone: deletedForEveryone }
          : msg
      ));
    };

    const handleMessageEdited = (messageId, newContent) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited_at: new Date() }
          : msg
      ));
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    };

    const handleTypingStart = (userId, conversationId) => {
      if (activeConversation?.id === conversationId) {
        setTypingUsers(prev => [...new Set([...prev, userId])]);
      }
    };

    const handleTypingStop = (userId) => {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:edited', handleMessageEdited);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:edited', handleMessageEdited);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, isConnected, activeConversation]);

  const updateConversationLastMessage = (message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversation_id 
        ? { ...conv, last_message: message, updated_at: message.created_at }
        : conv
    ));
  };

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const conversationsData = await chatAPI.getConversations();
      setConversations(conversationsData.map(conv => ({
        id: conv.id,
        participant: conv,
        last_message: conv.last_message || null,
        updated_at: conv.updated_at || conv.created_at
      })));
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (userId) => {
    try {
      setLoading(true);
      const messagesData = await chatAPI.getMessages(userId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (content, type = 'text', mediaData = null) => {
    if (!activeConversation || !user) return;

    try {
      const messageData = {
        receiver_id: activeConversation.id,
        content,
        message_type: type,
        ...mediaData
      };

      const newMessage = await chatAPI.sendMessage(messageData);
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId, forEveryone = false) => {
    try {
      await chatAPI.deleteMessage(messageId, forEveryone);
      
      if (socket && isConnected) {
        socket.emit('message:delete', { 
          messageId, 
          receiverId: activeConversation.id,
          forEveryone 
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      await chatAPI.editMessage(messageId, newContent);
      
      if (socket && isConnected) {
        socket.emit('message:edit', { 
          messageId, 
          receiverId: activeConversation.id,
          newContent 
        });
      }
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  };

  const markImageAsViewed = async (imageId) => {
    try {
      await chatAPI.markImageAsViewed(imageId);
      setMessages(prev => prev.map(msg => ({
        ...msg,
        images: msg.images?.map(img => 
          img.id === imageId 
            ? { ...img, is_viewed: true, viewed_at: new Date() }
            : img
        )
      })));
    } catch (error) {
      console.error('Error marking image as viewed:', error);
    }
  };

  const exportChat = async (userId, format = 'json') => {
    try {
      const exportData = await chatAPI.exportChat(userId, format);
      
      const content = typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2);
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${userId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chat:', error);
      throw error;
    }
  };

  const searchMessages = async (query) => {
    try {
      setSearchQuery(query);
      if (!query.trim()) {
        if (activeConversation) {
          await loadMessages(activeConversation.id);
        }
        return;
      }

      const results = await chatAPI.searchMessages(query, activeConversation?.id);
      setMessages(results);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const blockUser = async (userId) => {
    try {
      await chatAPI.blockUser(userId);
      setBlockedUsers(prev => [...prev, userId]);
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (userId) => {
    try {
      await chatAPI.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const startTyping = () => {
    if (socket && isConnected && activeConversation) {
      socket.emit('typing:start', {
        receiverId: activeConversation.id
      });
    }
  };

  const stopTyping = () => {
    if (socket && isConnected && activeConversation) {
      socket.emit('typing:stop', {
        receiverId: activeConversation.id
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      setSearchQuery('');
    }
  }, [activeConversation, loadMessages]);

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    onlineUsers,
    typingUsers,
    blockedUsers,
    searchQuery,
    sendMessage,
    deleteMessage,
    editMessage,
    markImageAsViewed,
    exportChat,
    searchMessages,
    blockUser,
    unblockUser,
    startTyping,
    stopTyping,
    loadConversations,
    loadMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};