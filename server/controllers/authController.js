import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { 
  generateTokens, 
  verifyRefreshToken, 
  revokeRefreshToken,
  revokeAllUserTokens 
} from '../middleware/auth.js';

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          details: existingUser.email === email ? 'Email already registered' : 'Username already taken'
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password
      });

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user.id);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        token: accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update online status
      await user.update({ 
        is_online: true,
        last_seen: new Date()
      });

      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(user.id);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token: accessToken,
        refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const userId = await verifyRefreshToken(refreshToken);

      // Revoke old refresh token
      await revokeRefreshToken(refreshToken);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await generateTokens(userId);

      res.json({
        token: accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      // Update user offline status
      await req.user.update({ 
        is_online: false,
        last_seen: new Date()
      });

      // Revoke refresh token if provided
      if (refreshToken) {
        await revokeRefreshToken(refreshToken);
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  // Logout from all devices
  async logoutAll(req, res, next) {
    try {
      // Update user offline status
      await req.user.update({ 
        is_online: false,
        last_seen: new Date()
      });

      // Revoke all refresh tokens for user
      await revokeAllUserTokens(req.user.id);

      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }

  // Validate token
  async validateToken(req, res) {
    res.json({
      valid: true,
      user: req.user.toJSON()
    });
  }
}

export default new AuthController();