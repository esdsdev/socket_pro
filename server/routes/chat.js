import express from 'express';
import ChatController from '../controllers/chatController.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  searchMessagesSchema,
  userIdParamSchema,
  messageIdParamSchema,
  imageIdParamSchema
} from '../validations/chatValidation.js';

// Export a function that creates the router with io and userSockets
export default function createChatRoutes(io, userSockets) {
  const router = express.Router();
  const chatController = new ChatController(io, userSockets);

  // Get conversations (users with message history)
  router.get('/conversations', 
    chatController.getConversations.bind(chatController)
  );

  // Get messages between two users
  router.get('/messages/:userId', 
    validateParams(userIdParamSchema),
    chatController.getMessages.bind(chatController)
  );

  // Send message
  router.post('/messages', 
    validateBody(sendMessageSchema),
    chatController.sendMessage.bind(chatController)
  );

  // Edit message
  router.put('/messages/:messageId', 
    validateParams(messageIdParamSchema),
    validateBody(editMessageSchema),
    chatController.editMessage.bind(chatController)
  );

  // Delete message
  router.delete('/messages/:messageId', 
    validateParams(messageIdParamSchema),
    validateBody(deleteMessageSchema),
    chatController.deleteMessage.bind(chatController)
  );

  // Mark image as viewed
  router.post('/images/:imageId/viewed', 
    validateParams(imageIdParamSchema),
    chatController.markImageAsViewed.bind(chatController)
  );

  // Mark message as read
  router.post('/messages/:messageId/read',
    validateParams(messageIdParamSchema),
    chatController.markMessageAsRead.bind(chatController)
  );

  // Search messages
  router.get('/search', 
    validateQuery(searchMessagesSchema),
    chatController.searchMessages.bind(chatController)
  );

  // Export chat
  router.get('/export/:userId', 
    validateParams(userIdParamSchema),
    chatController.exportChat.bind(chatController)
  );

  // Block user
  router.post('/block/:userId', 
    validateParams(userIdParamSchema),
    chatController.blockUser.bind(chatController)
  );

  // Unblock user
  router.delete('/block/:userId', 
    validateParams(userIdParamSchema),
    chatController.unblockUser.bind(chatController)
  );

  // Get blocked users
  router.get('/blocked', 
    chatController.getBlockedUsers.bind(chatController)
  );

  return router;
}