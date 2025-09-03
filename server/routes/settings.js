import express from 'express';
import settingsController from '../controllers/settingsController.js';
import { validateBody } from '../middleware/validation.js';
import { updateSettingsSchema, updateSettingSchema } from '../validations/settingsValidation.js';

const router = express.Router();

// Get user settings
router.get('/', settingsController.getUserSettings);

// Update all user settings
router.put('/',
  validateBody(updateSettingsSchema),
  settingsController.updateUserSettings
);

// Update specific setting
router.patch('/',
  validateBody(updateSettingSchema),
  settingsController.updateSetting
);

export default router;