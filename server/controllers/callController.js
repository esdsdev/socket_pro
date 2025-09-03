import { CallHistory, User } from '../models/index.js';
import { Op } from 'sequelize';

class CallController {
  constructor(io, userSockets) {
    this.io = io;
    this.userSockets = userSockets;
  }

  // Initiate a call
  async initiateCall(req, res, next) {
    try {
      const callerId = req.user.id;
      const { receiver_id, call_type } = req.body;

      // Check if receiver exists
      const receiver = await User.findByPk(receiver_id);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      // Create call history record
      const callRecord = await CallHistory.create({
        caller_id: callerId,
        receiver_id,
        call_type,
        call_status: 'missed', // Default to missed, will be updated
        started_at: new Date()
      });

      // Emit call initiation to receiver
      const receiverSockets = this.userSockets.get(receiver_id);
      if (receiverSockets && receiverSockets.size > 0) {
        receiverSockets.forEach(socketId => {
          this.io.to(socketId).emit('call:incoming', {
            callId: callRecord.id,
            caller: {
              id: req.user.id,
              username: req.user.username
            },
            call_type
          });
        });
      }

      res.status(201).json({
        callId: callRecord.id,
        message: 'Call initiated'
      });
    } catch (error) {
      next(error);
    }
  }

  // Answer a call
  async answerCall(req, res, next) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      const callRecord = await CallHistory.findByPk(callId);
      if (!callRecord) {
        return res.status(404).json({ error: 'Call not found' });
      }

      if (callRecord.receiver_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update call status
      await callRecord.update({
        call_status: 'answered'
      });

      // Emit call answered to caller
      const callerSockets = this.userSockets.get(callRecord.caller_id);
      if (callerSockets && callerSockets.size > 0) {
        callerSockets.forEach(socketId => {
          this.io.to(socketId).emit('call:answered', {
            callId: callRecord.id
          });
        });
      }

      res.json({ message: 'Call answered' });
    } catch (error) {
      next(error);
    }
  }

  // Decline a call
  async declineCall(req, res, next) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      const callRecord = await CallHistory.findByPk(callId);
      if (!callRecord) {
        return res.status(404).json({ error: 'Call not found' });
      }

      if (callRecord.receiver_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update call status
      await callRecord.update({
        call_status: 'declined',
        ended_at: new Date()
      });

      // Emit call declined to caller
      const callerSockets = this.userSockets.get(callRecord.caller_id);
      if (callerSockets && callerSockets.size > 0) {
        callerSockets.forEach(socketId => {
          this.io.to(socketId).emit('call:declined', {
            callId: callRecord.id
          });
        });
      }

      res.json({ message: 'Call declined' });
    } catch (error) {
      next(error);
    }
  }

  // End a call
  async endCall(req, res, next) {
    try {
      const { callId } = req.params;
      const { duration } = req.body;
      const userId = req.user.id;

      const callRecord = await CallHistory.findByPk(callId);
      if (!callRecord) {
        return res.status(404).json({ error: 'Call not found' });
      }

      if (callRecord.caller_id !== userId && callRecord.receiver_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update call record
      await callRecord.update({
        duration: duration || 0,
        ended_at: new Date()
      });

      // Emit call ended to other participant
      const otherUserId = callRecord.caller_id === userId ? callRecord.receiver_id : callRecord.caller_id;
      const otherUserSockets = this.userSockets.get(otherUserId);
      if (otherUserSockets && otherUserSockets.size > 0) {
        otherUserSockets.forEach(socketId => {
          this.io.to(socketId).emit('call:ended', {
            callId: callRecord.id
          });
        });
      }

      res.json({ message: 'Call ended' });
    } catch (error) {
      next(error);
    }
  }

  // Get call history
  async getCallHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0 } = req.query;

      const callHistory = await CallHistory.findAll({
        where: {
          [Op.or]: [
            { caller_id: userId },
            { receiver_id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'caller',
            attributes: ['id', 'username', 'avatar_url']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'username', 'avatar_url']
          }
        ],
        order: [['started_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json(callHistory);
    } catch (error) {
      next(error);
    }
  }
}

export default CallController;