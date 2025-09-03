import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Message from './Message';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageList = () => {
  const { messages, loading, markMessageAsRead, activeConversation } = useChatContext();
  const { user } = useAuth();
  const { settings } = useSettings();
  const observerRef = useRef(null);

  // Setup intersection observer for read receipts
  useEffect(() => {
    if (!settings.read_receipts_enabled || !activeConversation) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const senderId = entry.target.dataset.senderId;
            
            // Only mark messages from other users as read
            if (senderId !== user?.id && messageId) {
              markMessageAsRead(messageId);
            }
          }
        });
      },
      {
        threshold: 0.5, // Message is 50% visible
        rootMargin: '0px'
      }
    );

    observerRef.current = observer;

    // Observe all message elements
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, settings.read_receipts_enabled, activeConversation, user, markMessageAsRead]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <p>No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          data-message-id={message.id}
          data-sender-id={message.sender_id}
        >
          <Message
            message={message}
            isOwn={message.sender_id === user?.id}
          />
        </div>
      ))}
    </div>
  );
};

export default MessageList;