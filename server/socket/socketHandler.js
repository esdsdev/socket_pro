import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Store active connections
const activeConnections = new Map();
const userSockets = new Map(); // userId -> Set of socket IDs

export function socketHandler(io) {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const user = socket.user;

    console.log(`User ${user.username} connected with socket ${socket.id}`);

    // Store connection
    activeConnections.set(socket.id, {
      userId,
      username: user.username,
      connectedAt: new Date()
    });

    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Update user online status
    await user.update({ 
      is_online: true,
      last_seen: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Broadcast user online status to all connected users
    socket.broadcast.emit('user:online', {
      userId,
      username: user.username
    });

    // Send current online users to the newly connected user
    const onlineUsers = Array.from(activeConnections.values()).map(conn => ({
      userId: conn.userId,
      username: conn.username
    }));
    socket.emit('users:online', onlineUsers);

    // Handle message deletion
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, receiverId, forEveryone } = data;

        // Emit to receiver if they're online
        const receiverSockets = userSockets.get(receiverId);
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach(socketId => {
            io.to(socketId).emit('message:deleted', {
              messageId,
              forEveryone,
              deletedBy: userId
            });
          });
        }

        // Confirm deletion
        socket.emit('message:delete:confirmed', { messageId });
      } catch (error) {
        console.error('Message delete error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle message editing
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, receiverId, newContent } = data;

        // Emit to receiver if they're online
        const receiverSockets = userSockets.get(receiverId);
        if (receiverSockets && receiverSockets.size > 0) {
          receiverSockets.forEach(socketId => {
            io.to(socketId).emit('message:edited', {
              messageId,
              newContent,
              editedBy: userId,
              editedAt: new Date().toISOString()
            });
          });
        }

        // Confirm edit
        socket.emit('message:edit:confirmed', { messageId });
      } catch (error) {
        console.error('Message edit error:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { receiverId } = data;
      const receiverSockets = userSockets.get(receiverId);
      
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('typing:start', {
            userId,
            username: user.username
          });
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { receiverId } = data;
      const receiverSockets = userSockets.get(receiverId);
      
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('typing:stop', {
            userId,
            username: user.username
          });
        });
      }
    });

    // Handle read receipts
    socket.on('message:read', (data) => {
      const { messageId, senderId } = data;
      const senderSockets = userSockets.get(senderId);
      
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach(socketId => {
          io.to(socketId).emit('message:read', {
            messageId,
            readBy: userId,
            readAt: new Date().toISOString()
          });
        });
      }
    });

    // Handle view once image viewed
    socket.on('image:viewed', (data) => {
      const { imageId, senderId } = data;
      const senderSockets = userSockets.get(senderId);
      
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach(socketId => {
          io.to(socketId).emit('image:viewed', {
            imageId,
            viewedBy: userId,
            viewedAt: new Date().toISOString()
          });
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      console.log(`User ${user.username} disconnected: ${reason}`);

      // Remove from active connections
      activeConnections.delete(socket.id);

      // Remove socket from user's socket set
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        
        // If user has no more active sockets, mark as offline
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          
          // Update user offline status
          await user.update({ 
            is_online: false,
            last_seen: new Date()
          });

          // Broadcast user offline status
          socket.broadcast.emit('user:offline', {
            userId,
            username: user.username
          });
        }
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${user.username}:`, error);
    });
  });

  // Handle server errors
  io.on('error', (error) => {
    console.error('Socket.io server error:', error);
  });
}

// Export userSockets for use in Express routes
export { userSockets };