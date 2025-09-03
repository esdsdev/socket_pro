import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, Image, X, Smile, Eye } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';
import { mediaAPI } from '../../services/api';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';

const MessageInput = ({ onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { sendMessage, startTyping, stopTyping } = useChatContext();
  const { settings } = useSettings();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;

    try {
      if (attachments.length > 0) {
        // Send attachments
        for (const attachment of attachments) {
          await sendMessage(
            attachment.caption || 'Image',
            'image',
            {
              images: [{
                file_path: attachment.url,
                public_id: attachment.public_id,
                is_view_once: attachment.isViewOnce || false
              }]
            }
          );
        }
        setAttachments([]);
      }

      if (message.trim()) {
        await sendMessage(message, 'text');
        setMessage('');
      }

      stopTyping();
      // Clear any pending typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (settings.typing_indicators_enabled && value.trim()) {
      startTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    } else {
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file) => {
        const uploadResult = await mediaAPI.uploadImage(file, false);
        return {
          id: Date.now() + Math.random(),
          file,
          url: uploadResult.file_path,
          public_id: uploadResult.public_id,
          type: 'image',
          caption: '',
          isViewOnce: false
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const toggleViewOnce = (id) => {
    setAttachments(prev => prev.map(att => 
      att.id === id ? { ...att, isViewOnce: !att.isViewOnce } : att
    ));
  };

  const handleVoiceRecorded = async (audioBlob) => {
    try {
      const uploadResult = await mediaAPI.uploadVoiceMessage(audioBlob);
      await sendMessage(
        'Voice message',
        'voice',
        {
          voiceMessages: [{
            file_path: uploadResult.file_path,
            public_id: uploadResult.public_id,
            duration: uploadResult.duration || 0
          }]
        }
      );
      setIsRecording(false);
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending voice message:', error);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={URL.createObjectURL(attachment.file)}
                alt="Attachment"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={attachment.caption}
                  onChange={(e) => {
                    setAttachments(prev => prev.map(att => 
                      att.id === attachment.id ? { ...att, caption: e.target.value } : att
                    ));
                  }}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleViewOnce(attachment.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                      attachment.isViewOnce
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Once</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-700">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Voice Recorder */}
      {isRecording && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecorded}
          onCancel={() => setIsRecording(false)}
        />
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
            rows="1"
            style={{
              minHeight: '48px',
              height: 'auto'
            }}
          />
          
          {/* Emoji Picker Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  textareaRef.current?.focus();
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {message.trim() || attachments.length > 0 ? (
            <button
              type="submit"
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Attach image"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsRecording(true)}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Record voice message"
              >
                <Mic className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>

      {/* Close emoji picker overlay */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
      )}
    </div>
  );
};

export default MessageInput;