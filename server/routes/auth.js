import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema 
} from '../validations/authValidation.js';

const router = express.Router();

// Register
router.post('/register', 
  validateBody(registerSchema), 
  authController.register
);

// Login
router.post('/login', 
  validateBody(loginSchema), 
  authController.login
);

// Refresh token
router.post('/refresh', 
  validateBody(refreshTokenSchema), 
  authController.refreshToken
);

// Logout
router.post('/logout', 
  authenticateToken, 
  authController.logout
);

// Logout from all devices
router.post('/logout-all', 
  authenticateToken, 
  authController.logoutAll
);

// Validate token (for frontend token validation)
router.get('/validate', 
  authenticateToken, 
  authController.validateToken
);

export default router;