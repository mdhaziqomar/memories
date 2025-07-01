const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Create thumbnail for images
const createThumbnail = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    return false;
  }
};

// Upload media
router.post('/upload', authenticateToken, upload.single('media'), [
  body('event_id').isInt({ min: 1 }),
  body('taken_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { event_id, taken_date } = req.body;

    // Check if event exists
    const [events] = await pool.execute(
      'SELECT id FROM events WHERE id = ? AND is_active = TRUE',
      [event_id]
    );

    if (events.length === 0) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Event not found' });
    }

    const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
    let thumbnailPath = null;
    let width = null;
    let height = null;

    // Create thumbnail for images
    if (fileType === 'image') {
      try {
        const metadata = await sharp(req.file.path).metadata();
        width = metadata.width;
        height = metadata.height;

        const thumbnailFilename = `thumb_${req.file.filename}`;
        thumbnailPath = path.join(path.dirname(req.file.path), thumbnailFilename);
        
        await createThumbnail(req.file.path, thumbnailPath);
      } catch (error) {
        console.error('Image processing error:', error);
      }
    }

    // Save to database
    const [result] = await pool.execute(
      `INSERT INTO media (
        filename, original_name, file_path, thumbnail_path, file_type, 
        mime_type, file_size, width, height, event_id, uploaded_by, 
        upload_date, taken_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        req.file.filename,
        req.file.originalname,
        req.file.path,
        thumbnailPath,
        fileType,
        req.file.mimetype,
        req.file.size,
        width,
        height,
        event_id,
        req.user.id,
        taken_date || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Media uploaded successfully',
      filename: req.file.filename,
      file_type: fileType
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get media list
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      event_id,
      year,
      month,
      file_type,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE m.is_approved = TRUE';
    const params = [];

    if (event_id) {
      whereClause += ' AND m.event_id = ?';
      params.push(event_id);
    }

    if (year) {
      whereClause += ' AND m.year = ?';
      params.push(year);
    }

    if (month) {
      whereClause += ' AND m.month = ?';
      params.push(month);
    }

    if (file_type) {
      whereClause += ' AND m.file_type = ?';
      params.push(file_type);
    }

    params.push(parseInt(limit), offset);

    const [media] = await pool.execute(`
      SELECT 
        m.*,
        e.name as event_name,
        u.full_name as uploaded_by_name
      FROM media m
      LEFT JOIN events e ON m.event_id = e.id
      LEFT JOIN users u ON m.uploaded_by = u.id
      ${whereClause}
      ORDER BY m.upload_date DESC
      LIMIT ? OFFSET ?
    `, params);

    res.json({ media });
  } catch (error) {
    console.error('Media list error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Get single media item
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [media] = await pool.execute(`
      SELECT 
        m.*,
        e.name as event_name,
        u.full_name as uploaded_by_name
      FROM media m
      LEFT JOIN events e ON m.event_id = e.id
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE m.id = ? AND m.is_approved = TRUE
    `, [id]);

    if (media.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Increment view count
    await pool.execute(
      'UPDATE media SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    res.json(media[0]);
  } catch (error) {
    console.error('Media detail error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Like/unlike media
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [existingLike] = await pool.execute(
      'SELECT id FROM media_likes WHERE media_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingLike.length > 0) {
      await pool.execute(
        'DELETE FROM media_likes WHERE media_id = ? AND user_id = ?',
        [id, req.user.id]
      );
      res.json({ liked: false, message: 'Media unliked' });
    } else {
      await pool.execute(
        'INSERT INTO media_likes (media_id, user_id) VALUES (?, ?)',
        [id, req.user.id]
      );
      res.json({ liked: true, message: 'Media liked' });
    }
  } catch (error) {
    console.error('Like/unlike error:', error);
    res.status(500).json({ error: 'Failed to like/unlike media' });
  }
});

// Tag people in media
router.post('/:id/tag', authenticateToken, [
  body('tagged_user_id').isInt({ min: 1 }),
  body('position_x').optional().isFloat({ min: 0, max: 100 }),
  body('position_y').optional().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { tagged_user_id, position_x, position_y } = req.body;

    // Check if media exists
    const [media] = await pool.execute(
      'SELECT id FROM media WHERE id = ? AND is_approved = TRUE',
      [id]
    );

    if (media.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND is_active = TRUE',
      [tagged_user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add tag
    await pool.execute(
      `INSERT INTO media_tags (media_id, tagged_user_id, tagged_by, position_x, position_y) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE tagged_by = ?, position_x = ?, position_y = ?`,
      [id, tagged_user_id, req.user.id, position_x, position_y, req.user.id, position_x, position_y]
    );

    res.json({ message: 'User tagged successfully' });
  } catch (error) {
    console.error('Tag error:', error);
    res.status(500).json({ error: 'Failed to tag user' });
  }
});

module.exports = router; 