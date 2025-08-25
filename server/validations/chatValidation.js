import Joi from 'joi';

// Send message validation schema
export const sendMessageSchema = Joi.object({
  receiver_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid receiver ID format',
      'any.required': 'Receiver ID is required'
    }),
  
  content: Joi.string()
    .max(5000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Message content cannot exceed 5000 characters'
    }),
  
  message_type: Joi.string()
    .valid('text', 'image', 'voice', 'file')
    .default('text')
    .messages({
      'any.only': 'Invalid message type'
    }),
  
  images: Joi.array()
    .items(Joi.object({
      file_path: Joi.string().required(),
      public_id: Joi.string().required(),
      is_view_once: Joi.boolean().default(false),
      width: Joi.number().optional(),
      height: Joi.number().optional(),
      file_size: Joi.number().optional()
    }))
    .optional(),
  
  voiceMessages: Joi.array()
    .items(Joi.object({
      file_path: Joi.string().required(),
      public_id: Joi.string().required(),
      duration: Joi.number().required(),
      format: Joi.string().default('webm'),
      file_size: Joi.number().optional()
    }))
    .optional()
});

// Edit message validation schema
export const editMessageSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Message content cannot be empty',
      'string.max': 'Message content cannot exceed 5000 characters',
      'any.required': 'Message content is required'
    })
});

// Delete message validation schema
export const deleteMessageSchema = Joi.object({
  forEveryone: Joi.boolean()
    .default(false)
    .optional()
});

// Search messages validation schema
export const searchMessagesSchema = Joi.object({
  q: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search query cannot be empty',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional(),
  
  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .optional(),
  
  userId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.uuid': 'Invalid user ID format'
    })
});

// URL parameter validation schemas
export const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

export const messageIdParamSchema = Joi.object({
  messageId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid message ID format',
      'any.required': 'Message ID is required'
    })
});

export const imageIdParamSchema = Joi.object({
  imageId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid image ID format',
      'any.required': 'Image ID is required'
    })
});