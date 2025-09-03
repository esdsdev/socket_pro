import Joi from 'joi';

// Update all settings validation schema
export const updateSettingsSchema = Joi.object({
  read_receipts_enabled: Joi.boolean().optional(),
  online_status_visible: Joi.boolean().optional(),
  typing_indicators_enabled: Joi.boolean().optional(),
  notifications_enabled: Joi.boolean().optional(),
  sound_alerts_enabled: Joi.boolean().optional(),
  auto_download_media: Joi.boolean().optional(),
  max_auto_download_size: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.min': 'Maximum auto-download size must be at least 1MB',
      'number.max': 'Maximum auto-download size cannot exceed 100MB'
    }),
  theme: Joi.string()
    .valid('light', 'dark', 'system')
    .optional()
    .messages({
      'any.only': 'Theme must be light, dark, or system'
    }),
  chat_background: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'Chat background must be a valid URL'
    })
});

// Update single setting validation schema
export const updateSettingSchema = Joi.object({
  setting: Joi.string()
    .valid(
      'read_receipts_enabled',
      'online_status_visible',
      'typing_indicators_enabled',
      'notifications_enabled',
      'sound_alerts_enabled',
      'auto_download_media',
      'max_auto_download_size',
      'theme',
      'chat_background'
    )
    .required()
    .messages({
      'any.only': 'Invalid setting name',
      'any.required': 'Setting name is required'
    }),
  
  value: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.number().integer().min(1).max(100),
      Joi.string().valid('light', 'dark', 'system'),
      Joi.string().uri().allow(null, '')
    )
    .required()
    .messages({
      'any.required': 'Setting value is required'
    })
});