import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else if (file.fieldname === 'voice') {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Upload images
router.post('/upload/images', upload.array('image', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const options = {
        folder: 'chat-app/images',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      };

      const result = await uploadToCloudinary(file.buffer, options);
      
      return {
        public_id: result.public_id,
        file_path: result.secure_url,
        width: result.width,
        height: result.height,
        file_size: result.bytes,
        format: result.format
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploaded successfully',
      images: uploadResults
    });
  } catch (error) {
    console.error('Image upload error:', error);
    next(error);
  }
});

// Upload voice messages
router.post('/upload/voice', upload.single('voice'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No voice file provided' });
    }

    const options = {
      folder: 'chat-app/voice',
      resource_type: 'video', // Cloudinary treats audio as video resource type
      format: 'mp3' // Convert to mp3 for better compatibility
    };

    const result = await uploadToCloudinary(req.file.buffer, options);

    res.json({
      message: 'Voice message uploaded successfully',
      voice: {
        public_id: result.public_id,
        file_path: result.secure_url,
        duration: result.duration || 0,
        file_size: result.bytes,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Voice upload error:', error);
    next(error);
  }
});

// Delete media from Cloudinary
router.delete('/delete/:publicId', async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    // Decode the public_id (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      res.json({ message: 'Media deleted successfully' });
    } else {
      res.status(404).json({ error: 'Media not found or already deleted' });
    }
  } catch (error) {
    console.error('Media deletion error:', error);
    next(error);
  }
});

// Get media info
router.get('/info/:publicId', async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.api.resource(decodedPublicId, {
      resource_type: resourceType
    });

    res.json({
      public_id: result.public_id,
      file_path: result.secure_url,
      width: result.width,
      height: result.height,
      file_size: result.bytes,
      format: result.format,
      created_at: result.created_at
    });
  } catch (error) {
    if (error.http_code === 404) {
      return res.status(404).json({ error: 'Media not found' });
    }
    console.error('Media info error:', error);
    next(error);
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files per request.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name.' });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({ error: 'Only image files are allowed.' });
  }
  
  if (error.message.includes('Only audio files are allowed')) {
    return res.status(400).json({ error: 'Only audio files are allowed.' });
  }
  
  next(error);
});

export default router;