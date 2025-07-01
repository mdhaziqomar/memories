const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [events] = await pool.execute(`
      SELECT 
        e.*,
        u.full_name as created_by_name,
        COUNT(m.id) as media_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN media m ON e.id = m.event_id AND m.is_approved = TRUE
      WHERE e.is_active = TRUE
      GROUP BY e.id
      ORDER BY e.event_date DESC
    `);

    res.json({ events });
  } catch (error) {
    console.error('Events list error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await pool.execute(`
      SELECT 
        e.*,
        u.full_name as created_by_name,
        COUNT(m.id) as media_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN media m ON e.id = m.event_id AND m.is_approved = TRUE
      WHERE e.id = ? AND e.is_active = TRUE
      GROUP BY e.id
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: events[0] });
  } catch (error) {
    console.error('Event detail error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('event_date').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, event_date } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO events (name, description, event_date, created_by) VALUES (?, ?, ?, ?)',
      [name, description || null, event_date, req.user.id]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('event_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, event_date } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (event_date !== undefined) {
      updates.push('event_date = ?');
      values.push(event_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE events SET is_active = FALSE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router; 