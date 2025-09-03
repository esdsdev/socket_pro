import { Sequelize } from 'sequelize';
import config from '../config/database.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: dbConfig.define
  }
);

// Import models
import UserModel from './User.js';
import MessageModel from './Message.js';
import ImageModel from './Image.js';
import VoiceMessageModel from './VoiceMessage.js';
import BlockedUserModel from './BlockedUser.js';
import RefreshTokenModel from './RefreshToken.js';
import CallHistoryModel from './CallHistory.js';
import UserSettingsModel from './UserSettings.js';

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Message = MessageModel(sequelize, Sequelize.DataTypes);
const Image = ImageModel(sequelize, Sequelize.DataTypes);
const VoiceMessage = VoiceMessageModel(sequelize, Sequelize.DataTypes);
const BlockedUser = BlockedUserModel(sequelize, Sequelize.DataTypes);
const RefreshToken = RefreshTokenModel(sequelize, Sequelize.DataTypes);
const CallHistory = CallHistoryModel(sequelize, Sequelize.DataTypes);
const UserSettings = UserSettingsModel(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  User,
  Message,
  Image,
  VoiceMessage,
  BlockedUser,
  RefreshToken,
  CallHistory,
  UserSettings
};

// User associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
User.hasMany(BlockedUser, { foreignKey: 'blocker_id', as: 'blockedUsers' });
User.hasMany(BlockedUser, { foreignKey: 'blocked_id', as: 'blockedBy' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(CallHistory, { foreignKey: 'caller_id', as: 'callsMade' });
User.hasMany(CallHistory, { foreignKey: 'receiver_id', as: 'callsReceived' });
User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.hasMany(Image, { foreignKey: 'message_id', as: 'images' });
Message.hasMany(VoiceMessage, { foreignKey: 'message_id', as: 'voiceMessages' });

// Image associations
Image.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

// Voice message associations
VoiceMessage.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

// Blocked user associations
BlockedUser.belongsTo(User, { foreignKey: 'blocker_id', as: 'blocker' });
BlockedUser.belongsTo(User, { foreignKey: 'blocked_id', as: 'blocked' });

// Refresh token associations
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Call history associations
CallHistory.belongsTo(User, { foreignKey: 'caller_id', as: 'caller' });
CallHistory.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// User settings associations
UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  Sequelize,
  User,
  Message,
  Image,
  VoiceMessage,
  BlockedUser,
  RefreshToken,
  CallHistory,
  UserSettings
};