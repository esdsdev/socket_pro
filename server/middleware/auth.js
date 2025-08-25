import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AuthError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
};

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    user_id: userId,
    token: refreshToken,
    expires_at: expiresAt
  });

  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    const refreshTokenRecord = await RefreshToken.findOne({
      where: {
        token,
        user_id: decoded.userId,
        is_revoked: false
      }
    });

    if (!refreshTokenRecord || refreshTokenRecord.expires_at < new Date()) {
      throw new AuthError('Invalid or expired refresh token');
    }

    return decoded.userId;
  } catch (error) {
    throw new AuthError('Invalid refresh token');
  }
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token } }
  );
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId } }
  );
};

export {
  authenticateToken,
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  AuthError
};