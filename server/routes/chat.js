import express from 'express';
import { Op } from 'sequelize';
import { User, Message, Image, VoiceMessage, BlockedUser } from '../models/index.js';
import { 
  sendMessageValidation, 
  editMessageValidation, 
  searchValidation,
  blockUserValidation 
} from '../middleware/validation.js';

// Export a function that creates the router with io and userSockets
export default function createChatRoutes(io, userSockets) {
  const router = express.Router();

  // Get conversations (users with message history)
  router.get('/conversations', async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get all users who have exchanged messages with current user
      const conversations = await User.findAll({
        attributes: ['id', 'username', 'email', 'is_online', 'last_seen', 'avatar_url'],
        include: [
          {
            model: Message,
            as: 'sentMessages',
            where: {
              [Op.or]: [
                { sender_id: userId },
                { receiver_id: userId }
              ]
            },
            attributes: ['id', 'content', 'message_type', 'is_deleted', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 1,
            required: true
          }
        ],
        where: {
          id: { [Op.ne]: userId }
        }
      });

      // Format response with last message
      const formattedConversations = conversations.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        is_online: user.is_online,
        last_seen: user.last_seen,
        avatar_url: user.avatar_url,
        last_message: user.sentMessages[0] || null
      }));

      res.json(formattedConversations);
    } catch (error) {
      next(error);
    }
  });

  // Get messages between two users
  router.get('/messages/:userId', async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;
      const { limit = 50, offset = 0 } = req.query;

      // Check if other user exists
      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if current user is blocked by other user
      const isBlocked = await BlockedUser.findOne({
        where: {
          blocker_id: otherUserId,
          blocked_id: currentUserId
        }
      });

      if (isBlocked) {
        return res.status(403).json({ error: 'You are blocked by this user' });
      }

      // Get messages
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: currentUserId, receiver_id: otherUserId },
            { sender_id: otherUserId, receiver_id: currentUserId }
          ]
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar_url']
          },
          {
            model: Image,
            as: 'images',
            attributes: ['id', 'file_path', 'public_id', 'is_viewed', 'viewed_at', 'is_view_once', 'width', 'height']
          },
          {
            model: VoiceMessage,
            as: 'voiceMessages',
            attributes: ['id', 'file_path', 'public_id', 'duration', 'format']
          }
        ],
        order: [['created_at', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Mark messages as read
      await Message.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            sender_id: otherUserId,
            receiver_id: currentUserId,
            is_read: false
          }
        }
      );

      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Send message
  router.post('/messages', sendMessageValidation, async (req, res, next) => {
    try {
      const senderId = req.user.id;
      const { receiver_id, content, message_type = 'text', images = [], voiceMessages = [] } = req.body;

      // Check if receiver exists
      const receiver = await User.findByPk(receiver_id);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      // Check if sender is blocked by receiver
      const isBlocked = await BlockedUser.findOne({
        where: {
          blocker_id: receiver_id,
          blocked_id: senderId
        }
      });

      if (isBlocked) {
        return res.status(403).json({ error: 'You are blocked by this user' });
      }

      // Create message
      const message = await Message.create({
        sender_id: senderId,
        receiver_id,
        content,
        message_type
      });

      // Create associated images if any
      if (images.length > 0) {
        const imageRecords = images.map(img => ({
          message_id: message.id,
          file_path: img.file_path,
          public_id: img.public_id,
          is_view_once: img.is_view_once || false,
          width: img.width,
          height: img.height,
          file_size: img.file_size
        }));
        await Image.bulkCreate(imageRecords);
      }

      // Create associated voice messages if any
      if (voiceMessages.length > 0) {
        const voiceRecords = voiceMessages.map(voice => ({
          message_id: message.id,
          file_path: voice.file_path,
          public_id: voice.public_id,
          duration: voice.duration,
          format: voice.format || 'webm',
          file_size: voice.file_size
        }));
        await VoiceMessage.bulkCreate(voiceRecords);
      }

      // Fetch complete message with associations
      const completeMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar_url']
          },
          {
            model: Image,
            as: 'images'
          },
          {
            model: VoiceMessage,
            as: 'voiceMessages'
          }
        ]
      });

      // Emit real-time message to both sender and receiver after database persistence
      const messageData = {
        id: completeMessage.id,
        sender_id: completeMessage.sender_id,
        receiver_id: completeMessage.receiver_id,
        content: completeMessage.content,
        message_type: completeMessage.message_type,
        created_at: completeMessage.created_at,
        sender: completeMessage.sender,
        images: completeMessage.images,
        voiceMessages: completeMessage.voiceMessages
      };

      // Emit to receiver if they're online
      const receiverSockets = userSockets.get(receiver_id);
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('message:new', messageData);
        });
      }

      // Emit to sender if they're online (for multi-device sync)
      const senderSockets = userSockets.get(senderId);
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach(socketId => {
          io.to(socketId).emit('message:new', messageData);
        });
      }

      res.status(201).json(completeMessage);
    } catch (error) {
      next(error);
    }
  });

  // Edit message
  router.put('/messages/:messageId', editMessageValidation, async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Check if user owns the message
      if (message.sender_id !== userId) {
        return res.status(403).json({ error: 'You can only edit your own messages' });
      }

      // Check if message is not deleted and is text type
      if (message.is_deleted || message.message_type !== 'text') {
        return res.status(400).json({ error: 'Cannot edit this message' });
      }

      // Update message
      await message.update({
        content,
        edited_at: new Date()
      });

      res.json(message);
    } catch (error) {
      next(error);
    }
  });

  // Delete message
  router.delete('/messages/:messageId', async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { forEveryone = false } = req.body;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Check if user owns the message
      if (message.sender_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own messages' });
      }

      // Update message
      await message.update({
        is_deleted: true,
        deleted_at: new Date(),
        deleted_for_everyone: forEveryone
      });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      next(error);
    }
  });

  // Mark image as viewed
  router.post('/images/:imageId/viewed', async (req, res, next) => {
    try {
      const { imageId } = req.params;
      const userId = req.user.id;

      const image = await Image.findByPk(imageId, {
        include: {
          model: Message,
          as: 'message'
        }
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Check if user is the receiver of the message
      if (image.message.receiver_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Mark as viewed
      await image.update({
        is_viewed: true,
        viewed_at: new Date()
      });

      res.json({ message: 'Image marked as viewed' });
    } catch (error) {
      next(error);
    }
  });

  // Search messages
  router.get('/search', searchValidation, async (req, res, next) => {
    try {
      const { q: query, limit = 20, offset = 0, userId: otherUserId } = req.query;
      const currentUserId = req.user.id;

      let whereClause = {
        content: {
          [Op.iLike]: `%${query}%`
        },
        is_deleted: false
      };

      // If searching within a specific conversation
      if (otherUserId) {
        whereClause[Op.or] = [
          { sender_id: currentUserId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: currentUserId }
        ];
      } else {
        // Search in all user's conversations
        whereClause[Op.or] = [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ];
      }

      const messages = await Message.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar_url']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatar_url']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Export chat
  router.get('/export/:userId', async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;
      const { format = 'json' } = req.query;

      // Check if other user exists
      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all messages between users
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: currentUserId, receiver_id: otherUserId },
            { sender_id: otherUserId, receiver_id: currentUserId }
          ]
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['username']
          }
        ],
        order: [['created_at', 'ASC']]
      });

      if (format === 'json') {
        res.json({
          conversation_with: otherUser.username,
          exported_at: new Date().toISOString(),
          message_count: messages.length,
          messages: messages.map(msg => ({
            sender: msg.sender.username,
            content: msg.is_deleted ? '[Message deleted]' : msg.content,
            type: msg.message_type,
            timestamp: msg.created_at,
            edited: !!msg.edited_at
          }))
        });
      } else {
        // Text format
        const textExport = [
          `Chat Export with ${otherUser.username}`,
          `Exported on: ${new Date().toLocaleString()}`,
          `Total messages: ${messages.length}`,
          '',
          ...messages.map(msg => {
            const timestamp = new Date(msg.created_at).toLocaleString();
            const content = msg.is_deleted ? '[Message deleted]' : msg.content;
            const edited = msg.edited_at ? ' (edited)' : '';
            return `[${timestamp}] ${msg.sender.username}: ${content}${edited}`;
          })
        ].join('\n');

        res.setHeader('Content-Type', 'text/plain');
        res.send(textExport);
      }
    } catch (error) {
      next(error);
    }
  });

  // Block user
  router.post('/block/:userId', blockUserValidation, async (req, res, next) => {
    try {
      const blockerId = req.user.id;
      const blockedId = req.params.userId;

      if (blockerId === blockedId) {
        return res.status(400).json({ error: 'Cannot block yourself' });
      }

      // Check if user exists
      const userToBlock = await User.findByPk(blockedId);
      if (!userToBlock) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already blocked
      const existingBlock = await BlockedUser.findOne({
        where: { blocker_id: blockerId, blocked_id: blockedId }
      });

      if (existingBlock) {
        return res.status(409).json({ error: 'User already blocked' });
      }

      // Create block record
      await BlockedUser.create({
        blocker_id: blockerId,
        blocked_id: blockedId
      });

      res.json({ message: 'User blocked successfully' });
    } catch (error) {
      next(error);
    }
  });

  // Unblock user
  router.delete('/block/:userId', blockUserValidation, async (req, res, next) => {
    try {
      const blockerId = req.user.id;
      const blockedId = req.params.userId;

      const blockRecord = await BlockedUser.findOne({
        where: { blocker_id: blockerId, blocked_id: blockedId }
      });

      if (!blockRecord) {
        return res.status(404).json({ error: 'User is not blocked' });
      }

      await blockRecord.destroy();

      res.json({ message: 'User unblocked successfully' });
    } catch (error) {
      next(error);
    }
  });

  // Get blocked users
  router.get('/blocked', async (req, res, next) => {
    try {
      const userId = req.user.id;

      const blockedUsers = await BlockedUser.findAll({
        where: { blocker_id: userId },
        include: {
          model: User,
          as: 'blocked',
          attributes: ['id', 'username', 'email', 'avatar_url']
        }
      });

      res.json(blockedUsers.map(block => block.blocked));
    } catch (error) {
      next(error);
    }
  });

  return router;
}